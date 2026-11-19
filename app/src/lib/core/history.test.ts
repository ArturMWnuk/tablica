// Unit tests of the common undo history (DAN-03) and of the multi-finger tap (D3).
import { describe, expect, it, vi } from 'vitest';
import {
  clampHistoryLimit,
  DEFAULT_HISTORY_LIMIT,
  History,
  type HistoryEntry,
  isHistoryLimit,
  MAX_HISTORY_LIMIT,
  MIN_HISTORY_LIMIT,
} from './history';
import { TapGestureRecognizer, type TouchSample } from './tap-gesture';

/** A counter changed by entries: each entry adds `amount`. */
function counter() {
  const state = { value: 0 };
  const add = (amount: number): HistoryEntry & { amount: number } => ({
    amount,
    apply: () => {
      state.value += amount;
    },
    revert: () => {
      state.value -= amount;
    },
  });
  return { state, add };
}

/** An entry that sets a value and merges with following entries of the same kind. */
function setter(state: { value: number }, from: number, to: number) {
  const entry = {
    kind: 'set',
    to,
    apply: () => {
      state.value = entry.to;
    },
    revert: () => {
      state.value = from;
    },
    merge(next: HistoryEntry): boolean {
      if (!('kind' in next) || next.kind !== 'set') return false;
      entry.to = (next as typeof entry).to;
      return true;
    },
  };
  return entry;
}

describe('DAN-03: undo limit', () => {
  it('DAN-03: the default limit is 50 steps', () => {
    expect(new History().limit).toBe(DEFAULT_HISTORY_LIMIT);
    expect(DEFAULT_HISTORY_LIMIT).toBe(50);
  });

  it('DAN-03: 50 operations can all be undone', () => {
    const { state, add } = counter();
    const history = new History();
    for (let index = 1; index <= 50; index += 1) history.execute(add(index));
    expect(history.undoCount).toBe(50);
    while (history.undo()) {
      // undo everything
    }
    expect(state.value).toBe(0);
  });

  it('DAN-03: the 51st operation drops the oldest one', () => {
    const { state, add } = counter();
    const history = new History();
    for (let index = 1; index <= 51; index += 1) history.execute(add(index));
    expect(history.undoCount).toBe(50);
    let undone = 0;
    while (history.undo()) undone += 1;
    expect(undone).toBe(50);
    // Only the oldest operation (+1) stays applied: it can no longer be undone.
    expect(state.value).toBe(1);
  });

  it('DAN-03: the limit is set in the range 10–500 (D6)', () => {
    const history = new History();
    history.setLimit(200);
    expect(history.limit).toBe(200);
    history.setLimit(5);
    expect(history.limit).toBe(MIN_HISTORY_LIMIT);
    history.setLimit(10_000);
    expect(history.limit).toBe(MAX_HISTORY_LIMIT);
    expect(clampHistoryLimit(Number.NaN)).toBe(DEFAULT_HISTORY_LIMIT);
    expect(clampHistoryLimit(33.4)).toBe(33);
    expect([9, 10, 500, 501, 12.5, '50'].map(isHistoryLimit)).toEqual([
      false,
      true,
      true,
      false,
      false,
      false,
    ]);
  });

  it('DAN-03: lowering the limit drops the oldest steps', () => {
    const { state, add } = counter();
    const history = new History();
    for (let index = 1; index <= 30; index += 1) history.execute(add(1));
    history.setLimit(10);
    expect(history.undoCount).toBe(10);
    while (history.undo()) {
      // undo everything that is left
    }
    expect(state.value).toBe(20);
  });

  it('DAN-03: a higher limit keeps more steps', () => {
    const { add } = counter();
    const history = new History(120);
    for (let index = 1; index <= 130; index += 1) history.execute(add(1));
    expect(history.undoCount).toBe(120);
  });
});

