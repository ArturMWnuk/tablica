// @vitest-environment happy-dom
// Integration tests of the layer system with the built-in plugins and the test plugin
// (WAR-01, WAR-06, WAR-12).
import {
  API_VERSION,
  defineLayerPlugin,
  LayerAccessError,
  type LayerPlugin,
  type PluginContext,
  validateManifest,
} from '@tablica/plugin-api';
import { flattenKeys } from '../lib/i18n/core';
import fixtureManifest from '@tablica/test-fixture-layer/manifest.json';
import fixturePlugin, { addBox, type FixtureData } from '@tablica/test-fixture-layer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PluginSource } from '../lib/core/plugin-manager';
import { builtinPlugins, newLessonDocument } from './builtin';
import {
  attachToBody,
  containers,
  createTestBoard,
  documentOf,
  layerOf,
  pointerDown,
} from './test-support';

const fixtureSource: PluginSource = {
  manifest: fixtureManifest,
  load: () => import('@tablica/test-fixture-layer'),
};
const allSources = [...builtinPlugins, fixtureSource];

function manifestFor(id: string, apiVersion = '1.0.0') {
  return {
    id,
    version: '1.0.0',
    apiVersion,
    translations: {
      pl: { name: `PL ${id}`, description: 'Opis.' },
      en: { name: `EN ${id}`, description: 'Description.' },
    },
  };
}

function sourceOf(id: string, plugin: LayerPlugin<unknown>): PluginSource {
  return { manifest: manifestFor(id), load: () => Promise.resolve({ default: plugin }) };
}

