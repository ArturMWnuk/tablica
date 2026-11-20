// @vitest-environment happy-dom
// Pen and highlighter of the drawing layer driven through the input pipeline
// (RYS-01, RYS-02, WEJ-05, WAR-03 K1 for the new tools, DAN-03).
import type { DrawingData } from '@tablica/layer-drawing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Board } from '../lib/core/board';
import type { InputPointerEvent } from '../lib/core/input-router';
import { builtinPlugins } from './builtin';
import { attachToBody, createTestBoard, documentOf, layerOf } from './test-support';

const PEN = 'layer-drawing/pen';
const HIGHLIGHTER = 'layer-drawing/highlighter';

let time = 50_000;

function pen(x: number, y: number, extra: Partial<InputPointerEvent> = {}): InputPointerEvent {
  return {
    pointerId: 7,
    pointerType: 'pen',
    x,
    y,
    pressure: 0.6,
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

async function drawingBoard(): Promise<Board> {
  const board = createTestBoard(builtinPlugins, documentOf(layerOf('layer-drawing', 'd')));
  await board.loadLayers();
  attachToBody(board);
  board.tools.setActive(PEN);
  return board;
}

function data(board: Board, id = 'd'): DrawingData {
  return board.document.getLayer(id)?.data as DrawingData;
}

/** Draws a stroke through the points with the pen. */
function stroke(board: Board, points: ReadonlyArray<readonly [number, number]>): void {
  const [first = [0, 0], ...rest] = points;
  board.input.pointerDown(pen(first[0], first[1]));
  for (const [x, y] of rest) board.input.pointerMove(pen(x, y));
  const last = points.at(-1) ?? first;
  board.input.pointerUp(pen(last[0], last[1], { pressure: 0, buttons: 0 }));
}

beforeEach(() => {
  time += 10_000;
  document.body.replaceChildren();
});

describe('RYS-01: pen', () => {
  it('RYS-01: a pen stroke is stored with its points and pressure as one undo step', async () => {
    const board = await drawingBoard();
    stroke(board, [
      [10, 10],
      [20, 15],
      [30, 25],
    ]);
    const [drawn] = data(board).strokes;
    expect(data(board).strokes).toHaveLength(1);
    expect(drawn).toMatchObject({ tool: 'pen', color: '#000000', width: 4 });
    expect(drawn?.points.map(([x, y]) => [x, y])).toEqual([
      [10, 10],
      [20, 15],
      [30, 25],
    ]);
    // The lifted pen reports pressure 0; the stroke keeps the pressure of the last contact.
    expect(drawn?.points.map(([, , pressure]) => pressure)).toEqual([0.6, 0.6, 0.6]);
    expect(board.undo()).toBe(true);
    expect(data(board).strokes).toEqual([]);
    expect(board.redo()).toBe(true);
    expect(data(board).strokes).toHaveLength(1);
  });

  it('RYS-01: points are stored in board coordinates (through the camera)', async () => {
    const board = await drawingBoard();
    board.camera.set({ x: 100, y: 0, zoom: 2 });
    stroke(board, [
      [120, 40],
      [140, 40],
    ]);
    expect(data(board).strokes[0]?.points.map(([x, y]) => [x, y])).toEqual([
      [10, 20],
      [20, 20],
    ]);
  });

  it('RYS-01: predicted points are not stored and a cancelled stroke leaves nothing', async () => {
    const board = await drawingBoard();
    board.input.pointerDown(pen(0, 0));
    board.input.pointerMove(pen(10, 0, { predicted: [pen(30, 0), pen(40, 0)] }));
    board.input.pointerUp(pen(10, 0, { buttons: 0 }));
    expect(data(board).strokes[0]?.points.map(([x]) => x)).toEqual([0, 10]);
    board.input.pointerDown(pen(0, 0));
    board.input.pointerMove(pen(10, 0));
    board.input.pointerCancel(pen(10, 0));
    expect(data(board).strokes).toHaveLength(1);
    expect(board.history.entries).toHaveLength(1);
  });

  it('RYS-01: a single touch of the pen leaves a dot', async () => {
    const board = await drawingBoard();
    stroke(board, [[5, 5]]);
    expect(data(board).strokes[0]?.points).toHaveLength(1);
  });

  it('RYS-01: strokes are saved and read back; data of format 1 opens as an empty layer', async () => {
    const board = await drawingBoard();
    stroke(board, [
      [1, 2],
      [3, 4],
    ]);
    board.tools.setActive(HIGHLIGHTER);
    stroke(board, [
      [5, 6],
      [7, 8],
    ]);
    const saved = board.serialize();
    const reopened = createTestBoard(builtinPlugins, structuredClone(saved));
    await reopened.loadLayers();
    expect(data(reopened)).toEqual(data(board));
    expect(reopened.serialize()).toEqual(saved);
    const old = createTestBoard(
      builtinPlugins,
      documentOf({ ...layerOf('layer-drawing', 'd'), schemaVersion: 1, data: {} }),
    );
    await old.loadLayers();
    expect(data(old)).toEqual({ strokes: [] });
  });
});

describe('RYS-02: highlighter', () => {
  it('RYS-02: the highlighter stores its own colour and width, undoable', async () => {
    const board = await drawingBoard();
    board.tools.setActive(HIGHLIGHTER);
    stroke(board, [
      [0, 0],
      [50, 0],
    ]);
    expect(data(board).strokes[0]).toMatchObject({
      tool: 'highlighter',
      color: '#fdd835',
      width: 16,
    });
    board.undo();
    expect(data(board).strokes).toEqual([]);
  });
});

describe('WAR-03: pen and highlighter on a locked or hidden layer', () => {
  it.each([PEN, HIGHLIGHTER])(
    'WAR-03: %s does not change a locked layer and records nothing',
    async (tool) => {
      const board = await drawingBoard();
      board.tools.setActive(tool);
      board.setLayerLocked('d', true);
      const before = JSON.stringify(board.serialize());
      stroke(board, [
        [0, 0],
        [40, 40],
      ]);
      expect(JSON.stringify(board.serialize())).toBe(before);
      expect(board.history.canUndo).toBe(false);
      board.setLayerLocked('d', false);
      board.setLayerVisible('d', false);
      stroke(board, [
        [0, 0],
        [40, 40],
      ]);
      expect(JSON.stringify(board.serialize())).not.toContain('"strokes":[{');
      expect(board.history.canUndo).toBe(false);
    },
  );

  it('WAR-03: a stroke started before the layer was locked is not stored', async () => {
    const board = await drawingBoard();
    board.input.pointerDown(pen(0, 0));
    board.input.pointerMove(pen(10, 10));
    board.setLayerLocked('d', true);
    board.input.pointerUp(pen(10, 10, { buttons: 0 }));
    expect(data(board).strokes).toEqual([]);
    expect(board.history.canUndo).toBe(false);
  });
});

describe('RYS-01: colour and width panel', () => {
  async function panel(board: Board): Promise<HTMLElement> {
    const element = document.createElement('div');
    document.body.append(element);
    board.mountPanel('layer-drawing/style', element);
    return element;
  }

  it('RYS-01: the panel offers 12+ colours, any colour, 5+ widths and a 1–50 px slider', async () => {
    const board = await drawingBoard();
    const element = await panel(board);
    const section = element.querySelector('[data-tool="pen"]');
    expect(
      section?.querySelectorAll('[data-testid="drawing-swatch"]').length,
    ).toBeGreaterThanOrEqual(12);
    expect(section?.querySelector('input[type="color"]')).not.toBeNull();
    expect(section?.querySelector('[data-testid="drawing-color-hex"]')).not.toBeNull();
    expect(
      section?.querySelectorAll('[data-testid="drawing-width-preset"]').length,
    ).toBeGreaterThanOrEqual(5);
    const slider = section?.querySelector<HTMLInputElement>('[data-testid="drawing-width"]');
    expect([slider?.min, slider?.max, slider?.step]).toEqual(['1', '50', '1']);
    // Texts come from the plugin catalog (UI-01).
    expect(section?.querySelector('legend')?.textContent).toBe('Pen');
  });

  it('RYS-01: the chosen colour and width are used by the next stroke', async () => {
    const board = await drawingBoard();
    const element = await panel(board);
    const section = element.querySelector('[data-tool="pen"]') as HTMLElement;
    section.querySelector<HTMLButtonElement>('[data-color="#e53935"]')?.click();
    section.querySelector<HTMLButtonElement>('[data-width="10"]')?.click();
    expect(section.querySelector('[data-color="#e53935"]')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
    stroke(board, [
      [0, 0],
      [9, 9],
    ]);
    const slider = section.querySelector<HTMLInputElement>('[data-testid="drawing-width"]');
    if (!slider) throw new Error('missing slider');
    slider.value = '37';
    slider.dispatchEvent(new Event('input'));
    const hex = section.querySelector<HTMLInputElement>('[data-testid="drawing-color-hex"]');
    if (!hex) throw new Error('missing hex field');
    hex.value = '#12AB9C';
    hex.dispatchEvent(new Event('change'));
    stroke(board, [
      [0, 0],
      [9, 9],
    ]);
    hex.value = 'not a colour';
    hex.dispatchEvent(new Event('change'));
    expect(hex.value).toBe('#12ab9c');
    expect(data(board).strokes.map(({ color, width }) => ({ color, width }))).toEqual([
      { color: '#e53935', width: 10 },
      { color: '#12ab9c', width: 37 },
    ]);
  });
});