describe('DAN-03: undo and redo', () => {
  it('DAN-03: undo and redo go back and forth through the operations', () => {
    const { state, add } = counter();
    const history = new History();
    history.execute(add(1));
    history.execute(add(10));
    expect(history.undo()).toBe(true);
    expect(state.value).toBe(1);
    expect(history.redo()).toBe(true);
    expect(state.value).toBe(11);
    expect(history.redo()).toBe(false);
  });

  it('DAN-03: a new operation after undo clears the redo steps', () => {
    const { add } = counter();
    const history = new History();
    history.execute(add(1));
    history.undo();
    expect(history.canRedo).toBe(true);
    history.execute(add(2));
    expect(history.canRedo).toBe(false);
  });

  it('DAN-03: an operation whose apply fails is not recorded', () => {
    const history = new History();
    expect(() =>
      history.execute({
        apply: () => {
          throw new Error('fail');
        },
        revert: () => undefined,
      }),
    ).toThrow('fail');
    expect(history.canUndo).toBe(false);
  });

  it('DAN-03: listeners learn about every change of the history', () => {
    const { add } = counter();
    const history = new History();
    const listener = vi.fn();
    history.changed.subscribe(listener);
    history.execute(add(1));
    history.undo();
    history.redo();
    history.setLimit(20);
    expect(listener).toHaveBeenCalledTimes(4);
  });
});

describe('DAN-03: merging continuous changes', () => {
  it('DAN-03: changes made with merge form one undo step until the history is sealed', () => {
    const state = { value: 0 };
    const history = new History();
    history.execute(setter(state, 0, 1), { merge: true });
    history.execute(setter(state, 1, 2), { merge: true });
    history.execute(setter(state, 2, 3), { merge: true });
    history.seal();
    history.execute(setter(state, 3, 4), { merge: true });
    expect(state.value).toBe(4);
    expect(history.undoCount).toBe(2);
    history.undo();
    expect(state.value).toBe(3);
    history.undo();
    expect(state.value).toBe(0);
    history.redo();
    expect(state.value).toBe(3);
  });

  it('DAN-03: changes without merge are never merged', () => {
    const state = { value: 0 };
    const history = new History();
    history.execute(setter(state, 0, 1));
    history.execute(setter(state, 1, 2), { merge: true });
    history.execute(setter(state, 2, 3));
    expect(history.undoCount).toBe(3);
  });

  it('DAN-03: a merged change that ends where it started is dropped', () => {
    const state = { value: 0 };
    const history = new History();
    const empty = (from: number, to: number) => ({
      ...setter(state, from, to),
      isEmpty: () => state.value === from,
    });
    history.execute(empty(0, 1), { merge: true });
    history.execute(setter(state, 1, 0), { merge: true });
    expect(state.value).toBe(0);
    expect(history.canUndo).toBe(false);
  });

  it('DAN-03: undo ends merging', () => {
    const state = { value: 0 };
    const { add } = counter();
    const history = new History();
    history.execute(add(1));
    history.execute(setter(state, 0, 1), { merge: true });
    history.undo();
    history.execute(setter(state, 0, 2), { merge: true });
    expect(history.undoCount).toBe(2);
  });
});

describe('DAN-03: tap gestures (D3)', () => {
  function tap(fingers: number, options: { move?: number; duration?: number } = {}) {
    const samples: TouchSample[] = [];
    for (let id = 1; id <= fingers; id += 1) {
      samples.push({ type: 'down', pointerId: id, x: id * 50, y: 100, time: id });
    }
    if (options.move) {
      samples.push({ type: 'move', pointerId: 1, x: 50 + options.move, y: 100, time: 20 });
    }
    const end = options.duration ?? 120;
    for (let id = 1; id <= fingers; id += 1) {
      samples.push({
        type: 'up',
        pointerId: id,
        x: id * 50 + (id === 1 ? (options.move ?? 0) : 0),
        y: 100,
        time: end + id,
      });
    }
    return samples;
  }

  function recognize(samples: readonly TouchSample[]): number[] {
    const taps: number[] = [];
    const recognizer = new TapGestureRecognizer((fingers) => taps.push(fingers));
    for (const sample of samples) recognizer.handle(sample);
    return taps;
  }

  it('DAN-03: a tap with two or three fingers is recognized with its number of fingers', () => {
    expect(recognize(tap(2))).toEqual([2]);
    expect(recognize(tap(3))).toEqual([3]);
    expect(recognize([...tap(2), ...tap(3)])).toEqual([2, 3]);
  });

  it('DAN-03: one finger, moving fingers and a long touch are not taps', () => {
    expect(recognize(tap(1))).toEqual([]);
    expect(recognize(tap(2, { move: 40 }))).toEqual([]);
    expect(recognize(tap(2, { duration: 900 }))).toEqual([]);
  });

  it('DAN-03: a cancelled touch is not a tap', () => {
    const samples = tap(2);
    const index = samples.findIndex((sample) => sample.type === 'up');
    samples[index] = { ...samples[index]!, type: 'cancel' };
    expect(recognize(samples)).toEqual([]);
  });
});
