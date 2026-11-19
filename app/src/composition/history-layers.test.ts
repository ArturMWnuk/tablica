// @vitest-environment happy-dom
// Integration tests of the undo history and layer operations with the built-in plugins and the
// test plugin (DAN-03, WAR-02, WAR-03, WAR-04, WAR-05; D3, D6, D12).
import fixtureManifest from '@tablica/test-fixture-layer/manifest.json';
import type { FixtureData } from '@tablica/test-fixture-layer';
import { defineLayerPlugin } from '@tablica/plugin-api';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Board } from '../lib/core/board';
import type { SerializedDocument } from '../lib/core/document';
import type { PluginSource } from '../lib/core/plugin-manager';
import type { KeyInput } from '../lib/core/registries';
import { builtinPlugins } from './builtin';
import { attachToBody, createTestBoard, documentOf, layerOf, pointerDown } from './test-support';

const fixtureSource: PluginSource = {
  manifest: fixtureManifest,
  load: () => import('@tablica/test-fixture-layer'),
};
const allSources = [...builtinPlugins, fixtureSource];

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

/** A lesson with background, two test layers and a drawing layer (bottom to top). */
async function lessonBoard(document?: SerializedDocument) {
  const board = createTestBoard(
    allSources,
    document ??
      documentOf(
        layerOf('layer-background', 'bg'),
        layerOf('test-fixture-layer', 'a'),
        layerOf('test-fixture-layer', 'b'),
        layerOf('layer-drawing', 'drawing'),
      ),
  );
  await board.loadLayers();
  const root = attachToBody(board);
  return { board, root };
}

function boxes(board: Board, layerId: string): number {
  return (board.document.getLayer(layerId)?.data as FixtureData).boxes.length;
}

function container(root: HTMLElement, layerId: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(`[data-layer-id="${layerId}"]`);
  if (!element) throw new Error(`No container of ${layerId}`);
  return element;
}

function order(root: HTMLElement): string[] {
  return [...root.children].map((element) => (element as HTMLElement).dataset['layerId'] ?? '');
}

function key(keyName: string, modifiers: Partial<KeyInput> = {}): KeyInput {
  return {
    key: keyName,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    ...modifiers,
  };
}

function addBoxOn(board: Board, layerId: string, x = 1): void {
  board.tools.setActive('test-fixture-layer/box');
  board.document.setActiveLayer(layerId);
  board.dispatchPointer(pointerDown(x, x));
}

