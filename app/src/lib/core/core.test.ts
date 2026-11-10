import { describe, expect, it, vi } from 'vitest';
import { Camera } from './camera';
import { BoardDocument } from './document';
import { History } from './history';
import { normalizeKeys, ShortcutRegistry, ToolRegistry } from './registries';

describe('WAR-01: shared camera', () => {
  it('WAR-01: converts between board and container coordinates', () => {
    const camera = new Camera();
    camera.set({ x: 10, y: -20, zoom: 2 });
    expect(camera.worldToScreen({ x: 5, y: 5 })).toEqual({ x: 20, y: -10 });
    expect(camera.screenToWorld({ x: 20, y: -10 })).toEqual({ x: 5, y: 5 });
  });

  it('WAR-01: panning and zooming notify every layer', () => {
    const camera = new Camera();
    const listener = vi.fn();
    camera.changed.subscribe(listener);
    camera.panBy(3, 4);
    expect(camera.state).toEqual({ x: 3, y: 4, zoom: 1 });
    camera.zoomAt(2, { x: 100, y: 50 });
    // The anchor point stays in place.
    expect(camera.screenToWorld({ x: 100, y: 50 })).toEqual({ x: 97, y: 46 });
    expect(camera.state.zoom).toBe(2);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('WAR-01: rejects an invalid camera state', () => {
    const camera = new Camera();
    expect(() => camera.set({ x: 0, y: 0, zoom: 0 })).toThrow(RangeError);
    expect(() => camera.set({ x: Number.NaN, y: 0, zoom: 1 })).toThrow(RangeError);
  });
});

describe('WAR-01: document layer list', () => {
  it('WAR-01: keeps layers in order from the bottom to the top', () => {
    const doc = new BoardDocument({
      schemaVersion: 1,
      layers: ['a', 'b'].map((id) => ({
        id,
        pluginId: 'p',
        pluginVersion: null,
        schemaVersion: null,
        data: null,
      })),
    });
    const top = doc.addLayer('q');
    const bottom = doc.addLayer('q', 0);
    expect(doc.layers.map((layer) => layer.id)).toEqual([bottom, 'a', 'b', top]);
    expect(doc.layers.every((layer) => layer.status === 'loading')).toBe(true);
    expect(
      () =>
        new BoardDocument({
          schemaVersion: 1,
          layers: [doc.layers[1]!.stored, doc.layers[1]!.stored],
        }),
    ).toThrow();
  });

  it('WAR-06: the active layer of a type is the last activated one, else the topmost', () => {
    const doc = new BoardDocument();
    const p1 = doc.addLayer('p');
    const q1 = doc.addLayer('q');
    const p2 = doc.addLayer('p');
    expect(doc.activeLayerOf('p')?.id).toBe(p2);
    doc.setActiveLayer(p1);
    doc.setActiveLayer(q1);
    expect(doc.activeLayerId).toBe(q1);
    expect(doc.activeLayerOf('p')?.id).toBe(p1);
    expect(doc.activeLayerOf('q')?.id).toBe(q1);
    expect(doc.activeLayerOf('none')).toBeUndefined();
  });
});

describe('WAR-12: history of plugin commands', () => {
  it('WAR-12: executes, undoes and redoes changes in chronological order', () => {
    const history = new History();
    const log: string[] = [];
    const entry = (name: string) => ({
      apply: () => log.push(`+${name}`),
      revert: () => log.push(`-${name}`),
    });
    history.execute(entry('a'));
    history.execute(entry('b'));
    expect(history.undo()).toBe(true);
    expect(history.redo()).toBe(true);
    expect(history.undo()).toBe(true);
    history.execute(entry('c'));
    expect(history.canRedo).toBe(false);
    expect(log).toEqual(['+a', '+b', '-b', '+b', '-b', '+c']);
  });

  it('WAR-12: a failing command is not recorded', () => {
    const history = new History();
    expect(() =>
      history.execute({
        apply: () => {
          throw new Error('x');
        },
        revert: () => undefined,
      }),
    ).toThrow();
    expect(history.canUndo).toBe(false);
  });
});

describe('WAR-12: tools and shortcuts of plugins', () => {
  it('WAR-12: shortcut combinations are normalized', () => {
    expect(normalizeKeys('Shift+Ctrl+k')).toBe('ctrl+shift+k');
    expect(normalizeKeys('ctrl + alt + Delete')).toBe('ctrl+alt+delete');
    expect(normalizeKeys('Hyper+K')).toBeUndefined();
    expect(normalizeKeys('')).toBeUndefined();
  });

  it('WAR-12: a key press runs the matching shortcut; a taken combination is refused', () => {
    const registry = new ShortcutRegistry();
    const run = vi.fn();
    expect(registry.tryRegister('p', { id: 'a', keys: 'Ctrl+K', labelKey: 'a', run })).toBe(true);
    expect(registry.tryRegister('q', { id: 'b', keys: 'ctrl+k', labelKey: 'b', run })).toBe(false);
    expect(() =>
      registry.tryRegister('q', { id: 'c', keys: 'Super+K', labelKey: 'c', run }),
    ).toThrow();
    const press = { key: 'K', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false };
    expect(registry.match(press)?.key).toBe('p/a');
    expect(registry.match({ ...press, shiftKey: true })).toBeUndefined();
  });

  it('WAR-12: tools are identified by plugin and removed with their plugin', () => {
    const tools = new ToolRegistry();
    tools.register('p', { id: 'pen', labelKey: 'pen', onPointer: () => undefined });
    expect(() =>
      tools.register('p', { id: 'pen', labelKey: 'pen', onPointer: () => undefined }),
    ).toThrow();
    tools.setActive('p/pen');
    expect(tools.active?.pluginId).toBe('p');
    tools.removePlugin('p');
    expect(tools.active).toBeUndefined();
    expect(() => tools.setActive('p/pen')).toThrow();
  });
});
