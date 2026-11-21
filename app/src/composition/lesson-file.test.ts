// @vitest-environment happy-dom
// Saving and opening lessons with the real plugins, the autosave and the restore offer
// (DAN-01, DAN-02, ADR-009; WAR-06 K3 and P17 b for the data of broken layers).
import type { DrawingData } from '@tablica/layer-drawing';
import fixtureManifest from '@tablica/test-fixture-layer/manifest.json';
import { addBox, type FixtureData } from '@tablica/test-fixture-layer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Board } from '../lib/core/board';
import type { SerializedDocument } from '../lib/core/document';
import type { InputPointerEvent } from '../lib/core/input-router';
import type { PluginSource } from '../lib/core/plugin-manager';
import { decodeLesson, encodeLesson } from '../lib/files/lesson-format';
import { LessonSession } from '../lib/files/session';
import { builtinPlugins, newLessonDocument } from './builtin';
import { attachToBody, createTestBoard, documentOf, layerOf, MemoryPlatform } from './test-support';

const fixtureSource: PluginSource = {
  manifest: fixtureManifest,
  load: () => import('@tablica/test-fixture-layer'),
};
const sources = [...builtinPlugins, fixtureSource];

const PEN = 'layer-drawing/pen';
const HIGHLIGHTER = 'layer-drawing/highlighter';
let time = 900_000;