function boxesOf(root: HTMLElement, layerId: string): HTMLElement[] {
  const container = root.querySelector(`[data-layer-id="${layerId}"]`);
  return [...(container?.querySelectorAll<HTMLElement>('.fixture-box') ?? [])];
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('WAR-01: many layers on top of each other', () => {
  it('WAR-01: a new lesson has background, multimedia and drawing layers rendered in this order', async () => {
    const board = createTestBoard(builtinPlugins, newLessonDocument());
    await board.loadLayers();
    const root = attachToBody(board);

    const stack = containers(root);
    expect(stack.map((element) => element.dataset['pluginId'])).toEqual([
      'layer-background',
      'layer-media',
      'layer-drawing',
    ]);
    expect(stack.map((element) => element.style.zIndex)).toEqual(['0', '1', '2']);
    expect(stack.map((element) => element.dataset['status'])).toEqual(['ready', 'ready', 'ready']);
    expect(root.querySelector('.background-surface')).not.toBeNull();
    expect(root.querySelector('.media-items')).not.toBeNull();
    expect(root.querySelector('canvas.drawing-canvas')).not.toBeNull();
    expect(board.serialize().layers.map((layer) => layer.pluginId)).toEqual([
      'layer-background',
      'layer-media',
      'layer-drawing',
    ]);
  });

  it('WAR-01: rendering order follows the order of the layer list', async () => {
    const lesson = documentOf(
      layerOf('layer-drawing', 'a'),
      layerOf('layer-background', 'b'),
      layerOf('test-fixture-layer', 'c'),
      layerOf('layer-media', 'd'),
    );
    const board = createTestBoard(allSources, lesson);
    await board.loadLayers();
    const root = attachToBody(board);
    expect(containers(root).map((element) => element.dataset['layerId'])).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
    expect(containers(root).map((element) => Number(element.style.zIndex))).toEqual([0, 1, 2, 3]);

    // A layer added later goes on top.
    const added = await board.addLayer('test-fixture-layer');
    expect(containers(root).at(-1)?.dataset['layerId']).toBe(added);
    expect(containers(root).at(-1)?.style.zIndex).toBe('4');
  });

  it('WAR-01: elements of all visible layers are shown together and move and zoom together', async () => {
    const lesson = documentOf(
      layerOf('layer-background', 'bg'),
      layerOf('test-fixture-layer', 'lower'),
      layerOf('layer-media', 'media'),
      layerOf('test-fixture-layer', 'upper'),
      layerOf('layer-drawing', 'drawing'),
    );
    const board = createTestBoard(allSources, lesson);
    await board.loadLayers();
    const root = attachToBody(board);
    board.document.setActiveLayer('lower');
    board.tools.setActive('test-fixture-layer/box');
    board.dispatchPointer(pointerDown(10, 20));
    board.document.setActiveLayer('upper');
    board.dispatchPointer(pointerDown(100, 50));

    const lowerBox = () => boxesOf(root, 'lower')[0];
    const upperBox = () => boxesOf(root, 'upper')[0];
    expect(lowerBox()?.style.left).toBe('10px');
    expect(upperBox()?.style.left).toBe('100px');
    for (const element of containers(root)) expect(element.style.display).not.toBe('none');

    const renders = vi.fn();
    const spyPlugin = defineLayerPlugin<null>({
      schemaVersion: 1,
      createData: () => null,
      serialize: () => null,
      deserialize: () => null,
      mountLayer: () => ({ render: renders }),
    });
    const spyBoard = createTestBoard([sourceOf('spy', spyPlugin)], documentOf(layerOf('spy')));
    await spyBoard.loadLayers();
    attachToBody(spyBoard);
    renders.mockClear();
    spyBoard.camera.panBy(5, 5);
    expect(renders).toHaveBeenCalledTimes(1);

    // Pan and zoom by the shared camera: every layer redraws with the same transform.
    board.camera.set({ x: -30, y: 15, zoom: 2 });
    expect(lowerBox()?.style.left).toBe(`${10 * 2 - 30}px`);
    expect(lowerBox()?.style.top).toBe(`${20 * 2 + 15}px`);
    expect(lowerBox()?.style.width).toBe('40px');
    expect(upperBox()?.style.left).toBe(`${100 * 2 - 30}px`);
    expect(upperBox()?.style.top).toBe(`${50 * 2 + 15}px`);
    expect(upperBox()?.style.width).toBe('40px');

    board.camera.zoomAt(0.5, { x: 0, y: 0 });
    expect(lowerBox()?.style.left).toBe(`${10 - 15}px`);
    expect(upperBox()?.style.width).toBe('20px');
  });

  it('WAR-01: a lesson may contain any number of layers of the same type (P3)', async () => {
    const lesson = documentOf(
      layerOf('layer-drawing', 'd1'),
      layerOf('layer-media', 'm1'),
      layerOf('layer-drawing', 'd2'),
      layerOf('layer-media', 'm2'),
      layerOf('layer-drawing', 'd3'),
      layerOf('layer-background', 'b1'),
      layerOf('layer-background', 'b2'),
    );
    const board = createTestBoard(builtinPlugins, lesson);
    await board.loadLayers();
    const root = attachToBody(board);
    expect(root.querySelectorAll('canvas.drawing-canvas')).toHaveLength(3);
    expect(root.querySelectorAll('.media-items')).toHaveLength(2);
    expect(root.querySelectorAll('.background-surface')).toHaveLength(2);
    expect(board.document.layers.every((layer) => layer.status === 'ready')).toBe(true);
  });
});

describe('WAR-06: layer isolation', () => {
  async function isolationBoard() {
    const lesson = documentOf(
      layerOf('layer-background', 'bg'),
      layerOf('test-fixture-layer', 'other'),
      layerOf('layer-media', 'media'),
      layerOf('test-fixture-layer', 'target'),
      layerOf('layer-drawing', 'drawing'),
    );
    const board = createTestBoard(allSources, lesson);
    await board.loadLayers();
    const root = attachToBody(board);
    board.tools.setActive('test-fixture-layer/box');
    for (const id of ['other', 'target']) {
      board.document.setActiveLayer(id);
      board.dispatchPointer(pointerDown(1, 1));
      board.dispatchPointer(pointerDown(2, 2));
    }
    return { board, root };
  }

  it('WAR-06: erasing everything on one layer leaves the data of other layers unchanged', async () => {
    const { board } = await isolationBoard();
    const before = board.serialize();
    board.tools.setActive('test-fixture-layer/clear');
    board.dispatchPointer(pointerDown(0, 0));
    const after = board.serialize();

    const byId = (doc: typeof before, id: string) => doc.layers.find((layer) => layer.id === id);
    expect(byId(after, 'target')?.data).toEqual({ boxes: [] });
    for (const id of ['bg', 'other', 'media', 'drawing']) {
      expect(JSON.stringify(byId(after, id))).toBe(JSON.stringify(byId(before, id)));
    }
  });

  it('WAR-06: a tool works only on the active layer of its own type', async () => {
    const { board, root } = await isolationBoard();
    board.document.setActiveLayer('other');
    // Activating a layer of another type does not redirect the tool there.
    board.document.setActiveLayer('drawing');
    board.tools.setActive('test-fixture-layer/box');
    expect(board.dispatchPointer(pointerDown(50, 50))).toBe(true);
    expect(boxesOf(root, 'other')).toHaveLength(3);
    expect(boxesOf(root, 'target')).toHaveLength(2);
    expect(board.serialize().layers.find((layer) => layer.id === 'drawing')?.data).toEqual({
      strokes: [],
    });
  });

  it('WAR-06: a tool without a layer of its type does nothing', async () => {
    const board = createTestBoard(allSources, documentOf(layerOf('layer-drawing', 'drawing')));
    await board.loadLayers();
    // Load the test plugin so its tools are registered, without any layer of its type.
    await board.plugins.load('test-fixture-layer');
    board.tools.setActive('test-fixture-layer/box');
    expect(board.dispatchPointer(pointerDown(0, 0))).toBe(false);
    expect(board.serialize().layers[0]?.data).toEqual({ strokes: [] });
  });

  it('WAR-06: the API does not let a plugin write data of a layer it does not own', async () => {
    let context: PluginContext | undefined;
    const intruder = defineLayerPlugin<null>({
      schemaVersion: 1,
      createData: () => null,
      serialize: () => null,
      deserialize: () => null,
      activate: (ctx) => {
        context = ctx;
      },
      mountLayer: () => ({ render: () => undefined }),
    });
    const board = createTestBoard(
      [...allSources, sourceOf('intruder', intruder)],
      documentOf(layerOf('intruder', 'own'), layerOf('test-fixture-layer', 'foreign')),
    );
    await board.loadLayers();
    if (!context) throw new Error('Plugin was not activated');
    const access = context.document;

    // The plugin sees that the layer exists, but cannot get a handle to change it.
    expect(access.layers().map((layer) => layer.id)).toEqual(['own', 'foreign']);
    expect(() => access.layer('foreign')).toThrow(LayerAccessError);
    expect(() => access.layer('does-not-exist')).toThrow(LayerAccessError);
    expect(access.layer('own').id).toBe('own');
    expect(board.serialize().layers[1]?.data).toEqual({ boxes: [] });
  });

  describe('WAR-06: an error in a plugin does not stop the program', () => {
    const failing = (overrides: Partial<LayerPlugin<{ n: number }>>) =>
      defineLayerPlugin<{ n: number }>({
        schemaVersion: 1,
        createData: () => ({ n: 0 }),
        serialize: (data) => ({ n: data.n }),
        deserialize: (json) => ({ n: (json as { n: number }).n }),
        mountLayer: () => ({ render: () => undefined }),
        ...overrides,
      });

    async function boardWith(plugin: LayerPlugin<{ n: number }>, stored = { n: 7 }) {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const lesson = documentOf(
        layerOf('layer-background', 'bg'),
        { ...layerOf('faulty', 'faulty'), schemaVersion: 1, data: stored },
        layerOf('test-fixture-layer', 'fixture'),
      );
      const board = createTestBoard([...allSources, sourceOf('faulty', plugin)], lesson);
      await board.loadLayers();
      const root = attachToBody(board);
      return { board, root };
    }

    function expectOthersWork(board: ReturnType<typeof createTestBoard>, root: HTMLElement) {
      expect(board.document.getLayer('bg')?.status).toBe('ready');
      expect(board.document.getLayer('fixture')?.status).toBe('ready');
      board.tools.setActive('test-fixture-layer/box');
      expect(board.dispatchPointer(pointerDown(3, 3))).toBe(true);
      expect(boxesOf(root, 'fixture')).toHaveLength(1);
    }

    it('WAR-06: an error while drawing marks only that layer as broken and keeps its data', async () => {
      let fail = false;
      const { board, root } = await boardWith(
        failing({
          mountLayer: () => ({
            render: () => {
              if (fail) throw new Error('render failed');
            },
          }),
        }),
      );
      expect(board.document.getLayer('faulty')?.status).toBe('ready');
      fail = true;
      board.camera.panBy(1, 0);

      const faulty = root.querySelector<HTMLElement>('[data-layer-id="faulty"]');
      expect(faulty?.dataset['status']).toBe('broken');
      expect(faulty?.childElementCount).toBe(0);
      expect(board.notices.list.map((notice) => notice.key)).toEqual(['notice.layerBroken']);
      expect(board.serialize().layers[1]).toMatchObject({ id: 'faulty', data: { n: 7 } });
      expectOthersWork(board, root);
    });

    it('WAR-06: a layer that fails to load keeps its data unchanged for saving', async () => {
      const { board, root } = await boardWith(
        failing({
          deserialize: () => {
            throw new Error('bad data');
          },
        }),
        { n: 42 },
      );
      expect(board.document.getLayer('faulty')?.status).toBe('broken');
      expect(board.serialize().layers[1]).toMatchObject({ data: { n: 42 }, schemaVersion: 1 });
      expectOthersWork(board, root);
    });

    it('WAR-06: a plugin that fails to start does not stop other layers', async () => {
      const { board, root } = await boardWith(
        failing({
          activate: () => {
            throw new Error('activate failed');
          },
        }),
      );
      expect(board.document.getLayer('faulty')?.status).toBe('broken');
      expect(board.notices.list.map((notice) => notice.key)).toContain('notice.pluginFailed');
      expect(board.serialize().layers[1]).toMatchObject({ data: { n: 7 } });
      expectOthersWork(board, root);
    });

    it('WAR-06: a failing tool or command breaks only its layer', async () => {
      const faultyCommand = failing({
        activate: (context) => {
          context.registerTool<{ n: number }>({
            id: 'bump',
            labelKey: 'name',
            onPointer: (_event, layer) =>
              layer.execute({
                apply: (data) => {
                  data.n += 1;
                  if (data.n > 8) throw new Error('command failed');
                },
                revert: (data) => {
                  data.n -= 1;
                },
              }),
          });
        },
      });
      const { board, root } = await boardWith(faultyCommand);
      board.tools.setActive('faulty/bump');
      board.dispatchPointer(pointerDown(0, 0));
      expect(board.document.getLayer('faulty')?.status).toBe('ready');
      board.dispatchPointer(pointerDown(0, 0));
      expect(board.document.getLayer('faulty')?.status).toBe('broken');
      // The newest data that the plugin could still serialize is kept.
      expect(board.serialize().layers[1]).toMatchObject({ data: { n: 9 } });
      expect(board.history.canUndo).toBe(false);
      expectOthersWork(board, root);
    });

    it('WAR-06: a failing shortcut or panel breaks only its plugin', async () => {
      const { board, root } = await boardWith(
        failing({
          activate: (context) => {
            context.registerShortcut({
              id: 'boom',
              keys: 'Ctrl+Alt+X',
              labelKey: 'name',
              run: () => {
                throw new Error('shortcut failed');
              },
            });
          },
        }),
      );
      const key = { key: 'x', ctrlKey: true, altKey: true, shiftKey: false, metaKey: false };
      expect(board.handleKey(key)).toBe(true);
      expect(board.document.getLayer('faulty')?.status).toBe('broken');
      expect(board.shortcuts.list().some((item) => item.pluginId === 'faulty')).toBe(false);
      // A new layer of a plugin that stopped working does not start.
      const added = await board.addLayer('faulty');
      expect(board.document.getLayer(added)?.status).toBe('broken');
      expect(board.serialize().layers[1]).toMatchObject({ data: { n: 7 } });
      expectOthersWork(board, root);
    });
  });
});

describe('WAR-12: plugin written from the API documentation', () => {
  async function fixtureBoard() {
    const board = createTestBoard(
      [fixtureSource],
      documentOf(layerOf('test-fixture-layer', 'one'), layerOf('test-fixture-layer', 'two')),
      'pl',
    );
    await board.loadLayers();
    const root = attachToBody(board);
    return { board, root };
  }

  it('WAR-12: the test plugin registers tools, a shortcut and a panel with its translations', async () => {
    const { board } = await fixtureBoard();
    expect(board.tools.list().map((tool) => tool.key)).toEqual([
      'test-fixture-layer/box',
      'test-fixture-layer/clear',
    ]);
    expect(board.shortcuts.list().map((item) => item.key)).toEqual(['test-fixture-layer/add-box']);
    expect(board.panels.list().map((item) => item.key)).toEqual(['test-fixture-layer/summary']);

    const key = { key: 'B', ctrlKey: true, altKey: true, shiftKey: false, metaKey: false };
    expect(board.handleKey(key)).toBe(true);
    const panel = document.createElement('section');
    const unmount = board.mountPanel('test-fixture-layer/summary', panel);
    expect(panel.textContent).toBe('Kwadraty: 1');
    unmount();
    expect(panel.childElementCount).toBe(0);
  });

  it('WAR-12: plugin commands go through the common undo history', async () => {
    const { board, root } = await fixtureBoard();
    board.tools.setActive('test-fixture-layer/box');
    board.document.setActiveLayer('one');
    board.dispatchPointer(pointerDown(1, 1));
    board.document.setActiveLayer('two');
    board.dispatchPointer(pointerDown(2, 2));
    expect([boxesOf(root, 'one').length, boxesOf(root, 'two').length]).toEqual([1, 1]);

    expect(board.undo()).toBe(true);
    expect([boxesOf(root, 'one').length, boxesOf(root, 'two').length]).toEqual([1, 0]);
    expect(board.undo()).toBe(true);
    expect([boxesOf(root, 'one').length, boxesOf(root, 'two').length]).toEqual([0, 0]);
    expect(board.undo()).toBe(false);
    expect(board.redo()).toBe(true);
    expect([boxesOf(root, 'one').length, boxesOf(root, 'two').length]).toEqual([1, 0]);
  });

  it('WAR-12: plugin data survives serialization and older formats are migrated', async () => {
    const { board } = await fixtureBoard();
    const one = board.document.getLayer('one');
    if (!one) throw new Error('missing layer');
    board.execute('one', addBox(5, 6));
    const saved = board.serialize();
    expect(saved.layers[0]).toMatchObject({
      pluginId: 'test-fixture-layer',
      pluginVersion: fixtureManifest.version,
      schemaVersion: fixturePlugin.schemaVersion,
    });

    const reopened = createTestBoard([fixtureSource], structuredClone(saved));
    await reopened.loadLayers();
    expect(reopened.serialize()).toEqual(saved);

    const old = createTestBoard(
      [fixtureSource],
      documentOf({
        ...layerOf('test-fixture-layer', 'old'),
        schemaVersion: 1,
        data: { points: [[3, 4]] },
      }),
    );
    await old.loadLayers();
    const migrated = old.document.getLayer('old')?.data as FixtureData;
    expect(migrated.boxes).toEqual([{ id: 'migrated-0', x: 3, y: 4, size: 20 }]);
  });

  it('WAR-12: layer texts follow the interface language', async () => {
    const { board, root } = await fixtureBoard();
    board.execute('one', addBox(0, 0));
    expect(boxesOf(root, 'one')[0]?.title).toBe('Kwadrat');
  });
});

describe('UI-01: plugin translations', () => {
  it('UI-01: every plugin manifest is valid and has the same keys in PL and EN', () => {
    for (const source of allSources) {
      const manifest = source.manifest as typeof fixtureManifest;
      expect(validateManifest(manifest), manifest.id).toEqual([]);
      const pl = flattenKeys(manifest.translations.pl).sort();
      expect(flattenKeys(manifest.translations.en).sort(), manifest.id).toEqual(pl);
    }
  });
});

describe('WAR-12: API version compatibility', () => {
  it('WAR-12: a plugin for an incompatible major API version is not loaded and the user is told', async () => {
    const load = vi.fn(() => Promise.resolve({ default: fixturePlugin }));
    const future: PluginSource = { manifest: manifestFor('future', '2.0.0'), load };
    const board = createTestBoard(
      [...builtinPlugins, future],
      documentOf(layerOf('future', 'f'), layerOf('layer-drawing', 'd')),
    );
    await board.loadLayers();
    expect(load).not.toHaveBeenCalled();
    expect(board.plugins.get('future')).toBeUndefined();
    expect(board.notices.list).toEqual([
      expect.objectContaining({
        key: 'notice.pluginIncompatible',
        pluginId: 'future',
        params: { required: '2.0.0', provided: API_VERSION },
      }),
    ]);
    expect(board.document.getLayer('f')?.status).toBe('missing');
    expect(board.document.getLayer('d')?.status).toBe('ready');
  });

  it('WAR-12: an invalid manifest or module is rejected with a message', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const board = createTestBoard([
      { manifest: { id: 'Bad id' }, load: () => Promise.resolve({ default: {} }) },
      { manifest: manifestFor('empty'), load: () => Promise.resolve({ default: {} }) },
      { manifest: manifestFor('empty'), load: () => Promise.resolve({ default: {} }) },
    ]);
    expect(await board.plugins.load('empty')).toBeUndefined();
    expect(board.notices.list.map((notice) => notice.key)).toEqual([
      'notice.pluginInvalid',
      'notice.pluginDuplicate',
      'notice.pluginInvalid',
    ]);
  });

  it('WAR-12: plugin modules are loaded only when a lesson uses their layer type (NF-03)', async () => {
    const used = vi.fn(() => import('@tablica/test-fixture-layer'));
    const unused = vi.fn(() => import('@tablica/test-fixture-layer'));
    const board = createTestBoard(
      [
        { manifest: fixtureManifest, load: used },
        { manifest: manifestFor('unused'), load: unused },
      ],
      documentOf(layerOf('test-fixture-layer'), layerOf('test-fixture-layer')),
    );
    expect(used).not.toHaveBeenCalled();
    await board.loadLayers();
    expect(used).toHaveBeenCalledTimes(1);
    expect(unused).not.toHaveBeenCalled();
  });
});
