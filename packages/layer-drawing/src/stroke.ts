// Strokes of the drawing layer and their outlines (RYS-01, RYS-02, WEJ-05).
// The outline is computed by perfect-freehand (ADR-007): a smoothed polygon whose width follows
// the pressure (and the tilt, D2) of every input point.
import { getStroke } from 'perfect-freehand';

export type StrokeTool = 'pen' | 'highlighter';

/** One input point: board x, board y, pressure 0–1, tilt in degrees 0–90. */
export type StrokePoint = [x: number, y: number, pressure: number, tilt: number];

export interface Stroke {
  readonly id: string;
  readonly tool: StrokeTool;
  /** Colour as `#rrggbb`. */
  readonly color: string;
  /** Nominal width in board pixels (width at pressure 0.5 without tilt). */
  readonly width: number;
  readonly points: StrokePoint[];
}

/** RYS-02 K1: opacity of the highlighter. */
export const HIGHLIGHTER_OPACITY = 0.4;
/** RYS-01 K2: range of the width slider, in pixels. */
export const MIN_WIDTH = 1;
export const MAX_WIDTH = 50;
/** Pressure reported by devices without pressure (WEJ-05 K2). */
export const NOMINAL_PRESSURE = 0.5;
/** D2: tilt above this angle widens the pen stroke… */
export const TILT_THRESHOLD = 45;
/** …up to this factor at a pen lying flat (90°). */
export const MAX_TILT_FACTOR = 1.5;

function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}

/**
 * WEJ-05 K1, K2: width multiplier for a pressure. 1 at the nominal pressure 0.5 (mouse,
 * fingers), 1.6 at full pressure and 0.7 at pressure 0.25, so full pressure gives more than
 * twice the width of a light touch.
 */
export function pressureFactor(pressure: number): number {
  return 0.4 + 1.2 * clamp(pressure, 0, 1);
}

/**
 * WEJ-05 K4, D2: width multiplier for the pen tilt (degrees from the perpendicular). Up to 45°
 * the width does not change; from 45° to 90° it grows linearly up to 1.5×.
 */
export function tiltFactor(tilt: number): number {
  const over = (clamp(tilt, 0, 90) - TILT_THRESHOLD) / (90 - TILT_THRESHOLD);
  return 1 + (MAX_TILT_FACTOR - 1) * clamp(over, 0, 1);
}

/** Width multiplier of one point. The highlighter has a constant width (RYS-02 K1, D2). */
export function widthFactor(tool: StrokeTool, pressure: number, tilt: number): number {
  return tool === 'highlighter' ? 1 : pressureFactor(pressure) * tiltFactor(tilt);
}

/** Clamps a width to the slider range and whole pixels (RYS-01 K2). */
export function normalizeWidth(width: number): number {
  return Math.round(clamp(width, MIN_WIDTH, MAX_WIDTH));
}

const SMOOTHING = { smoothing: 0.5, streamline: 0.4 } as const;

/**
 * Outline polygon of a stroke in board coordinates (RYS-01 K3). `extra` points (e.g. predicted
 * positions) are added at the end without being part of the stroke.
 *
 * perfect-freehand with `thinning: 1` gives a radius of `size × pressure`; feeding it half of
 * the width multiplier makes the drawn width exactly `width × widthFactor`.
 */
export function strokeOutline(stroke: Stroke, extra: readonly StrokePoint[] = []): number[][] {
  const input = [...stroke.points, ...extra].map(([x, y, pressure, tilt]) => [
    x,
    y,
    widthFactor(stroke.tool, pressure, tilt) / 2,
  ]);
  return getStroke(input, {
    size: stroke.width,
    thinning: stroke.tool === 'highlighter' ? 0 : 1,
    simulatePressure: false,
    // The end of the outline follows the newest point exactly (no lag while drawing).
    last: true,
    ...SMOOTHING,
  });
}

/** Rounds a point for storage (hundredths of a pixel, thousandths of pressure). */
export function roundPoint(point: StrokePoint): StrokePoint {
  const [x, y, pressure, tilt] = point;
  return [
    Math.round(x * 100) / 100,
    Math.round(y * 100) / 100,
    Math.round(clamp(pressure, 0, 1) * 1000) / 1000,
    Math.round(clamp(tilt, 0, 90) * 10) / 10,
  ];
}

const HEX_COLOR = /^#[0-9a-f]{6}$/;

/** Tells whether a value is a colour `#rrggbb` (lower case). */
export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value);
}

/** Reads a colour typed by the user (`#RGB`, `#RRGGBB`, with or without `#`). */
export function parseHexColor(text: string): string | undefined {
  const value = text.trim().toLowerCase().replace(/^#?/, '#');
  if (HEX_COLOR.test(value)) return value;
  if (/^#[0-9a-f]{3}$/.test(value)) {
    return `#${[...value.slice(1)].map((digit) => digit + digit).join('')}`;
  }
  return undefined;
}

function isPoint(value: unknown): value is StrokePoint {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((item) => typeof item === 'number' && Number.isFinite(item))
  );
}

/** Reads a stroke from lesson data; undefined when the value is not a valid stroke. */
export function readStroke(value: unknown): Stroke | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const item = value as Record<string, unknown>;
  const { id, tool, color, width, points } = item;
  if (typeof id !== 'string' || (tool !== 'pen' && tool !== 'highlighter')) return undefined;
  if (!isHexColor(color) || typeof width !== 'number' || !Array.isArray(points)) return undefined;
  if (points.length === 0 || !points.every(isPoint)) return undefined;
  return {
    id,
    tool,
    color,
    width: normalizeWidth(width),
    points: points.map((point) => [...point] as StrokePoint),
  };
}
