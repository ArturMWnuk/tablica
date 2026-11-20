// Pen and highlighter tools (RYS-01, RYS-02). The stroke being drawn is shown at once on the
// live canvas (NF-04); when the pointer is lifted it becomes one undoable command (DAN-03).
import type {
  LayerCommand,
  LayerHandle,
  ToolPointerEvent,
  ToolPointerSample,
} from '@tablica/plugin-api';
import type { DrawingSettings } from './settings';
import { roundPoint, type Stroke, type StrokePoint, type StrokeTool } from './stroke';
import type { DrawingData, DrawingView } from './view';

let counter = 0;
function newStrokeId(): string {
  counter += 1;
  return `stroke-${Date.now().toString(36)}-${counter}`;
}

/** Command: adds a finished stroke to the layer. */
export function addStroke(stroke: Stroke): LayerCommand<DrawingData> {
  return {
    apply: (data) => {
      data.strokes.push(stroke);
    },
    revert: (data) => {
      data.strokes = data.strokes.filter((item) => item.id !== stroke.id);
    },
  };
}

function pointOf(sample: ToolPointerSample): StrokePoint {
  return roundPoint([sample.world.x, sample.world.y, sample.pressure, sample.tilt]);
}

function samePosition(a: StrokePoint | undefined, b: StrokePoint): boolean {
  return a !== undefined && a[0] === b[0] && a[1] === b[1];
}

/** Handles the pointer for the pen and highlighter tools of one plugin activation. */
export class StrokeTools {
  /** Strokes being drawn, by layer id. */
  private readonly drafts = new Map<string, Stroke>();

  constructor(
    private readonly settings: DrawingSettings,
    private readonly viewOf: (layerId: string) => DrawingView | undefined,
  ) {}

  onPointer(tool: StrokeTool, event: ToolPointerEvent, layer: LayerHandle<DrawingData>): void {
    const view = this.viewOf(layer.id);
    switch (event.phase) {
      case 'down': {
        const { color, width } = this.settings.style(tool);
        const stroke: Stroke = { id: newStrokeId(), tool, color, width, points: [pointOf(event)] };
        this.drafts.set(layer.id, stroke);
        view?.beginLive(stroke);
        return;
      }
      case 'move': {
        const stroke = this.drafts.get(layer.id);
        if (!stroke) return;
        const point = pointOf(event);
        if (samePosition(stroke.points.at(-1), point))
          stroke.points[stroke.points.length - 1] = point;
        else stroke.points.push(point);
        view?.extendLive(stroke, event.predicted.map(pointOf));
        return;
      }
      case 'up': {
        const stroke = this.drafts.get(layer.id);
        if (!stroke) return;
        this.drafts.delete(layer.id);
        // A lifted pen reports no pressure: the last point keeps the pressure of the previous one.
        const last = stroke.points.at(-1);
        const [x, y] = pointOf(event);
        if (last && !samePosition(last, [x, y, 0, 0])) stroke.points.push([x, y, last[2], last[3]]);
        view?.clearLive();
        layer.execute(addStroke(stroke));
        return;
      }
      case 'cancel':
        this.drafts.delete(layer.id);
        view?.clearLive();
        return;
    }
  }
}
