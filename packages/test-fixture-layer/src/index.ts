// Test plugin (T9) written only from the API documentation (docs/api/jak-napisac-warstwe.md).
// It uses every part of API 1.0: tool, shortcut, panel, translations, serialization with
// migration of an older format, and undoable commands. It is not shipped with the program.
import {
  defineLayerPlugin,
  type JsonValue,
  type LayerCommand,
  type LayerHandle,
  type PluginContext,
} from '@tablica/plugin-api';

/** A square on the board, in board coordinates. */
export interface Box {
  id: string;
  x: number;
  y: number;
  size: number;
}

export interface FixtureData {
  boxes: Box[];
}

export const BOX_SIZE = 20;

let counter = 0;
function newBoxId(): string {
  counter += 1;
  return `box-${Date.now().toString(36)}-${counter}`;
}

/** Command: adds a square. */
export function addBox(x: number, y: number): LayerCommand<FixtureData> {
  const box: Box = { id: newBoxId(), x, y, size: BOX_SIZE };
  return {
    apply: (data) => {
      data.boxes.push({ ...box });
    },
    revert: (data) => {
      data.boxes = data.boxes.filter((item) => item.id !== box.id);
    },
  };
}

/** Command: removes all squares of the layer. */
export function clearBoxes(): LayerCommand<FixtureData> {
  let removed: Box[] = [];
  return {
    apply: (data) => {
      removed = data.boxes;
      data.boxes = [];
    },
    revert: (data) => {
      data.boxes = removed;
    },
  };
}

function isBox(value: unknown): value is Box {
  if (typeof value !== 'object' || value === null) return false;
  const box = value as Record<string, unknown>;
  return (
    typeof box['id'] === 'string' &&
    typeof box['x'] === 'number' &&
    typeof box['y'] === 'number' &&
    typeof box['size'] === 'number'
  );
}

function ownReadyLayers(context: PluginContext): LayerHandle<FixtureData>[] {
  return context.document
    .layers()
    .filter((layer) => layer.pluginId === context.pluginId && layer.status === 'ready')
    .map((layer) => context.document.layer<FixtureData>(layer.id));
}

export default defineLayerPlugin<FixtureData>({
  // Version 1 stored squares as `{ points: [[x, y], ...] }`; version 2 as `{ boxes: Box[] }`.
  schemaVersion: 2,

  createData: () => ({ boxes: [] }),

  serialize: (data) => ({ boxes: data.boxes.map((box) => ({ ...box })) }),

  deserialize(json: JsonValue, schemaVersion: number): FixtureData {
    const value = (json ?? {}) as Record<string, JsonValue>;
    if (schemaVersion === 1) {
      const points = Array.isArray(value['points']) ? value['points'] : [];
      return {
        boxes: points.flatMap((point, index) =>
          Array.isArray(point) && typeof point[0] === 'number' && typeof point[1] === 'number'
            ? [{ id: `migrated-${index}`, x: point[0], y: point[1], size: BOX_SIZE }]
            : [],
        ),
      };
    }
    const boxes: unknown[] = Array.isArray(value['boxes']) ? value['boxes'] : [];
    return { boxes: boxes.filter(isBox).map((box) => ({ ...box })) };
  },

  activate(context) {
    context.registerTool<FixtureData>({
      id: 'box',
      labelKey: 'tool.box',
      onPointer(event, layer) {
        if (event.phase === 'down') layer.execute(addBox(event.world.x, event.world.y));
      },
    });
    context.registerTool<FixtureData>({
      id: 'clear',
      labelKey: 'tool.clear',
      onPointer(event, layer) {
        if (event.phase === 'down') layer.execute(clearBoxes());
      },
    });
    context.registerShortcut({
      id: 'add-box',
      keys: 'Ctrl+Alt+B',
      labelKey: 'shortcut.addBox',
      run() {
        const top = ownReadyLayers(context).at(-1);
        top?.execute(addBox(0, 0));
      },
    });
    context.registerPanel({
      id: 'summary',
      titleKey: 'panel.title',
      mount(element) {
        const text = document.createElement('p');
        text.className = 'fixture-summary';
        const count = ownReadyLayers(context).reduce(
          (sum, layer) => sum + layer.data.boxes.length,
          0,
        );
        text.textContent = context.t('panel.count', { count });
        element.append(text);
        return () => text.remove();
      },
    });
  },

  mountLayer(layer) {
    const root = document.createElement('div');
    root.className = 'fixture-boxes';
    layer.container.append(root);
    return {
      render() {
        const zoom = layer.camera.state.zoom;
        root.replaceChildren(
          ...layer.data.boxes.map((box) => {
            const element = document.createElement('div');
            const position = layer.camera.worldToScreen(box);
            element.className = 'fixture-box';
            element.dataset['boxId'] = box.id;
            element.title = layer.t('tool.box');
            element.style.position = 'absolute';
            element.style.left = `${position.x}px`;
            element.style.top = `${position.y}px`;
            element.style.width = `${box.size * zoom}px`;
            element.style.height = `${box.size * zoom}px`;
            return element;
          }),
        );
      },
      unmount() {
        root.remove();
      },
    };
  },
});
