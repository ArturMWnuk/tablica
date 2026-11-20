// Drawing layer plugin: pen with pressure and highlighter (step 1.4, RYS-01, RYS-02).
// Erasers, selection, text and the laser come in step 1.6; shapes and instruments in step 1.7.
import { defineLayerPlugin, type JsonValue } from '@tablica/plugin-api';
import { mountStylePanel } from './panel';
import { DrawingSettings } from './settings';
import { readStroke, type Stroke, type StrokeTool } from './stroke';
import { StrokeTools } from './tools';
import { type DrawingData, DrawingView } from './view';

export type { DrawingData } from './view';
export type { Stroke, StrokePoint, StrokeTool } from './stroke';
export { addStroke } from './tools';

/** Mounted layers of this plugin, so the tools can draw the live stroke at once (NF-04). */
const views = new Map<string, DrawingView>();

const TOOLS: readonly StrokeTool[] = ['pen', 'highlighter'];

export default defineLayerPlugin<DrawingData>({
  // Version 1 (step 1.2) had no content; version 2 stores strokes.
  schemaVersion: 2,

  createData: () => ({ strokes: [] }),

  serialize: (data) => ({
    strokes: data.strokes.map((stroke) => ({
      id: stroke.id,
      tool: stroke.tool,
      color: stroke.color,
      width: stroke.width,
      points: stroke.points.map((point) => [...point]),
    })),
  }),

  deserialize(json: JsonValue, schemaVersion: number): DrawingData {
    if (schemaVersion < 2) return { strokes: [] };
    const value = (json ?? {}) as Record<string, JsonValue>;
    const items: unknown[] = Array.isArray(value['strokes']) ? value['strokes'] : [];
    return {
      strokes: items.flatMap((item) => {
        const stroke: Stroke | undefined = readStroke(item);
        return stroke ? [stroke] : [];
      }),
    };
  },

  activate(context) {
    const settings = new DrawingSettings();
    const tools = new StrokeTools(settings, (layerId) => views.get(layerId));
    for (const tool of TOOLS) {
      context.registerTool<DrawingData>({
        id: tool,
        labelKey: `tool.${tool}`,
        onPointer: (event, layer) => tools.onPointer(tool, event, layer),
      });
    }
    context.registerPanel({
      id: 'style',
      titleKey: 'panel.title',
      mount: (element) => mountStylePanel(element, settings, context.t),
    });
  },

  mountLayer(layer) {
    const view = new DrawingView(layer);
    views.set(layer.id, view);
    return {
      render: () => view.render(),
      unmount() {
        view.destroy();
        if (views.get(layer.id) === view) views.delete(layer.id);
      },
    };
  },
});