describe('DAN-03: undo and redo of every document change', () => {
  it('DAN-03: Ctrl+Z undoes, Ctrl+Y and Ctrl+Shift+Z redo', async () => {
    const { board } = await lessonBoard();
    addBoxOn(board, 'a');
    addBoxOn(board, 'a');
    expect(board.handleKey(key('z', { ctrlKey: true }))).toBe(true);
    expect(boxes(board, 'a')).toBe(1);
    expect(board.handleKey(key('z', { ctrlKey: true }))).toBe(true);
    expect(boxes(board, 'a')).toBe(0);
    expect(board.handleKey(key('y', { ctrlKey: true }))).toBe(true);
    expect(boxes(board, 'a')).toBe(1);
    // With Shift, KeyboardEvent.key is the capital letter.
    expect(board.handleKey(key('Z', { ctrlKey: true, shiftKey: true }))).toBe(true);
    expect(boxes(board, 'a')).toBe(2);
  });

  it('DAN-03: undo and redo buttons call the same operations as the keys', async () => {
    const { board } = await lessonBoard();
    addBoxOn(board, 'a');
    expect(board.undo()).toBe(true);
    expect(boxes(board, 'a')).toBe(0);
    expect(board.undo()).toBe(false);
    expect(board.redo()).toBe(true);
    expect(boxes(board, 'a')).toBe(1);
  });

  it('DAN-03: a tap with two fingers undoes and with three fingers redoes (D3)', async () => {
    const { board, root } = await lessonBoard();
    addBoxOn(board, 'a');
    expect(board.handleTap(2)).toBe(true);
    expect(boxes(board, 'a')).toBe(0);
    expect(root.querySelectorAll('.fixture-box')).toHaveLength(0);
    expect(board.handleTap(3)).toBe(true);
    expect(boxes(board, 'a')).toBe(1);
    expect(root.querySelectorAll('.fixture-box')).toHaveLength(1);
    expect(board.handleTap(1)).toBe(false);
    expect(board.handleTap(4)).toBe(false);
  });

  it('DAN-03: every operation of the test plugin and of the layer panel is undone and redone', async () => {
    const { board, root } = await lessonBoard();
    const initial = JSON.stringify(board.serialize());
    addBoxOn(board, 'a');
    board.tools.setActive('test-fixture-layer/clear');
    board.dispatchPointer(pointerDown(0, 0));
    board.handleKey(key('b', { ctrlKey: true, altKey: true }));
    board.setLayerOpacity('b', 0.4);
    board.moveLayer('bg', 3);
    const final = JSON.stringify(board.serialize());
    expect(board.history.undoCount).toBe(5);

    while (board.undo()) {
      // undo everything
    }
    expect(JSON.stringify(board.serialize())).toBe(initial);
    expect(order(root)).toEqual(['bg', 'a', 'b', 'drawing']);

    while (board.redo()) {
      // redo everything
    }
    expect(JSON.stringify(board.serialize())).toBe(final);
    expect(order(root)).toEqual(['a', 'b', 'drawing', 'bg']);
  });

  it('DAN-03: one common history keeps the chronological order of all layers (P4)', async () => {
    const { board } = await lessonBoard();
    addBoxOn(board, 'a', 1);
    board.setLayerOpacity('b', 0.5);
    addBoxOn(board, 'b', 2);
    addBoxOn(board, 'a', 3);

    board.undo();
    expect([boxes(board, 'a'), boxes(board, 'b')]).toEqual([1, 1]);
    board.undo();
    expect([boxes(board, 'a'), boxes(board, 'b')]).toEqual([1, 0]);
    expect(board.document.getLayer('b')?.opacity).toBe(0.5);
    board.undo();
    expect(board.document.getLayer('b')?.opacity).toBe(1);
    board.undo();
    expect([boxes(board, 'a'), boxes(board, 'b')]).toEqual([0, 0]);
  });

  it('DAN-03: the limit of 50 steps applies to plugin commands; the 51st drops the oldest', async () => {
    const { board } = await lessonBoard();
    for (let index = 0; index < 51; index += 1) addBoxOn(board, 'a', index);
    expect(board.history.undoCount).toBe(50);
    while (board.undo()) {
      // undo everything that is kept
    }
    expect(boxes(board, 'a')).toBe(1);
  });

  it('DAN-03: the limit set by the user is applied (D6)', async () => {
    const { board } = await lessonBoard();
    board.history.setLimit(10);
    for (let index = 0; index < 15; index += 1) addBoxOn(board, 'a', index);
    expect(board.history.undoCount).toBe(10);
    board.history.setLimit(500);
    for (let index = 0; index < 100; index += 1) addBoxOn(board, 'a', index);
    expect(board.history.undoCount).toBe(110);
  });

  it('DAN-03: plugin commands are recorded only in the common history (test plugin)', async () => {
    const { board } = await lessonBoard();
    const listener = vi.fn();
    board.history.changed.subscribe(listener);
    addBoxOn(board, 'a');
    board.handleKey(key('b', { ctrlKey: true, altKey: true }));
    expect(board.history.undoCount).toBe(2);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('DAN-03: a plugin cannot take the undo and redo shortcuts', async () => {
    const greedy = defineLayerPlugin<null>({
      schemaVersion: 1,
      createData: () => null,
      serialize: () => null,
      deserialize: () => null,
      activate(context) {
        for (const keys of ['Ctrl+Z', 'ctrl+y', 'Shift+Ctrl+Z']) {
          context.registerShortcut({ id: keys, keys, labelKey: 'name', run: () => undefined });
        }
      },
      mountLayer: () => ({ render: () => undefined }),
    });
    const source: PluginSource = {
      manifest: {
        id: 'greedy',
        version: '1.0.0',
        apiVersion: '1.0.0',
        translations: {
          pl: { name: 'Zachłanna', description: 'Opis.' },
          en: { name: 'Greedy', description: 'Description.' },
        },
      },
      load: () => Promise.resolve({ default: greedy }),
    };
    const board = createTestBoard([source], documentOf(layerOf('greedy', 'g')));
    await board.loadLayers();
    expect(board.shortcuts.list()).toHaveLength(0);
    expect(
      board.notices.list.filter((notice) => notice.key === 'notice.shortcutConflict'),
    ).toHaveLength(3);
  });
});

describe('WAR-02: hiding and showing a layer', () => {
  it('WAR-02: a hidden layer is not rendered', async () => {
    const { board, root } = await lessonBoard();
    addBoxOn(board, 'a');
    board.setLayerVisible('a', false);
    const element = container(root, 'a');
    expect(element.hidden).toBe(true);
    expect(element.style.display).toBe('none');

    // A camera change while hidden is not drawn until the layer is shown again.
    const box = () => element.querySelector<HTMLElement>('.fixture-box');
    expect(box()?.style.left).toBe('1px');
    board.camera.panBy(100, 0);
    expect(box()?.style.left).toBe('1px');
    expect(container(root, 'b').hidden).toBe(false);
    board.setLayerVisible('a', true);
    expect(element.hidden).toBe(false);
    expect(element.style.display).toBe('');
    expect(box()?.style.left).toBe('101px');
  });

  it('WAR-02: a plugin command sent to a hidden layer (e.g. from a shortcut) changes nothing', async () => {
    const { board } = await lessonBoard();
    // The test plugin's shortcut adds a square to its topmost layer ("b").
    board.setLayerVisible('b', false);
    const before = JSON.stringify(board.serialize());
    expect(board.handleKey(key('b', { ctrlKey: true, altKey: true }))).toBe(true);
    expect(JSON.stringify(board.serialize())).toBe(before);
    expect(board.history.canUndo).toBe(false);
    expect(board.notices.list).toHaveLength(0);
    board.setLayerVisible('b', true);
    board.handleKey(key('b', { ctrlKey: true, altKey: true }));
    expect(boxes(board, 'b')).toBe(1);
  });

  it('WAR-02: a hidden layer takes no input', async () => {
    const { board } = await lessonBoard();
    board.setLayerVisible('a', false);
    board.tools.setActive('test-fixture-layer/box');
    board.document.setActiveLayer('a');
    expect(board.dispatchPointer(pointerDown(5, 5))).toBe(false);
    expect(boxes(board, 'a')).toBe(0);
    board.setLayerVisible('a', true);
    expect(board.dispatchPointer(pointerDown(5, 5))).toBe(true);
    expect(boxes(board, 'a')).toBe(1);
  });

  it('WAR-02: visibility is a view setting and is not undone (D12)', async () => {
    const { board } = await lessonBoard();
    board.setLayerVisible('a', false);
    expect(board.history.undoCount).toBe(0);
    board.undo();
    expect(board.document.getLayer('a')?.visible).toBe(false);
  });

  it('WAR-02: the visibility is saved in the lesson', async () => {
    const { board } = await lessonBoard();
    board.setLayerVisible('drawing', false);
    const saved = board.serialize();
    expect(saved.layers.map((layer) => layer.visible)).toEqual([true, true, true, false]);
    const { board: reopened, root } = await lessonBoard(saved);
    expect(reopened.document.getLayer('drawing')?.visible).toBe(false);
    expect(container(root, 'drawing').hidden).toBe(true);
    expect(reopened.serialize()).toEqual(saved);
  });
});

describe('WAR-03: locking a layer', () => {
  it('WAR-03: no tool of the test plugin creates, changes or removes elements on a locked layer', async () => {
    const { board, root } = await lessonBoard();
    addBoxOn(board, 'a');
    board.setLayerLocked('a', true);
    const before = JSON.stringify(board.serialize());
    const steps = board.history.undoCount;

    for (const tool of ['test-fixture-layer/box', 'test-fixture-layer/clear']) {
      board.tools.setActive(tool);
      board.document.setActiveLayer('a');
      expect(board.dispatchPointer(pointerDown(9, 9))).toBe(false);
    }
    expect(JSON.stringify(board.serialize())).toBe(before);
    expect(board.history.undoCount).toBe(steps);
    expect(container(root, 'a').querySelectorAll('.fixture-box')).toHaveLength(1);
  });

  it('WAR-03: a plugin command sent to a locked layer (e.g. from a shortcut) changes nothing', async () => {
    const { board } = await lessonBoard();
    // The test plugin's shortcut adds a square to its topmost layer ("b").
    board.setLayerLocked('b', true);
    const before = JSON.stringify(board.serialize());
    expect(board.handleKey(key('b', { ctrlKey: true, altKey: true }))).toBe(true);
    expect(JSON.stringify(board.serialize())).toBe(before);
    expect(board.history.canUndo).toBe(false);
    expect(board.notices.list).toHaveLength(0);
  });

  it('WAR-03: other layers keep working while one is locked; unlocking allows editing again', async () => {
    const { board } = await lessonBoard();
    board.setLayerLocked('a', true);
    addBoxOn(board, 'b');
    expect(boxes(board, 'b')).toBe(1);
    board.setLayerLocked('a', false);
    addBoxOn(board, 'a');
    expect(boxes(board, 'a')).toBe(1);
  });

  it('WAR-03: the lock is shown on the layer and saved in the lesson; it is not undone (D12)', async () => {
    const { board, root } = await lessonBoard();
    board.setLayerLocked('a', true);
    expect(container(root, 'a').dataset['locked']).toBe('true');
    expect(board.history.undoCount).toBe(0);
    const saved = board.serialize();
    expect(saved.layers.map((layer) => layer.locked)).toEqual([false, true, false, false]);
    const { board: reopened } = await lessonBoard(saved);
    expect(reopened.document.getLayer('a')?.locked).toBe(true);
  });
});

describe('WAR-04: layer order', () => {
  it('WAR-04: moving a layer changes the rendering order', async () => {
    const { board, root } = await lessonBoard();
    board.moveLayer('drawing', 0);
    expect(order(root)).toEqual(['drawing', 'bg', 'a', 'b']);
    expect([...root.children].map((element) => (element as HTMLElement).style.zIndex)).toEqual([
      '0',
      '1',
      '2',
      '3',
    ]);
    board.moveLayer('a', 3);
    expect(order(root)).toEqual(['drawing', 'bg', 'b', 'a']);
    // Moving out of range stops at the top or the bottom.
    board.moveLayer('bg', 99);
    expect(order(root)).toEqual(['drawing', 'b', 'a', 'bg']);
  });

  it('WAR-04: a change of order is undone and redone (D12)', async () => {
    const { board, root } = await lessonBoard();
    board.moveLayer('b', 1);
    board.moveLayer('drawing', 0);
    expect(order(root)).toEqual(['drawing', 'bg', 'b', 'a']);
    board.undo();
    expect(order(root)).toEqual(['bg', 'b', 'a', 'drawing']);
    board.undo();
    expect(order(root)).toEqual(['bg', 'a', 'b', 'drawing']);
    board.redo();
    board.redo();
    expect(order(root)).toEqual(['drawing', 'bg', 'b', 'a']);
  });

  it('WAR-04: moving a layer to its own place is not recorded', async () => {
    const { board } = await lessonBoard();
    board.moveLayer('a', 1);
    expect(board.history.canUndo).toBe(false);
  });

  it('WAR-04: the order is saved in the lesson', async () => {
    const { board } = await lessonBoard();
    board.moveLayer('bg', 3);
    const saved = board.serialize();
    expect(saved.layers.map((layer) => layer.id)).toEqual(['a', 'b', 'drawing', 'bg']);
    const { root } = await lessonBoard(saved);
    expect(order(root)).toEqual(['a', 'b', 'drawing', 'bg']);
  });
});

describe('WAR-05: layer opacity', () => {
  it('WAR-05: opacity 0–100 % in steps of 5 % applies to the whole layer', async () => {
    const { board, root } = await lessonBoard();
    board.setLayerOpacity('a', 0.35);
    expect(container(root, 'a').style.opacity).toBe('0.35');
    board.setLayerOpacity('a', 0.42);
    expect(board.document.getLayer('a')?.opacity).toBe(0.4);
    board.setLayerOpacity('a', 0);
    expect(container(root, 'a').style.opacity).toBe('0');
    board.setLayerOpacity('a', 1.5);
    expect(container(root, 'a').style.opacity).toBe('1');
    // Other layers keep full opacity.
    expect(container(root, 'b').style.opacity).toBe('1');
  });

  it('WAR-05: a change of opacity is undone and redone (D12)', async () => {
    const { board, root } = await lessonBoard();
    board.setLayerOpacity('a', 0.5);
    board.setLayerOpacity('a', 0.25);
    board.undo();
    expect(container(root, 'a').style.opacity).toBe('0.5');
    board.undo();
    expect(container(root, 'a').style.opacity).toBe('1');
    board.redo();
    expect(container(root, 'a').style.opacity).toBe('0.5');
  });

  it('WAR-05: moving the slider is one undo step', async () => {
    const { board } = await lessonBoard();
    for (const value of [0.95, 0.9, 0.85, 0.8, 0.75]) {
      board.setLayerOpacity('a', value, { merge: true });
    }
    board.history.seal();
    board.setLayerOpacity('a', 0.5, { merge: true });
    board.history.seal();
    expect(board.history.undoCount).toBe(2);
    board.undo();
    expect(board.document.getLayer('a')?.opacity).toBe(0.75);
    board.undo();
    expect(board.document.getLayer('a')?.opacity).toBe(1);
  });

  it('WAR-05: slider changes of different layers are separate steps', async () => {
    const { board } = await lessonBoard();
    board.setLayerOpacity('a', 0.5, { merge: true });
    board.setLayerOpacity('b', 0.5, { merge: true });
    expect(board.history.undoCount).toBe(2);
  });

  it('WAR-05: the opacity is saved in the lesson', async () => {
    const { board } = await lessonBoard();
    board.setLayerOpacity('b', 0.6);
    const saved = board.serialize();
    expect(saved.layers.map((layer) => layer.opacity)).toEqual([1, 1, 0.6, 1]);
    const { board: reopened, root } = await lessonBoard(saved);
    expect(reopened.document.getLayer('b')?.opacity).toBe(0.6);
    expect(container(root, 'b').style.opacity).toBe('0.6');
  });

  it('WAR-05: a lesson without layer settings opens with the defaults', async () => {
    const { board } = await lessonBoard(documentOf(layerOf('test-fixture-layer', 'old')));
    const layer = board.document.getLayer('old');
    expect([layer?.visible, layer?.locked, layer?.opacity]).toEqual([true, false, 1]);
  });

  it('DAN-03: a slider moved back to its starting value leaves no undo step', async () => {
    const { board } = await lessonBoard();
    board.setLayerOpacity('a', 0.5);
    for (const value of [0.45, 0.4, 0.45, 0.5]) board.setLayerOpacity('a', value, { merge: true });
    board.history.seal();
    expect(board.history.undoCount).toBe(1);
    // Continuing the same drag after returning starts a new step; it does not join the old one.
    for (const value of [0.45, 0.5, 0.55]) board.setLayerOpacity('a', value, { merge: true });
    board.history.seal();
    expect(board.history.undoCount).toBe(2);
    board.undo();
    expect(board.document.getLayer('a')?.opacity).toBe(0.5);
    board.undo();
    expect(board.document.getLayer('a')?.opacity).toBe(1);
  });
});

describe('WAR-03: undo and redo stop at a locked or hidden layer (P17 a)', () => {
  it('WAR-03: undo and redo of a change of a locked layer are held back with a notice', async () => {
    const { board } = await lessonBoard();
    addBoxOn(board, 'a');
    board.setLayerLocked('a', true);
    expect(board.undo()).toBe(false);
    expect(boxes(board, 'a')).toBe(1);
    expect(board.history.undoCount).toBe(1);
    expect(board.notices.list.map((notice) => [notice.key, notice.pluginId])).toEqual([
      ['notice.historyLocked', 'test-fixture-layer'],
    ]);
    // Repeated attempts do not pile up the same message.
    board.handleKey(key('z', { ctrlKey: true }));
    board.handleTap(2);
    expect(board.notices.list).toHaveLength(1);

    board.setLayerLocked('a', false);
    expect(board.undo()).toBe(true);
    expect(boxes(board, 'a')).toBe(0);
    board.setLayerLocked('a', true);
    expect(board.redo()).toBe(false);
    expect(boxes(board, 'a')).toBe(0);
    board.setLayerLocked('a', false);
    expect(board.redo()).toBe(true);
    expect(boxes(board, 'a')).toBe(1);
  });

  it('DAN-03: undo and redo of a change of a hidden layer are held back with a notice', async () => {
    const { board } = await lessonBoard();
    addBoxOn(board, 'b');
    board.setLayerVisible('b', false);
    expect(board.undo()).toBe(false);
    expect(boxes(board, 'b')).toBe(1);
    expect(board.notices.list.map((notice) => notice.key)).toEqual(['notice.historyHidden']);
    board.setLayerVisible('b', true);
    expect(board.undo()).toBe(true);
    expect(boxes(board, 'b')).toBe(0);
  });

  it('DAN-03: the chronology stays: earlier steps wait until the blocked step can be undone (P4)', async () => {
    const { board } = await lessonBoard();
    addBoxOn(board, 'b');
    addBoxOn(board, 'a');
    board.setLayerLocked('a', true);
    expect(board.undo()).toBe(false);
    expect([boxes(board, 'a'), boxes(board, 'b')]).toEqual([1, 1]);
  });

  it('WAR-04: order and opacity of a locked or hidden layer are still undone (settings, D12)', async () => {
    const { board } = await lessonBoard();
    board.setLayerOpacity('a', 0.5);
    board.moveLayer('b', 0);
    board.setLayerLocked('a', true);
    board.setLayerVisible('b', false);
    expect(board.undo()).toBe(true);
    expect(board.document.indexOf('b')).toBe(2);
    expect(board.undo()).toBe(true);
    expect(board.document.getLayer('a')?.opacity).toBe(1);
    expect(board.notices.list).toHaveLength(0);
  });
});

describe('DAN-03: adding and removing layers (P17 b)', () => {
  it('DAN-03: a new layer is added above the given position, becomes active and can be undone', async () => {
    const { board, root } = await lessonBoard();
    const added = await board.addLayer('test-fixture-layer', 2);
    expect(order(root)).toEqual(['bg', 'a', added, 'b', 'drawing']);
    expect(board.document.activeLayerId).toBe(added);
    expect(container(root, added).dataset['status']).toBe('ready');
    addBoxOn(board, added);

    board.undo();
    board.undo();
    expect(order(root)).toEqual(['bg', 'a', 'b', 'drawing']);
    board.redo();
    expect(order(root)).toEqual(['bg', 'a', added, 'b', 'drawing']);
    board.redo();
    expect(boxes(board, added)).toBe(1);
    expect(container(root, added).querySelectorAll('.fixture-box')).toHaveLength(1);
  });

  it('DAN-03: a removed layer comes back with its data and settings on undo', async () => {
    const { board, root } = await lessonBoard();
    addBoxOn(board, 'a', 3);
    addBoxOn(board, 'a', 7);
    board.setLayerOpacity('a', 0.6);
    board.setLayerVisible('a', false);
    const before = JSON.stringify(board.serialize());

    expect(board.removeLayer('a')).toBe(true);
    expect(order(root)).toEqual(['bg', 'b', 'drawing']);
    expect(board.serialize().layers.some((layer) => layer.id === 'a')).toBe(false);

    board.undo();
    expect(JSON.stringify(board.serialize())).toBe(before);
    expect(order(root)).toEqual(['bg', 'a', 'b', 'drawing']);
    board.setLayerVisible('a', true);
    expect(container(root, 'a').querySelectorAll('.fixture-box')).toHaveLength(2);

    board.redo();
    expect(order(root)).toEqual(['bg', 'b', 'drawing']);
  });

  it('DAN-03: a broken layer or one without its plugin comes back unchanged after removal', async () => {
    const broken = defineLayerPlugin<{ n: number }>({
      schemaVersion: 1,
      createData: () => ({ n: 0 }),
      serialize: (data) => ({ n: data.n }),
      deserialize: () => {
        throw new Error('cannot read');
      },
      mountLayer: () => ({ render: () => undefined }),
    });
    const source: PluginSource = {
      manifest: {
        id: 'broken-one',
        version: '1.0.0',
        apiVersion: '1.0.0',
        translations: {
          pl: { name: 'Zepsuta', description: 'Opis.' },
          en: { name: 'Broken', description: 'Description.' },
        },
      },
      load: () => Promise.resolve({ default: broken }),
    };
    const lesson = documentOf(
      { ...layerOf('broken-one', 'x'), schemaVersion: 1, data: { n: 5 } },
      { ...layerOf('unknown-plugin', 'y'), schemaVersion: 3, data: { kept: true } },
      layerOf('test-fixture-layer', 'z'),
    );
    const board = createTestBoard([...allSources, source], lesson);
    await board.loadLayers();
    attachToBody(board);
    expect(board.document.getLayer('x')?.status).toBe('broken');
    expect(board.document.getLayer('y')?.status).toBe('missing');
    const before = JSON.stringify(board.serialize());

    expect(board.removeLayer('x')).toBe(true);
    expect(board.removeLayer('y')).toBe(true);
    board.undo();
    board.undo();
    expect(JSON.stringify(board.serialize())).toBe(before);
    expect(board.document.getLayer('x')?.status).toBe('broken');
    expect(board.document.getLayer('y')?.status).toBe('missing');
  });

  it('WAR-03: a locked layer cannot be removed', async () => {
    const { board } = await lessonBoard();
    board.setLayerLocked('a', true);
    expect(board.canRemoveLayer('a')).toBe(false);
    expect(board.removeLayer('a')).toBe(false);
    expect(board.document.getLayer('a')).toBeDefined();
    expect(board.history.canUndo).toBe(false);
  });

  it('DAN-03: the last layer of the lesson cannot be removed', async () => {
    const { board } = await lessonBoard(documentOf(layerOf('test-fixture-layer', 'only')));
    expect(board.canRemoveLayer('only')).toBe(false);
    expect(board.removeLayer('only')).toBe(false);
    expect(board.document.layers).toHaveLength(1);
  });

  it('DAN-03: undoing the addition of a locked layer is held back (P17 a)', async () => {
    const { board } = await lessonBoard();
    const added = await board.addLayer('test-fixture-layer');
    board.setLayerLocked(added, true);
    expect(board.undo()).toBe(false);
    expect(board.document.getLayer(added)).toBeDefined();
    expect(board.notices.list.map((notice) => notice.key)).toEqual(['notice.historyLocked']);
  });

  it('DAN-03: removing the active layer makes the layer at its place active', async () => {
    const { board } = await lessonBoard();
    board.document.setActiveLayer('b');
    board.removeLayer('b');
    expect(board.document.activeLayerId).toBe('drawing');
  });
});