function pen(x: number, y: number, extra: Partial<InputPointerEvent> = {}): InputPointerEvent {
  return {
    pointerId: 3,
    pointerType: 'pen',
    x,
    y,
    pressure: 0.7,
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

function stroke(board: Board, points: ReadonlyArray<readonly [number, number]>): void {
  const [first = [0, 0], ...rest] = points;
  board.input.pointerDown(pen(first[0], first[1]));
  for (const [x, y] of rest) board.input.pointerMove(pen(x, y));
  const last = points.at(-1) ?? first;
  board.input.pointerUp(pen(last[0], last[1], { pressure: 0, buttons: 0 }));
}

function drawing(board: Board, id: string): DrawingData {
  return board.document.getLayer(id)?.data as DrawingData;
}

/** Saves the board to bytes and opens them on a fresh board, as a file would go to disk. */
async function throughFile(board: Board, openWith = sources): Promise<Board> {
  const bytes = encodeLesson({ document: board.serialize(), files: new Map() });
  const reopened = createTestBoard(openWith);
  await reopened.openDocument(decodeLesson(bytes).document);
  return reopened;
}

/** A lesson with every kind of content the program has so far (steps 1.2–1.4). */
async function fullLesson(): Promise<Board> {
  const board = createTestBoard(
    sources,
    documentOf(
      layerOf('layer-background', 'bg'),
      layerOf('layer-media', 'media'),
      layerOf('layer-drawing', 'ink'),
      layerOf('test-fixture-layer', 'boxes'),
    ),
  );
  await board.loadLayers();
  attachToBody(board);
  await board.addLayer('layer-drawing'); // "Drawing 2"
  const second = board.document.layers.at(-1)!.id;
  board.document.setActiveLayer('ink');
  board.tools.setActive(PEN);
  stroke(board, [
    [10, 10],
    [40, 30],
    [80, 20],
  ]);
  board.tools.setActive(HIGHLIGHTER);
  stroke(board, [
    [0, 50],
    [100, 50],
  ]);
  board.document.setActiveLayer(second);
  board.tools.setActive(PEN);
  stroke(board, [
    [5, 5],
    [6, 7],
  ]);
  board.execute('boxes', addBox(3, 4));
  board.setLayerOpacity('media', 0.45);
  board.setLayerVisible('bg', false);
  board.setLayerLocked('boxes', true);
  board.moveLayer('ink', 0);
  board.camera.set({ x: -250, y: 120, zoom: 2.5 });
  return board;
}

beforeEach(() => {
  time += 10_000;
  document.body.replaceChildren();
});

describe('DAN-01: round trip of every element', () => {
  it('DAN-01: layers, their settings and numbers, strokes and the view survive save and open', async () => {
    const board = await fullLesson();
    const saved = board.serialize();
    const reopened = await throughFile(board);
    expect(reopened.serialize()).toEqual(saved);
    // The model, not only its serialized form: order, settings, numbers, statuses, data.
    const summary = (b: Board) =>
      b.document.layers.map(({ id, pluginId, number, visible, locked, opacity, status }) => ({
        id,
        pluginId,
        number,
        visible,
        locked,
        opacity,
        status,
      }));
    expect(summary(reopened)).toEqual(summary(board));
    expect(reopened.document.layers.map((l) => l.status)).toEqual(
      board.document.layers.map(() => 'ready'),
    );
    expect(drawing(reopened, 'ink')).toEqual(drawing(board, 'ink'));
    expect(drawing(reopened, 'ink').strokes.map((s) => s.tool)).toEqual(['pen', 'highlighter']);
    expect((reopened.document.getLayer('boxes')?.data as FixtureData).boxes).toHaveLength(1);
    expect(reopened.camera.state).toEqual({ x: -250, y: 120, zoom: 2.5 });
    expect(reopened.document.layers.map((l) => l.number)).toEqual([0, 0, 0, 0, 2]);
  });

  it('DAN-01: the opened lesson can be edited and undone; its history starts empty', async () => {
    const board = await fullLesson();
    const reopened = await throughFile(board);
    attachToBody(reopened);
    expect(reopened.history.canUndo).toBe(false);
    reopened.document.setActiveLayer('ink');
    reopened.tools.setActive(PEN);
    stroke(reopened, [
      [1, 1],
      [2, 2],
    ]);
    expect(drawing(reopened, 'ink').strokes).toHaveLength(3);
    expect(reopened.undo()).toBe(true);
    expect(drawing(reopened, 'ink').strokes).toHaveLength(2);
    // A new layer after opening continues the numbering saved in the lesson (P20).
    await reopened.addLayer('layer-drawing');
    expect(reopened.document.layers.at(-1)?.number).toBe(3);
  });

  it('DAN-01: opening replaces the lesson on the same board and clears its history', async () => {
    const board = await fullLesson();
    const other = await fullLesson();
    other.camera.set({ x: 0, y: 0, zoom: 1 });
    const fresh = newLessonDocument();
    await other.openDocument(fresh);
    expect(other.history.canUndo).toBe(false);
    expect(other.document.layers.map((l) => l.id)).toEqual(fresh.layers.map((l) => l.id));
    expect(other.document.layers.every((l) => l.status === 'ready')).toBe(true);
    expect(other.camera.state).toEqual({ x: 0, y: 0, zoom: 1 });
    await other.openDocument(
      decodeLesson(encodeLesson({ document: board.serialize(), files: new Map() })).document,
    );
    expect(other.serialize()).toEqual(board.serialize());
  });

  it('DAN-01: the drawing layer of format 1 is migrated by its plugin when the file is read', async () => {
    const old: SerializedDocument = documentOf({
      ...layerOf('layer-drawing', 'old'),
      pluginVersion: '0.1.0',
      schemaVersion: 1,
      data: {},
    });
    const board = createTestBoard(sources);
    await board.openDocument(
      decodeLesson(encodeLesson({ document: old, files: new Map() })).document,
    );
    expect(drawing(board, 'old')).toEqual({ strokes: [] });
    expect(board.serialize().layers[0]).toMatchObject({ schemaVersion: 2, pluginVersion: '0.2.0' });
  });
});

describe('DAN-01: data of plugins the program cannot use', () => {
  it('DAN-01: a layer of a missing plugin keeps its data unchanged through open and save', async () => {
    const unknown = {
      ...layerOf('plugin-from-the-future', 'future'),
      pluginVersion: '7.0.0',
      schemaVersion: 4,
      data: { anything: [1, 'two', { three: null }] },
      opacity: 0.5,
    };
    const lesson = documentOf(layerOf('layer-drawing', 'ink'), unknown);
    const board = createTestBoard(sources);
    await board.openDocument(
      decodeLesson(encodeLesson({ document: lesson, files: new Map() })).document,
    );
    expect(board.document.getLayer('future')?.status).toBe('missing');
    const again = decodeLesson(encodeLesson({ document: board.serialize(), files: new Map() }));
    expect(again.document.layers[1]).toEqual({
      ...unknown,
      number: 0,
      visible: true,
      locked: false,
    });
  });

  it('DAN-01: data written by a newer version of a plugin is kept and not handed to it', async () => {
    const newer = {
      ...layerOf('layer-drawing', 'newer'),
      pluginVersion: '9.0.0',
      schemaVersion: 99,
      data: { strokes: [], shapesOfTheFuture: [{ kind: 'spiral' }] },
    };
    const board = createTestBoard(sources);
    await board.openDocument(documentOf(newer));
    expect(board.document.getLayer('newer')?.status).toBe('broken');
    expect(board.notices.list.map((n) => n.key)).toContain('notice.layerNewer');
    expect(board.serialize().layers[0]).toMatchObject({
      schemaVersion: 99,
      pluginVersion: '9.0.0',
      data: newer.data,
    });
  });

  it('DAN-01: P17 b and Q4: a removed layer whose plugin fails comes back broken and its strokes are saved', async () => {
    const board = await fullLesson();
    const before = drawing(board, 'ink');
    board.document.setActiveLayer('ink');
    expect(board.removeLayer('ink')).toBe(true);
    board.breakPlugin('layer-drawing', new Error('test failure'));
    expect(board.undo()).toBe(true);
    expect(board.document.getLayer('ink')?.status).toBe('broken');
    // Saved while broken, opened again with a working plugin: the strokes are complete.
    const reopened = await throughFile(board, [...builtinPlugins, fixtureSource]);
    expect(reopened.document.getLayer('ink')?.status).toBe('ready');
    expect(drawing(reopened, 'ink')).toEqual(before);
  });
});

describe('DAN-01: File commands of the lesson session', () => {
  let platform: MemoryPlatform;
  let board: Board;
  let session: LessonSession;
  let recent: readonly string[];

  async function sessionWith(
    options: { recentFiles?: string[]; autosaveMinutes?: number | null } = {},
  ) {
    platform = new MemoryPlatform();
    board = createTestBoard(sources, newLessonDocument());
    await board.loadLayers();
    attachToBody(board);
    board.tools.setActive(PEN);
    recent = options.recentFiles ?? [];
    session = new LessonSession({
      board,
      platform,
      newDocument: newLessonDocument,
      translate: (key, params) => `${key}${params ? JSON.stringify(params) : ''}`,
      recentFiles: recent,
      saveRecentFiles: (paths) => {
        recent = paths;
      },
      autosaveMinutes: options.autosaveMinutes === undefined ? null : options.autosaveMinutes,
      now: () => new Date('2026-11-21T10:00:00Z'),
    });
  }

  function drawingLayer(): string {
    return board.document.layers.find((l) => l.pluginId === 'layer-drawing')!.id;
  }

  afterEach(() => {
    session.dispose();
    vi.useRealTimers();
  });

  it('DAN-01: Save asks for a file the first time, adds the extension and then saves in place', async () => {
    await sessionWith();
    expect(session.dirty).toBe(false);
    stroke(board, [
      [1, 1],
      [9, 9],
    ]);
    expect(session.dirty).toBe(true);
    platform.saveAnswers = ['C:\\Lekcje\\Ułamki'];
    expect(await session.save()).toBe(true);
    expect(session.path).toBe('C:\\Lekcje\\Ułamki.tablica');
    expect(session.title).toBe('Ułamki.tablica');
    expect(session.dirty).toBe(false);
    expect(recent).toEqual(['C:\\Lekcje\\Ułamki.tablica']);
    stroke(board, [
      [2, 2],
      [3, 3],
    ]);
    expect(await session.save()).toBe(true);
    expect(platform.saveAnswers).toEqual([]);
    const saved = decodeLesson(platform.files.get('C:\\Lekcje\\Ułamki.tablica')!);
    expect(saved.document).toEqual(board.serialize());
  });

  it('DAN-01: Save as writes a new file; a cancelled dialog changes nothing', async () => {
    await sessionWith();
    platform.saveAnswers = ['/home/a/first.tablica', null, '/home/a/second.tablica'];
    await session.save();
    expect(await session.saveAs()).toBe(false);
    expect(session.path).toBe('/home/a/first.tablica');
    expect(await session.saveAs()).toBe(true);
    expect(session.path).toBe('/home/a/second.tablica');
    expect([...platform.files.keys()]).toEqual(['/home/a/first.tablica', '/home/a/second.tablica']);
    expect(recent).toEqual(['/home/a/second.tablica', '/home/a/first.tablica']);
  });

  it('DAN-01: Open and Recent files load the lesson; unsaved changes are asked about first', async () => {
    await sessionWith();
    stroke(board, [
      [1, 1],
      [5, 5],
    ]);
    platform.saveAnswers = ['/l/a.tablica'];
    await session.save();
    const saved = board.serialize();
    await session.newLesson();
    expect(drawing(board, drawingLayer()).strokes).toEqual([]);
    expect(session.path).toBeNull();
    stroke(board, [
      [7, 7],
      [8, 8],
    ]);
    // The user refuses to lose the new stroke: nothing happens.
    platform.confirmAnswers = [false];
    expect(await session.open('/l/a.tablica')).toBe(false);
    expect(platform.questions).toHaveLength(1);
    expect(drawing(board, drawingLayer()).strokes).toHaveLength(1);
    expect(session.path).toBeNull();
    platform.confirmAnswers = [true];
    platform.openAnswers = ['/l/a.tablica'];
    expect(await session.open()).toBe(true);
    expect(board.serialize()).toEqual(saved);
    expect(session.path).toBe('/l/a.tablica');
    expect(session.dirty).toBe(false);
    expect(board.history.canUndo).toBe(false);
  });

  it('DAN-01: the recent list keeps the newest first, without duplicates, at most 10', async () => {
    await sessionWith({ recentFiles: ['/old.tablica'] });
    for (let index = 0; index < 12; index += 1) {
      platform.saveAnswers = [`/f${index}.tablica`];
      await session.saveAs();
    }
    await session.open('/f3.tablica');
    expect(session.recentFiles).toHaveLength(10);
    expect(session.recentFiles[0]).toBe('/f3.tablica');
    expect(new Set(session.recentFiles).size).toBe(10);
    expect(session.recentFiles).not.toContain('/old.tablica');
  });

  it('DAN-01 K3: a damaged file gives a message and leaves the open lesson as it was', async () => {
    await sessionWith();
    stroke(board, [
      [1, 1],
      [2, 2],
    ]);
    const before = board.serialize();
    platform.files.set('/broken.tablica', new TextEncoder().encode('PK not really a zip'));
    platform.confirmAnswers = [true];
    expect(await session.open('/broken.tablica')).toBe(false);
    expect(board.notices.list.at(-1)).toMatchObject({
      key: 'notice.fileCorrupt',
      pluginId: '',
      params: { file: 'broken.tablica' },
    });
    expect(board.serialize()).toEqual(before);
    expect(session.dirty).toBe(true);
  });

  it('DAN-01 K2: a file from a newer version gives a message instead of a crash', async () => {
    await sessionWith();
    const { strToU8, zipSync } = await import('fflate');
    platform.files.set(
      '/future.tablica',
      zipSync({
        'manifest.json': strToU8('{"format":"tablica","formatVersion":2}'),
        'document.json': strToU8('{"schemaVersion":5,"layers":[]}'),
      }),
    );
    expect(await session.open('/future.tablica')).toBe(false);
    expect(board.notices.list.at(-1)?.key).toBe('notice.fileNewer');
    expect(board.document.layers).toHaveLength(3);
  });

  it('DAN-01: a file that cannot be read gives a message and leaves Recent files', async () => {
    await sessionWith({ recentFiles: ['/gone.tablica', '/other.tablica'] });
    expect(await session.open('/gone.tablica')).toBe(false);
    expect(board.notices.list.at(-1)?.key).toBe('notice.fileReadFailed');
    expect(session.recentFiles).toEqual(['/other.tablica']);
  });

  it('DAN-01 K3: a failed write gives a message; the lesson stays unsaved', async () => {
    await sessionWith();
    stroke(board, [
      [1, 1],
      [2, 2],
    ]);
    platform.failWrites = true;
    platform.saveAnswers = ['/x.tablica'];
    expect(await session.save()).toBe(false);
    expect(board.notices.list.at(-1)?.key).toBe('notice.fileWriteFailed');
    expect(session.dirty).toBe(true);
    expect(session.path).toBeNull();
  });

  it('DAN-01 K4: the File shortcuts are reserved for the program', async () => {
    await sessionWith();
    for (const keys of ['Ctrl+N', 'Ctrl+O', 'Ctrl+S', 'Ctrl+Shift+S']) {
      expect(
        board.shortcuts.tryRegister('layer-drawing', {
          id: keys,
          keys,
          labelKey: 'x',
          run: () => {},
        }),
      ).toBe(false);
    }
  });

  it('DAN-01: visibility and lock changes make the lesson unsaved; moving the view does not', async () => {
    await sessionWith();
    board.camera.panBy(50, 0);
    expect(session.dirty).toBe(false);
    board.setLayerVisible(drawingLayer(), false);
    expect(session.dirty).toBe(true);
    platform.saveAnswers = ['/v.tablica'];
    await session.save();
    board.setLayerLocked(drawingLayer(), true);
    expect(session.dirty).toBe(true);
  });

  it('DAN-01: New asks about unsaved changes and starts an empty lesson', async () => {
    await sessionWith();
    stroke(board, [
      [1, 1],
      [2, 2],
    ]);
    platform.confirmAnswers = [false];
    expect(await session.newLesson()).toBe(false);
    expect(drawing(board, drawingLayer()).strokes).toHaveLength(1);
    platform.confirmAnswers = [true];
    expect(await session.newLesson()).toBe(true);
    expect(drawing(board, drawingLayer()).strokes).toEqual([]);
    expect(board.document.layers.map((l) => l.pluginId)).toEqual([
      'layer-background',
      'layer-media',
      'layer-drawing',
    ]);
    expect(session.dirty).toBe(false);
  });
});

describe('DAN-02: autosave', () => {
  let platform: MemoryPlatform;
  let board: Board;
  let session: LessonSession;

  async function start(minutes?: number | null, recovery?: MemoryPlatform['recovery']) {
    platform = new MemoryPlatform();
    platform.recovery = recovery ?? null;
    board = createTestBoard(sources, newLessonDocument());
    await board.loadLayers();
    attachToBody(board);
    board.tools.setActive(PEN);
    session = new LessonSession({
      board,
      platform,
      newDocument: newLessonDocument,
      translate: (key) => key,
      ...(minutes === undefined ? {} : { autosaveMinutes: minutes }),
      now: () => new Date('2026-11-21T10:00:00Z'),
    });
  }

  afterEach(() => {
    session.dispose();
    vi.useRealTimers();
  });

  it('DAN-02 K1: by default the lesson is autosaved every 2 minutes (controlled clock)', async () => {
    vi.useFakeTimers();
    await start();
    expect(session.autosaveMinutes).toBe(2);
    stroke(board, [
      [1, 1],
      [2, 2],
    ]);
    await vi.advanceTimersByTimeAsync(119_000);
    expect(platform.recoveryWrites).toBe(0);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(platform.recoveryWrites).toBe(1);
    expect(decodeLesson(platform.recovery!.bytes).document).toEqual(board.serialize());
    expect(platform.recovery!.info).toEqual({ path: null, savedAt: '2026-11-21T10:00:00.000Z' });
    // Nothing changed: the next tick writes nothing.
    await vi.advanceTimersByTimeAsync(120_000);
    expect(platform.recoveryWrites).toBe(1);
    stroke(board, [
      [3, 3],
      [4, 4],
    ]);
    await vi.advanceTimersByTimeAsync(120_000);
    expect(platform.recoveryWrites).toBe(2);
  });

  it('DAN-02 K1, D7: the interval can be set from 1 to 60 minutes or switched off', async () => {
    vi.useFakeTimers();
    await start(1);
    stroke(board, [
      [1, 1],
      [2, 2],
    ]);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(platform.recoveryWrites).toBe(1);
    session.setAutosaveMinutes(60);
    stroke(board, [
      [3, 3],
      [4, 4],
    ]);
    await vi.advanceTimersByTimeAsync(59 * 60_000);
    expect(platform.recoveryWrites).toBe(1);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(platform.recoveryWrites).toBe(2);
    session.setAutosaveMinutes(null);
    stroke(board, [
      [5, 5],
      [6, 6],
    ]);
    await vi.advanceTimersByTimeAsync(5 * 60 * 60_000);
    expect(platform.recoveryWrites).toBe(2);
  });

  it('DAN-02 K2, P5: the autosave writes a separate copy; the lesson file changes only on Save', async () => {
    vi.useFakeTimers();
    await start(2);
    platform.saveAnswers = ['/lesson.tablica'];
    await session.save();
    const savedBytes = platform.files.get('/lesson.tablica')!;
    stroke(board, [
      [1, 1],
      [2, 2],
    ]);
    await vi.advanceTimersByTimeAsync(120_000);
    expect(platform.files.get('/lesson.tablica')).toEqual(savedBytes);
    expect(platform.recovery?.info.path).toBe('/lesson.tablica');
    expect(session.dirty).toBe(true);
    // Saving puts the work into the lesson file and removes the copy.
    await session.save();
    expect(platform.recovery).toBeNull();
    expect(decodeLesson(platform.files.get('/lesson.tablica')!).document).toEqual(
      board.serialize(),
    );
  });

  it('DAN-02 K3: after an improper end the start offers the autosave; yes restores it', async () => {
    await start(null);
    stroke(board, [
      [1, 1],
      [2, 2],
    ]);
    await session.autosave();
    const copy = platform.recovery;
    const expected = board.serialize();
    session.dispose();
    // A new program start with the copy left behind.
    await start(null, copy);
    platform.confirmAnswers = [true];
    expect(await session.start()).toBe(true);
    expect(platform.questions).toHaveLength(1);
    expect(board.serialize()).toEqual(expected);
    expect(session.dirty).toBe(true);
    // The copy is kept until the lesson is saved: it is still the only copy of the work.
    expect(platform.recovery).not.toBeNull();
    platform.saveAnswers = ['/restored.tablica'];
    await session.save();
    expect(platform.recovery).toBeNull();
    expect(session.dirty).toBe(false);
  });

  it('DAN-02 K3: refusing the restore removes the copy; a proper close leaves none', async () => {
    await start(null);
    stroke(board, [
      [1, 1],
      [2, 2],
    ]);
    await session.autosave();
    const copy = platform.recovery;
    session.dispose();
    await start(null, copy);
    platform.confirmAnswers = [false];
    expect(await session.start()).toBe(false);
    expect(platform.recovery).toBeNull();
    expect(board.document.layers.every((l) => l.status === 'ready')).toBe(true);
    // Nothing to restore: no question at all.
    expect(await session.start()).toBe(false);
    expect(platform.questions).toHaveLength(1);
    // Proper close with unsaved work: asked, and the copy is removed.
    stroke(board, [
      [1, 1],
      [2, 2],
    ]);
    await session.autosave();
    platform.confirmAnswers = [false];
    expect(await session.close()).toBe(false);
    expect(platform.recovery).not.toBeNull();
    platform.confirmAnswers = [true];
    expect(await session.close()).toBe(true);
    expect(platform.recovery).toBeNull();
  });

  it('DAN-02 K3: a damaged autosave copy gives a message and the empty lesson stays', async () => {
    await start(null, {
      bytes: new Uint8Array([1, 2, 3]),
      info: { path: '/l.tablica', savedAt: '2026-11-21T09:00:00Z' },
    });
    platform.confirmAnswers = [true];
    expect(await session.start()).toBe(false);
    expect(board.notices.list.at(-1)?.key).toBe('notice.recoveryFailed');
    expect(platform.recovery).toBeNull();
    expect(board.document.layers).toHaveLength(3);
  });

  it('DAN-02: a failed autosave gives a message and is tried again at the next tick', async () => {
    vi.useFakeTimers();
    await start(1);
    stroke(board, [
      [1, 1],
      [2, 2],
    ]);
    platform.failWrites = true;
    await vi.advanceTimersByTimeAsync(60_000);
    expect(board.notices.list.at(-1)?.key).toBe('notice.autosaveFailed');
    platform.failWrites = false;
    await vi.advanceTimersByTimeAsync(60_000);
    expect(platform.recoveryWrites).toBe(1);
  });
});
