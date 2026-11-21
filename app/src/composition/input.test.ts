// @vitest-environment happy-dom
// Input pipeline: pen, fingers, mouse and keyboard routed to the active tool or the view
// (WEJ-01, WEJ-03–06, NF-04, D3, D4, D5).
import { defineLayerPlugin, type ToolPointerEvent } from '@tablica/plugin-api';
import fixtureManifest from '@tablica/test-fixture-layer/manifest.json';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Board } from '../lib/core/board';
import {
  type InputPointer,
  type InputPointerEvent,
  MAX_ZOOM,
  MIN_ZOOM,
  PALM_REJECTION_MS,
  tiltOf,
  toInputEvent,
} from '../lib/core/input-router';
import { LATENCY_THRESHOLD_MS, LatencyMeter } from '../lib/core/latency';
import type { PluginSource } from '../lib/core/plugin-manager';
import { isControl, isTextField, releasePointerFocus } from '../lib/ui/focus';
import { builtinPlugins, DEFAULT_TOOL } from './builtin';
import { createTestBoard, documentOf, layerOf } from './test-support';

let drawn: ToolPointerEvent[] = [];
let erased: ToolPointerEvent[] = [];

const recorder = defineLayerPlugin<{ count: number }>({
  schemaVersion: 1,
  createData: () => ({ count: 0 }),
  serialize: (data) => ({ count: data.count }),
  deserialize: () => ({ count: 0 }),
  activate(context) {
    context.registerTool({ id: 'draw', labelKey: 'draw', onPointer: (event) => drawn.push(event) });
    context.registerTool({
      id: 'erase',
      labelKey: 'erase',
      onPointer: (event) => erased.push(event),
    });
  },
  mountLayer: () => ({ render: () => undefined }),
});

const recorderSource: PluginSource = {
  manifest: {
    ...fixtureManifest,
    id: 'recorder',
    apiVersion: '1.1.0',
  },
  load: () => Promise.resolve({ default: recorder }),
};
const fixtureSource: PluginSource = {
  manifest: fixtureManifest,
  load: () => import('@tablica/test-fixture-layer'),
};

let time = 10_000;

function pointer(
  pointerType: 'pen' | 'touch' | 'mouse',
  pointerId: number,
  x: number,
  y: number,
  extra: Partial<InputPointerEvent> = {},
): InputPointerEvent {
  return {
    pointerId,
    pointerType,
    x,
    y,
    pressure: pointerType === 'mouse' ? 0.5 : 0.8,
    tiltX: 0,
    tiltY: 0,
    buttons: 1,
    button: 0,
    timeStamp: time,
    coalesced: [],
    predicted: [],
    ...extra,
  };
}

async function recorderBoard(): Promise<Board> {
  const board = createTestBoard(
    [recorderSource, fixtureSource],
    documentOf(layerOf('recorder', 'r')),
  );
  await board.loadLayers();
  board.tools.setActive('recorder/draw');
  return board;
}

/** Pen touches the board at `x` and is lifted; time moves on past the palm rejection window. */
function penStroke(board: Board, x = 5): void {
  board.input.pointerDown(pointer('pen', 9, x, x));
  board.input.pointerUp(pointer('pen', 9, x, x, { buttons: 0 }));
  board.input.pointerLeave({ pointerType: 'pen', timeStamp: time });
  time += PALM_REJECTION_MS + 1;
}

function phases(events: readonly ToolPointerEvent[]): string[] {
  return events.map((event) => event.phase);
}

beforeEach(() => {
  drawn = [];
  erased = [];
  time += 10_000;
});

