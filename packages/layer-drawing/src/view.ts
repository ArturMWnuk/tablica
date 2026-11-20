// Display of a drawing layer (ADR-007). Three canvases with low-latency contexts
// (`desynchronized`, NF-04):
// - finished strokes,
// - the stroke being drawn, extended piece by piece (the cost of a move does not grow with the
//   length of the stroke),
// - the predicted tail of that stroke, cleared at every move.
import type { CameraState, LayerContext } from '@tablica/plugin-api';
import { HIGHLIGHTER_OPACITY, type Stroke, type StrokePoint, strokeOutline } from './stroke';

export interface DrawingData {
  strokes: Stroke[];
}

/** Outlines of finished strokes, computed once (strokes do not change after drawing). */
const outlines = new WeakMap<Stroke, number[][]>();

function outlineOf(stroke: Stroke): number[][] {
  let outline = outlines.get(stroke);
  if (!outline) {
    outline = strokeOutline(stroke);
    outlines.set(stroke, outline);
  }
  return outline;
}

type Context2D = CanvasRenderingContext2D;

/**
 * Paints a stroke outline. The outline is filled once, so the overlapping parts of one
 * highlighter stroke do not get darker; the highlighter multiplies the colours under it, so text
 * and strokes below stay readable (RYS-02). `opaque` paints without the highlighter's opacity
 * and blending (the live canvases apply them to the whole canvas).
 */
export function paintStroke(
  context: Context2D,
  stroke: Stroke,
  outline: number[][],
  opaque = false,
): void {
  if (outline.length === 0) return;
  context.save();
  if (stroke.tool === 'highlighter' && !opaque) {
    context.globalAlpha = HIGHLIGHTER_OPACITY;
    context.globalCompositeOperation = 'multiply';
  }
  context.fillStyle = stroke.color;
  context.beginPath();
  const [first, ...rest] = outline;
  context.moveTo(first?.[0] ?? 0, first?.[1] ?? 0);
  for (const [x = 0, y = 0] of rest) context.lineTo(x, y);
  context.closePath();
  context.fill('nonzero');
  context.restore();
}

/**
 * Index of the first point of the newest piece of a stroke: the piece is long enough to overlap
 * the previously drawn one by a few widths, so the pieces join without seams.
 */
export function tailStart(points: readonly StrokePoint[], width: number): number {
  const overlap = width * 3 + 12;
  let length = 0;
  let index = points.length - 1;
  while (index > 0 && (length < overlap || points.length - index < 4)) {
    const a = points[index];
    const b = points[index - 1];
    if (a && b) length += Math.hypot(a[0] - b[0], a[1] - b[1]);
    index -= 1;
  }
  return index;
}

function createCanvas(className: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.className = className;
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  return canvas;
}

function lowLatencyContext(canvas: HTMLCanvasElement): Context2D | null {
  try {
    return canvas.getContext('2d', { desynchronized: true });
  } catch {
    return null;
  }
}

/** Bounds of a painted outline in canvas pixels, to clear only what was painted. */
interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class DrawingView {
  private readonly canvas = createCanvas('drawing-canvas');
  private readonly live = createCanvas('drawing-live');
  private readonly prediction = createCanvas('drawing-prediction');
  private readonly context: Context2D | null;
  private readonly liveContext: Context2D | null;
  private readonly predictionContext: Context2D | null;
  private ratio = 1;
  private predicted: Bounds | undefined;

  constructor(private readonly layer: LayerContext<DrawingData>) {
    layer.container.append(this.canvas, this.live, this.prediction);
    this.context = lowLatencyContext(this.canvas);
    this.liveContext = lowLatencyContext(this.live);
    this.predictionContext = lowLatencyContext(this.prediction);
  }

  /** Redraws all finished strokes. */
  render(): void {
    this.resize();
    const context = this.context;
    if (!context) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.applyCamera(context, this.layer.camera.state);
    for (const stroke of this.layer.data.strokes) paintStroke(context, stroke, outlineOf(stroke));
  }

  /** Starts showing a new stroke being drawn. */
  beginLive(stroke: Stroke): void {
    this.clearLive();
    // The live canvases are painted opaque; the highlighter's opacity and multiplication are
    // applied to the whole canvas, so overlapping pieces do not get darker (RYS-02 K1).
    const highlighter = stroke.tool === 'highlighter';
    for (const canvas of [this.live, this.prediction]) {
      canvas.style.opacity = highlighter ? String(HIGHLIGHTER_OPACITY) : '';
      canvas.style.mixBlendMode = highlighter ? 'multiply' : '';
    }
    this.extendLive(stroke, []);
  }

  /** Draws the newest piece of the stroke and the predicted tail (NF-04). */
  extendLive(stroke: Stroke, predicted: readonly StrokePoint[]): void {
    const live = this.liveContext;
    if (!live) return;
    const camera = this.layer.camera.state;
    const start = tailStart(stroke.points, stroke.width);
    const piece = { ...stroke, points: stroke.points.slice(start) };
    this.applyCamera(live, camera);
    paintStroke(live, piece, strokeOutline(piece), true);
    const prediction = this.predictionContext;
    if (!prediction) return;
    if (this.predicted) {
      prediction.setTransform(1, 0, 0, 1, 0, 0);
      const { x, y, width, height } = this.predicted;
      prediction.clearRect(x, y, width, height);
      this.predicted = undefined;
    }
    if (predicted.length === 0) return;
    const tail = { ...stroke, points: [...stroke.points.slice(-2), ...predicted] };
    const outline = strokeOutline(tail);
    this.applyCamera(prediction, camera);
    paintStroke(prediction, tail, outline, true);
    this.predicted = this.boundsOf(outline, camera);
  }

  clearLive(): void {
    for (const [canvas, context] of [
      [this.live, this.liveContext],
      [this.prediction, this.predictionContext],
    ] as const) {
      if (!context) continue;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.predicted = undefined;
  }

  destroy(): void {
    this.canvas.remove();
    this.live.remove();
    this.prediction.remove();
  }

  private resize(): void {
    this.ratio = globalThis.devicePixelRatio || 1;
    const width = Math.round(this.layer.container.clientWidth * this.ratio);
    const height = Math.round(this.layer.container.clientHeight * this.ratio);
    for (const canvas of [this.canvas, this.live, this.prediction]) {
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
    }
  }

  private applyCamera(context: Context2D, camera: CameraState): void {
    const scale = this.ratio * camera.zoom;
    context.setTransform(scale, 0, 0, scale, this.ratio * camera.x, this.ratio * camera.y);
  }

  private boundsOf(outline: number[][], camera: CameraState): Bounds {
    const scale = this.ratio * camera.zoom;
    const xs = outline.map(([x = 0]) => x * scale + this.ratio * camera.x);
    const ys = outline.map(([, y = 0]) => y * scale + this.ratio * camera.y);
    const left = Math.floor(Math.min(...xs)) - 2;
    const top = Math.floor(Math.min(...ys)) - 2;
    return {
      x: left,
      y: top,
      width: Math.ceil(Math.max(...xs)) + 2 - left,
      height: Math.ceil(Math.max(...ys)) + 2 - top,
    };
  }
}
