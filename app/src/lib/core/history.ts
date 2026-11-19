// Common, chronological history of document changes (DAN-03, P4, ADR-009). Every change of the
// document goes through here: layer commands of plugins and the core's own layer operations
// (order and opacity, D12). The number of undo steps is limited (D6) and continuous changes,
// such as dragging a slider, can be merged into one step.
import { Emitter } from './emitter';

/** Default number of undo steps (DAN-03). */
export const DEFAULT_HISTORY_LIMIT = 50;
/** Allowed range of the undo limit set by the user (D6). */
export const MIN_HISTORY_LIMIT = 10;
export const MAX_HISTORY_LIMIT = 500;

/** Tells whether a value is a valid undo limit (an integer from the D6 range). */
export function isHistoryLimit(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_HISTORY_LIMIT &&
    value <= MAX_HISTORY_LIMIT
  );
}

/** Brings any number into the D6 range (rounded to an integer). */
export function clampHistoryLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_HISTORY_LIMIT;
  return Math.min(MAX_HISTORY_LIMIT, Math.max(MIN_HISTORY_LIMIT, Math.round(value)));
}

/** One undoable change. */
export interface HistoryEntry {
  apply(): void;
  revert(): void;
  /**
   * Takes over a change that directly follows this one (already applied), so both are undone
   * in one step. Returns false when the change cannot be merged.
   */
  merge?(next: HistoryEntry): boolean;
}

export interface ExecuteOptions {
  /**
   * The change is part of a continuous operation (e.g. dragging a slider): it is merged into the
   * previous entry when that entry was also executed with `merge` and accepts it, until
   * {@link History.seal} is called.
   */
  readonly merge?: boolean;
}

export class History {
  private done: HistoryEntry[] = [];
  private undone: HistoryEntry[] = [];
  private stepLimit: number;
  /** The last entry may still take over merged changes. */
  private open = false;
  readonly changed = new Emitter();

  constructor(limit = DEFAULT_HISTORY_LIMIT) {
    this.stepLimit = clampHistoryLimit(limit);
  }

  /** Maximum number of undo steps. */
  get limit(): number {
    return this.stepLimit;
  }

  /** Sets the number of undo steps (clamped to D6); the oldest entries over it are dropped. */
  setLimit(limit: number): void {
    this.stepLimit = clampHistoryLimit(limit);
    this.trim();
    this.changed.emit();
  }

  /** Applies the entry and records it. If `apply` throws, nothing is recorded. */
  execute(entry: HistoryEntry, options: ExecuteOptions = {}): void {
    entry.apply();
    const last = this.done.at(-1);
    const merged = options.merge === true && this.open && last?.merge?.(entry) === true;
    if (!merged) this.done.push(entry);
    this.open = options.merge === true;
    this.undone = [];
    this.trim();
    this.changed.emit();
  }

  /** Ends a continuous operation: the next change starts a new undo step. */
  seal(): void {
    this.open = false;
  }

  get canUndo(): boolean {
    return this.done.length > 0;
  }

  get canRedo(): boolean {
    return this.undone.length > 0;
  }

  /** Number of steps that can be undone. */
  get undoCount(): number {
    return this.done.length;
  }

  /** Number of steps that can be redone. */
  get redoCount(): number {
    return this.undone.length;
  }

  /** The entry that the next undo or redo would affect. */
  peek(direction: 'undo' | 'redo'): HistoryEntry | undefined {
    return (direction === 'undo' ? this.done : this.undone).at(-1);
  }

  undo(): boolean {
    this.open = false;
    const entry = this.done.pop();
    if (!entry) return false;
    this.run(() => entry.revert());
    this.undone.push(entry);
    this.changed.emit();
    return true;
  }

  redo(): boolean {
    this.open = false;
    const entry = this.undone.pop();
    if (!entry) return false;
    this.run(() => entry.apply());
    this.done.push(entry);
    this.changed.emit();
    return true;
  }

  /** An entry that fails while undoing or redoing is dropped: it cannot be repeated reliably. */
  private run(step: () => void): void {
    try {
      step();
    } catch (error) {
      this.changed.emit();
      throw error;
    }
  }

  /** Drops entries matching the predicate (e.g. of a layer whose plugin stopped working). */
  discard(predicate: (entry: HistoryEntry) => boolean): void {
    this.done = this.done.filter((entry) => !predicate(entry));
    this.undone = this.undone.filter((entry) => !predicate(entry));
    this.open = false;
    this.changed.emit();
  }

  /** Drops the oldest entries over the limit (the oldest undo steps and the farthest redos). */
  private trim(): void {
    if (this.done.length > this.stepLimit) {
      this.done.splice(0, this.done.length - this.stepLimit);
    }
    if (this.undone.length > this.stepLimit) {
      this.undone.splice(0, this.undone.length - this.stepLimit);
    }
  }
}