describe('WEJ-01: pointer types', () => {
  it('WEJ-01: pen, touch and mouse events reach the active tool with their pointer type', async () => {
    const board = await recorderBoard();
    for (const [type, id] of [
      ['mouse', 1],
      ['touch', 2],
      ['pen', 3],
    ] as const) {
      board.input.pointerDown(pointer(type, id, 10, 20));
      board.input.pointerMove(pointer(type, id, 15, 25));
      board.input.pointerUp(pointer(type, id, 15, 25, { buttons: 0 }));
      time += PALM_REJECTION_MS + 1;
    }
    expect(drawn.map((event) => `${event.pointerType}:${event.phase}`)).toEqual([
      'mouse:down',
      'mouse:move',
      'mouse:up',
      'touch:down',
      'touch:move',
      'touch:up',
      'pen:down',
      'pen:move',
      'pen:up',
    ]);
  });

  it('WEJ-01: positions are converted to the board through the camera', async () => {
    const board = await recorderBoard();
    board.camera.set({ x: 100, y: 50, zoom: 2 });
    board.input.pointerDown(pointer('pen', 3, 120, 90));
    expect(drawn[0]?.screen).toEqual({ x: 120, y: 90 });
    expect(drawn[0]?.world).toEqual({ x: 10, y: 20 });
  });
});

describe('WEJ-03: touch screen', () => {
  it('WEJ-03: one finger draws with the active tool while the pen was not used (D4)', async () => {
    const board = await recorderBoard();
    board.input.pointerDown(pointer('touch', 1, 10, 10));
    board.input.pointerMove(pointer('touch', 1, 40, 10));
    board.input.pointerUp(pointer('touch', 1, 40, 10));
    expect(phases(drawn)).toEqual(['down', 'move', 'up']);
    expect(board.camera.state).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('WEJ-03: two fingers move and zoom the view and do not draw', async () => {
    const board = await recorderBoard();
    board.input.pointerDown(pointer('touch', 1, 100, 100));
    board.input.pointerDown(pointer('touch', 2, 200, 100));
    // The stroke started by the first finger is dropped.
    expect(phases(drawn)).toEqual(['down', 'cancel']);
    // Both fingers move right by 30 px: the view moves.
    board.input.pointerMove(pointer('touch', 1, 130, 100));
    board.input.pointerMove(pointer('touch', 2, 230, 100));
    expect(board.camera.state.x).toBeCloseTo(30);
    expect(board.camera.state.zoom).toBeCloseTo(1);
    // Fingers spread to twice the distance around the same centre: the view zooms 2×.
    board.input.pointerMove(pointer('touch', 1, 80, 100));
    board.input.pointerMove(pointer('touch', 2, 280, 100));
    expect(board.camera.state.zoom).toBeCloseTo(2);
    // The board point under the centre of the fingers stays there.
    expect(board.camera.screenToWorld({ x: 180, y: 100 }).x).toBeCloseTo(150);
    board.input.pointerUp(pointer('touch', 1, 80, 100));
    board.input.pointerUp(pointer('touch', 2, 280, 100));
    expect(phases(drawn)).toEqual(['down', 'cancel']);
  });

  it('WEJ-03: a finger left after a two-finger gesture does not start drawing', async () => {
    const board = await recorderBoard();
    board.input.pointerDown(pointer('touch', 1, 100, 100));
    board.input.pointerDown(pointer('touch', 2, 200, 100));
    board.input.pointerUp(pointer('touch', 2, 200, 100));
    board.input.pointerMove(pointer('touch', 1, 150, 120));
    expect(phases(drawn)).toEqual(['down', 'cancel']);
    expect(board.camera.state.x).toBeCloseTo(50);
  });

  it('WEJ-03: a two-finger tap undoes and a three-finger tap redoes (D3), without drawing', async () => {
    // The pen of the drawing layer: a stroke becomes an undo step when the pointer is lifted.
    const board = createTestBoard(builtinPlugins, documentOf(layerOf('layer-drawing', 'd')));
    await board.loadLayers();
    board.tools.setActive(DEFAULT_TOOL);
    board.input.pointerDown(pointer('mouse', 1, 5, 5));
    board.input.pointerUp(pointer('mouse', 1, 5, 5, { buttons: 0 }));
    expect(board.history.canUndo).toBe(true);
    board.input.pointerDown(pointer('touch', 1, 50, 50));
    board.input.pointerDown(pointer('touch', 2, 80, 50));
    time += 100;
    board.input.pointerUp(pointer('touch', 1, 50, 50));
    board.input.pointerUp(pointer('touch', 2, 80, 50));
    expect(board.history.canUndo).toBe(false);
    expect(board.history.canRedo).toBe(true);
    for (const id of [1, 2, 3]) board.input.pointerDown(pointer('touch', id, id * 20, 50));
    time += 100;
    for (const id of [1, 2, 3]) board.input.pointerUp(pointer('touch', id, id * 20, 50));
    expect(board.history.canUndo).toBe(true);
    expect(board.history.canRedo).toBe(false);
  });
});

describe('WEJ-04: mouse and keyboard', () => {
  it('WEJ-04: the left button uses the tool; other buttons do not', async () => {
    const board = await recorderBoard();
    expect(board.input.pointerDown(pointer('mouse', 1, 10, 10, { button: 2, buttons: 2 }))).toBe(
      false,
    );
    board.input.pointerDown(pointer('mouse', 1, 10, 10));
    board.input.pointerUp(pointer('mouse', 1, 10, 10, { buttons: 0 }));
    expect(phases(drawn)).toEqual(['down', 'up']);
  });

  it('WEJ-04: the wheel scrolls the view and Ctrl + wheel zooms at the pointer', async () => {
    const board = await recorderBoard();
    board.input.wheel({ x: 0, y: 0, deltaX: 10, deltaY: 40, deltaMode: 0, ctrlKey: false });
    expect(board.camera.state).toEqual({ x: -10, y: -40, zoom: 1 });
    board.input.wheel({ x: 0, y: 0, deltaX: 0, deltaY: 3, deltaMode: 1, ctrlKey: false });
    expect(board.camera.state.y).toBe(-88);
    board.camera.set({ x: 0, y: 0, zoom: 1 });
    const anchor = { x: 300, y: 200 };
    const before = board.camera.screenToWorld(anchor);
    board.input.wheel({ ...anchor, deltaX: 0, deltaY: -100, deltaMode: 0, ctrlKey: true });
    expect(board.camera.state.zoom).toBeGreaterThan(1);
    const after = board.camera.screenToWorld(anchor);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
    board.input.wheel({ ...anchor, deltaX: 0, deltaY: 300, deltaMode: 0, ctrlKey: true });
    expect(board.camera.state.zoom).toBeLessThan(1);
    expect(drawn).toEqual([]);
  });

  it('WEJ-04: zoom stays within 10–1000 % (D5)', async () => {
    const board = await recorderBoard();
    for (let step = 0; step < 50; step += 1) {
      board.input.wheel({ x: 0, y: 0, deltaX: 0, deltaY: -500, deltaMode: 0, ctrlKey: true });
    }
    expect(board.camera.state.zoom).toBe(MAX_ZOOM);
    for (let step = 0; step < 100; step += 1) {
      board.input.wheel({ x: 0, y: 0, deltaX: 0, deltaY: 500, deltaMode: 0, ctrlKey: true });
    }
    expect(board.camera.state.zoom).toBe(MIN_ZOOM);
  });

  it('WEJ-04: the middle button moves the view without drawing', async () => {
    const board = await recorderBoard();
    expect(board.input.pointerDown(pointer('mouse', 1, 10, 10, { button: 1, buttons: 4 }))).toBe(
      true,
    );
    board.input.pointerMove(pointer('mouse', 1, 50, 30, { buttons: 4 }));
    board.input.pointerUp(pointer('mouse', 1, 50, 30, { button: 1, buttons: 0 }));
    expect(board.camera.state).toEqual({ x: 40, y: 20, zoom: 1 });
    expect(drawn).toEqual([]);
  });

  it('WEJ-04: Space held with the left button moves the view without drawing', async () => {
    const board = await recorderBoard();
    expect(board.input.keyDown({ code: 'Space' })).toBe(true);
    board.input.pointerDown(pointer('mouse', 1, 10, 10));
    board.input.pointerMove(pointer('mouse', 1, 0, 30));
    board.input.pointerUp(pointer('mouse', 1, 0, 30, { buttons: 0 }));
    expect(board.camera.state).toEqual({ x: -10, y: 20, zoom: 1 });
    expect(drawn).toEqual([]);
    board.input.keyUp({ code: 'Space' });
    board.input.pointerDown(pointer('mouse', 1, 10, 10));
    expect(phases(drawn)).toEqual(['down']);
    expect(board.input.keyDown({ code: 'KeyA' })).toBe(false);
  });

  it('WEJ-04: a toolbar button clicked with the mouse does not keep Space (focus on the button)', () => {
    document.body.innerHTML =
      '<div role="toolbar"><button type="button">Pen</button></div><input type="text" />';
    const button = document.querySelector('button');
    const field = document.querySelector('input');
    if (!button || !field) throw new Error('No test controls');
    window.addEventListener('click', releasePointerFocus);
    try {
      // Mouse click (detail 1): the focus goes back to the page, so Space reaches the board.
      button.focus();
      expect(isControl(document.activeElement)).toBe(true);
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      expect(document.activeElement).toBe(document.body);
      expect(isControl(document.activeElement)).toBe(false);
      // Keyboard activation (detail 0): the button keeps the focus and its own Space.
      button.focus();
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
      expect(document.activeElement).toBe(button);
      expect(isControl(document.activeElement)).toBe(true);
      // A click that moved the focus elsewhere (here: into a text field) is left alone.
      button.addEventListener('click', () => field.focus(), { once: true });
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      expect(document.activeElement).toBe(field);
      expect(isTextField(document.activeElement)).toBe(true);
    } finally {
      window.removeEventListener('click', releasePointerFocus);
      document.body.innerHTML = '';
    }
  });

  it('WEJ-04: a slider or a checkbox clicked with the mouse does not keep Space', () => {
    document.body.innerHTML =
      '<input type="range" min="1" max="50" /><label><input type="checkbox" /><span>D4</span></label><select><option>pl</option></select><input type="text" />';
    const slider = document.querySelector<HTMLInputElement>('input[type=range]');
    const check = document.querySelector<HTMLInputElement>('input[type=checkbox]');
    const label = document.querySelector('span');
    const list = document.querySelector('select');
    const field = document.querySelector<HTMLInputElement>('input[type=text]');
    if (!slider || !check || !label || !list || !field) throw new Error('No test controls');
    window.addEventListener('click', releasePointerFocus);
    try {
      // The slider moved with the mouse gives the focus back, so Space reaches the board.
      slider.focus();
      slider.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      expect(document.activeElement).toBe(document.body);
      expect(isControl(document.activeElement)).toBe(false);
      // The same for a checkbox, also when the click lands on its label (the browser moves the
      // focus to the checkbox, so the click reports the label as its target).
      check.focus();
      label.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      expect(document.activeElement).toBe(document.body);
      // Keyboard use is unchanged: the control keeps the focus and its own Space.
      slider.focus();
      slider.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
      expect(document.activeElement).toBe(slider);
      // A list keeps the focus, because Space opens it; a text field keeps its own keys.
      list.focus();
      list.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      expect(document.activeElement).toBe(list);
      field.focus();
      field.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
      expect(document.activeElement).toBe(field);
    } finally {
      window.removeEventListener('click', releasePointerFocus);
      document.body.innerHTML = '';
    }
  });
});

describe('WEJ-05: pressure, tilt and the eraser end', () => {
  it('WEJ-05: the pen passes its pressure; mouse and fingers draw at the nominal 0.5', async () => {
    const board = await recorderBoard();
    board.input.pointerDown(pointer('pen', 3, 1, 1, { pressure: 0.9 }));
    board.input.pointerMove(pointer('pen', 3, 2, 2, { pressure: 1.7 }));
    board.input.pointerUp(pointer('pen', 3, 2, 2, { pressure: 0, buttons: 0 }));
    time += PALM_REJECTION_MS + 1;
    board.input.pointerLeave({ pointerType: 'pen', timeStamp: time - PALM_REJECTION_MS - 1 });
    board.input.pointerDown(pointer('mouse', 1, 1, 1, { pressure: 0.2 }));
    board.input.pointerUp(pointer('mouse', 1, 1, 1, { buttons: 0 }));
    board.input.settings.penDisablesFingerDrawing = false;
    board.input.pointerDown(pointer('touch', 2, 1, 1, { pressure: 1 }));
    expect(drawn.map((event) => event.pressure)).toEqual([0.9, 1, 0, 0.5, 0.5, 0.5]);
  });

  it('WEJ-05: tilt is read from the altitude angle or from tiltX / tiltY', async () => {
    expect(tiltOf({ tiltX: 0, tiltY: 0 })).toBe(0);
    expect(tiltOf({ tiltX: 60, tiltY: 0 })).toBeCloseTo(60);
    expect(tiltOf({ tiltX: 0, tiltY: -30 })).toBeCloseTo(30);
    expect(tiltOf({ tiltX: 45, tiltY: 45 })).toBeCloseTo(54.74, 1);
    expect(tiltOf({ tiltX: 89, tiltY: 0 })).toBeCloseTo(89);
    // Exactly 90° (a pen lying flat) is a missing value: WebKit gives it for pens without tilt.
    expect(tiltOf({ tiltX: 90, tiltY: 0 })).toBe(0);
    expect(tiltOf({ tiltX: 0, tiltY: -90 })).toBe(0);
    expect(tiltOf({ tiltX: 0, tiltY: 0, altitudeAngle: Math.PI / 2 })).toBeCloseTo(0);
    expect(tiltOf({ tiltX: 0, tiltY: 0, altitudeAngle: Math.PI / 6 })).toBeCloseTo(60);
    const board = await recorderBoard();
    board.input.pointerDown(pointer('pen', 3, 1, 1, { tiltX: 60 }));
    board.input.pointerUp(pointer('pen', 3, 1, 1, { tiltX: 60, buttons: 0 }));
    time += PALM_REJECTION_MS + 1;
    board.input.pointerDown(pointer('mouse', 1, 1, 1, { tiltX: 60 }));
    expect(drawn.map((event) => Math.round(event.tilt))).toEqual([60, 60, 0]);
  });

  it('WEJ-05: the eraser end switches to the eraser for the contact and back afterwards', async () => {
    const board = await recorderBoard();
    board.input.eraserTool = 'recorder/erase';
    board.input.pointerDown(pointer('pen', 3, 1, 1, { buttons: 32 }));
    expect(board.tools.active?.key).toBe('recorder/erase');
    board.input.pointerMove(pointer('pen', 3, 5, 5, { buttons: 32 }));
    board.input.pointerUp(pointer('pen', 3, 5, 5, { buttons: 0 }));
    expect(board.tools.active?.key).toBe('recorder/draw');
    expect(phases(erased)).toEqual(['down', 'move', 'up']);
    expect(drawn).toEqual([]);
    // The tip of the pen draws again with the previous tool.
    board.input.pointerDown(pointer('pen', 3, 1, 1));
    expect(phases(drawn)).toEqual(['down']);
  });

  it('WEJ-05: without an eraser tool the eraser end and the pen button do not draw', async () => {
    const board = await recorderBoard();
    board.input.pointerDown(pointer('pen', 3, 1, 1, { buttons: 32 }));
    board.input.pointerMove(pointer('pen', 3, 5, 5, { buttons: 32 }));
    board.input.pointerUp(pointer('pen', 3, 5, 5, { buttons: 0 }));
    board.input.pointerDown(pointer('pen', 3, 1, 1, { buttons: 3 }));
    board.input.pointerUp(pointer('pen', 3, 1, 1, { buttons: 0 }));
    expect(drawn).toEqual([]);
    expect(board.tools.active?.key).toBe('recorder/draw');
  });
});

describe('WEJ-06: palm rejection', () => {
  it('WEJ-06: touches do not draw while the pen touches the board', async () => {
    const board = await recorderBoard();
    board.input.settings.penDisablesFingerDrawing = false;
    board.input.pointerDown(pointer('pen', 3, 1, 1));
    board.input.pointerDown(pointer('touch', 1, 50, 50));
    board.input.pointerMove(pointer('touch', 1, 90, 90));
    board.input.pointerUp(pointer('touch', 1, 90, 90));
    expect(drawn.every((event) => event.pointerType === 'pen')).toBe(true);
    expect(board.camera.state).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('WEJ-06: touches do not draw while the pen hovers in range or within 500 ms of it', async () => {
    const board = await recorderBoard();
    board.input.settings.penDisablesFingerDrawing = false;
    // Hover: the pen moves without contact.
    board.input.pointerMove(pointer('pen', 3, 1, 1, { buttons: 0 }));
    time += 2000;
    board.input.pointerDown(pointer('touch', 1, 50, 50));
    board.input.pointerUp(pointer('touch', 1, 50, 50));
    // The pen leaves the range; touches stay ignored for 500 ms after its last event.
    board.input.pointerLeave({ pointerType: 'pen', timeStamp: time });
    time += PALM_REJECTION_MS;
    board.input.pointerDown(pointer('touch', 2, 50, 50));
    board.input.pointerUp(pointer('touch', 2, 50, 50));
    expect(drawn).toEqual([]);
    time += 1;
    board.input.pointerDown(pointer('touch', 4, 50, 50));
    expect(phases(drawn)).toEqual(['down']);
    expect(board.input.palmRejectionActive(time)).toBe(false);
  });

  it('WEJ-06: a finger stroke in progress is dropped when the pen lands', async () => {
    const board = await recorderBoard();
    board.input.pointerDown(pointer('touch', 1, 50, 50));
    board.input.pointerMove(pointer('touch', 1, 60, 60));
    board.input.pointerDown(pointer('pen', 3, 1, 1));
    board.input.pointerMove(pointer('touch', 1, 90, 90));
    board.input.pointerUp(pointer('touch', 1, 90, 90));
    expect(drawn.map((event) => `${event.pointerType}:${event.phase}`)).toEqual([
      'touch:down',
      'touch:move',
      'touch:cancel',
      'pen:down',
    ]);
  });

  it('WEJ-06: after the first use of the pen a single finger does not draw, it moves the view (D4)', async () => {
    const board = await recorderBoard();
    expect(board.input.penWasUsed).toBe(false);
    penStroke(board);
    expect(board.input.penWasUsed).toBe(true);
    drawn = [];
    board.input.pointerDown(pointer('touch', 1, 50, 50));
    board.input.pointerMove(pointer('touch', 1, 80, 70));
    board.input.pointerUp(pointer('touch', 1, 80, 70));
    expect(drawn).toEqual([]);
    expect(board.camera.state).toEqual({ x: 30, y: 20, zoom: 1 });
  });

  it('WEJ-06: with the D4 switch off a finger draws again after the pen was used', async () => {
    const board = await recorderBoard();
    penStroke(board);
    drawn = [];
    board.input.settings.penDisablesFingerDrawing = false;
    board.input.pointerDown(pointer('touch', 1, 50, 50));
    board.input.pointerUp(pointer('touch', 1, 50, 50));
    expect(phases(drawn)).toEqual(['down', 'up']);
  });
});

describe('NF-04: drawing latency', () => {
  it('NF-04: every coalesced sample reaches the tool as its own move; predictions come with the last', async () => {
    const board = await recorderBoard();
    board.input.pointerDown(pointer('pen', 3, 0, 0));
    const samples: InputPointer[] = [1, 2, 3].map((step) => pointer('pen', 3, step * 10, 0));
    board.input.pointerMove(
      pointer('pen', 3, 30, 0, { coalesced: samples, predicted: [pointer('pen', 3, 40, 0)] }),
    );
    const moves = drawn.filter((event) => event.phase === 'move');
    expect(moves.map((event) => event.world.x)).toEqual([10, 20, 30]);
    expect(moves.map((event) => event.predicted.length)).toEqual([0, 0, 1]);
    expect(moves[2]?.predicted[0]?.world).toEqual({ x: 40, y: 0 });
  });

  it('NF-04: without coalesced events the event itself is used (fallback path)', async () => {
    const board = await recorderBoard();
    board.input.pointerDown(pointer('pen', 3, 0, 0));
    board.input.pointerMove(pointer('pen', 3, 30, 0));
    expect(drawn.filter((event) => event.phase === 'move')).toHaveLength(1);
  });

  it('NF-04: DOM events are converted with or without getCoalescedEvents and getPredictedEvents', () => {
    const base = {
      pointerId: 1,
      pointerType: 'pen',
      clientX: 110,
      clientY: 60,
      pressure: 0.4,
      tiltX: 10,
      tiltY: 0,
      buttons: 1,
      button: 0,
      timeStamp: 5,
    };
    const plain = toInputEvent(base, { x: 100, y: 50 });
    expect(plain).toMatchObject({ x: 10, y: 10, coalesced: [], predicted: [] });
    const rich = toInputEvent(
      {
        ...base,
        getCoalescedEvents: () => [
          { ...base, clientX: 105 },
          { ...base, clientX: 110 },
        ],
        getPredictedEvents: () => [{ ...base, clientX: 120 }],
      },
      { x: 100, y: 50 },
    );
    expect(rich.coalesced.map((item) => item.x)).toEqual([5, 10]);
    expect(rich.predicted.map((item) => item.x)).toEqual([20]);
    const failing = toInputEvent(
      {
        ...base,
        getCoalescedEvents: () => {
          throw new Error('not supported');
        },
      },
      { x: 0, y: 0 },
    );
    expect(failing.coalesced).toEqual([]);
  });

  it('NF-04: the time from the event to the end of drawing is measured for each handled event', () => {
    let now = 0;
    const board = createTestBoard([recorderSource], documentOf(layerOf('recorder', 'r')));
    return board.loadLayers().then(() => {
      board.tools.setActive('recorder/draw');
      const router = board.input;
      Object.defineProperty(router, 'now', { value: () => now });
      now = 1003;
      router.pointerDown(pointer('pen', 3, 0, 0, { timeStamp: 1000 }));
      now = 1021.5;
      router.pointerMove(pointer('pen', 3, 5, 0, { timeStamp: 1020 }));
      expect(router.latency.count).toBe(2);
      expect(router.latency.percentile(100)).toBe(3);
      expect(router.latency.percentile(50)).toBe(1.5);
      // Events no tool handles (no active tool) are not measured.
      board.tools.setActive(undefined);
      router.pointerMove(pointer('pen', 3, 9, 0, { timeStamp: 1020 }));
      expect(router.latency.count).toBe(2);
    });
  });

  it('NF-04: the latency meter reports the 95th percentile of the newest samples', () => {
    const meter = new LatencyMeter(100);
    expect(meter.percentile(95)).toBe(0);
    for (let value = 1; value <= 100; value += 1) meter.record(value / 10);
    expect(meter.summary()).toEqual({ count: 100, p50: 5, p95: 9.5, max: 10 });
    for (let value = 0; value < 100; value += 1) meter.record(1);
    expect(meter.percentile(95)).toBe(1);
    meter.record(Number.NaN);
    meter.record(-1);
    expect(meter.count).toBe(100);
    meter.reset();
    expect(meter.count).toBe(0);
    expect(LATENCY_THRESHOLD_MS).toBe(4);
  });
});
