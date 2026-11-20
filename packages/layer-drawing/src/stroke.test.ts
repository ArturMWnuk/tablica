import { describe, expect, it } from 'vitest';
import { PALETTE, WIDTH_PRESETS, DrawingSettings } from './settings';
import {
  HIGHLIGHTER_OPACITY,
  isHexColor,
  MAX_WIDTH,
  MIN_WIDTH,
  normalizeWidth,
  parseHexColor,
  pressureFactor,
  readStroke,
  type Stroke,
  type StrokePoint,
  type StrokeTool,
  strokeOutline,
  tiltFactor,
  widthFactor,
} from './stroke';
import { tailStart } from './view';

/** A straight horizontal stroke 0–200 px with constant pressure and tilt. */
function line(tool: StrokeTool, width: number, pressure: number, tilt = 0): Stroke {
  return {
    id: 'line',
    tool,
    color: '#000000',
    width,
    points: Array.from({ length: 41 }, (_, index) => [index * 5, 100, pressure, tilt]),
  };
}

/** Drawn width of a horizontal stroke, measured in its middle part. */
function drawnWidth(stroke: Stroke): number {
  const middle = strokeOutline(stroke).filter(([x = 0]) => x >= 60 && x <= 140);
  const ys = middle.map(([, y = 0]) => y);
  return Math.max(...ys) - Math.min(...ys);
}

describe('WEJ-05: pressure and tilt', () => {
  it('WEJ-05: at pressure 1.0 the pen stroke is at least twice as wide as at pressure 0.25', () => {
    expect(pressureFactor(1) / pressureFactor(0.25)).toBeGreaterThanOrEqual(2);
    const full = drawnWidth(line('pen', 8, 1));
    const light = drawnWidth(line('pen', 8, 0.25));
    expect(full / light).toBeGreaterThanOrEqual(2);
  });

  it('WEJ-05: a device without pressure (constant 0.5) draws the nominal width', () => {
    expect(pressureFactor(0.5)).toBe(1);
    for (const width of [2, 4, 10, 30]) {
      expect(drawnWidth(line('pen', width, 0.5))).toBeCloseTo(width, 1);
    }
  });

  it('WEJ-05: pressure outside 0–1 is clamped', () => {
    expect(pressureFactor(-1)).toBe(pressureFactor(0));
    expect(pressureFactor(3)).toBe(pressureFactor(1));
    expect(pressureFactor(Number.NaN)).toBe(pressureFactor(0));
  });

  it('WEJ-05: tilt above 45° widens the pen stroke up to 1.5× (D2)', () => {
    expect(tiltFactor(0)).toBe(1);
    expect(tiltFactor(45)).toBe(1);
    expect(tiltFactor(67.5)).toBeCloseTo(1.25);
    expect(tiltFactor(90)).toBeCloseTo(1.5);
    expect(tiltFactor(120)).toBeCloseTo(1.5);
    expect(drawnWidth(line('pen', 10, 0.5, 90)) / drawnWidth(line('pen', 10, 0.5, 0))).toBeCloseTo(
      1.5,
      1,
    );
    expect(drawnWidth(line('pen', 10, 0.5, 40))).toBeCloseTo(drawnWidth(line('pen', 10, 0.5, 0)));
  });

  it('WEJ-05: the highlighter ignores pressure and tilt (D2)', () => {
    expect(widthFactor('highlighter', 1, 90)).toBe(1);
    expect(widthFactor('highlighter', 0.1, 0)).toBe(1);
  });
});

describe('RYS-01: pen', () => {
  it('RYS-01: the stroke width follows the pressure of every point (WEJ-05)', () => {
    const stroke: Stroke = {
      ...line('pen', 10, 0.5),
      points: Array.from({ length: 41 }, (_, index) => [index * 5, 100, index < 20 ? 0.2 : 1, 0]),
    };
    const outline = strokeOutline(stroke);
    const widthAt = (from: number, to: number) => {
      const ys = outline.filter(([x = 0]) => x >= from && x <= to).map(([, y = 0]) => y);
      return Math.max(...ys) - Math.min(...ys);
    };
    expect(widthAt(150, 180)).toBeGreaterThan(widthAt(30, 60) * 2);
  });

  it('RYS-01: palette of at least 12 colours and at least 5 ready widths within 1–50 px', () => {
    expect(new Set(PALETTE).size).toBe(PALETTE.length);
    expect(PALETTE.length).toBeGreaterThanOrEqual(12);
    expect(PALETTE.every(isHexColor)).toBe(true);
    expect(WIDTH_PRESETS.pen.length).toBeGreaterThanOrEqual(5);
    for (const width of [...WIDTH_PRESETS.pen, ...WIDTH_PRESETS.highlighter]) {
      expect(width).toBeGreaterThanOrEqual(MIN_WIDTH);
      expect(width).toBeLessThanOrEqual(MAX_WIDTH);
    }
    expect([MIN_WIDTH, MAX_WIDTH]).toEqual([1, 50]);
  });

  it('RYS-01: any colour can be typed as a hex code; widths are clamped to 1–50 px', () => {
    expect(parseHexColor('#FF8800')).toBe('#ff8800');
    expect(parseHexColor('0a0')).toBe('#00aa00');
    expect(parseHexColor(' #12ab9C ')).toBe('#12ab9c');
    expect(parseHexColor('red')).toBeUndefined();
    expect(parseHexColor('#12345')).toBeUndefined();
    expect(normalizeWidth(0)).toBe(1);
    expect(normalizeWidth(80)).toBe(50);
    expect(normalizeWidth(7.4)).toBe(7);
  });

  it('RYS-01: settings keep a colour and width per tool and ignore invalid values', () => {
    const settings = new DrawingSettings();
    let changes = 0;
    settings.subscribe(() => (changes += 1));
    settings.update('pen', { color: '#E53935', width: 12 });
    expect(settings.style('pen')).toEqual({ color: '#e53935', width: 12 });
    expect(settings.style('highlighter').color).not.toBe('#e53935');
    settings.update('pen', { color: 'nonsense', width: 500 });
    expect(settings.style('pen')).toEqual({ color: '#e53935', width: 50 });
    settings.update('pen', { width: 50 });
    expect(changes).toBe(2);
  });

  it('RYS-01: the outline is a smoothed polygon that ends exactly at the newest point', () => {
    const stroke: Stroke = {
      ...line('pen', 6, 0.5),
      // A zigzag input: the outline follows it but is smoothed (streamline).
      points: Array.from({ length: 30 }, (_, index) => [index * 4, index % 2 ? 103 : 97, 0.5, 0]),
    };
    const outline = strokeOutline(stroke);
    expect(outline.length).toBeGreaterThan(10);
    const end = stroke.points.at(-1) ?? [0, 0, 0, 0];
    const nearest = Math.min(
      ...outline.map(([x = 0, y = 0]) => Math.hypot(x - end[0], y - end[1])),
    );
    // The round cap at the end lies one radius (3 px) away from the last point.
    expect(nearest).toBeLessThanOrEqual(3.5);
  });
});

describe('RYS-02: highlighter', () => {
  it('RYS-02: opacity 40 % and constant width without pressure', () => {
    expect(HIGHLIGHTER_OPACITY).toBe(0.4);
    const light = drawnWidth(line('highlighter', 16, 0.1));
    const strong = drawnWidth(line('highlighter', 16, 1, 80));
    expect(light).toBeCloseTo(16, 1);
    expect(strong).toBeCloseTo(16, 1);
  });
});

describe('NF-04: live drawing', () => {
  it('NF-04: a move redraws only the newest piece of the stroke, overlapping the previous one', () => {
    const points = Array.from({ length: 1000 }, (_, index): StrokePoint => [index * 2, 0, 0.5, 0]);
    // Overlap of three widths + 12 px = 24 px, i.e. 12 segments of 2 px.
    expect(points.length - tailStart(points, 4)).toBe(13);
    expect(tailStart(points.slice(0, 3), 4)).toBe(0);
    // Long strokes do not make the piece longer.
    expect(points.length - tailStart(points, 4)).toBe(13);
    // Wide strokes overlap more: 3 × 30 + 12 = 102 px, i.e. 51 segments.
    expect(points.length - tailStart(points, 30)).toBe(52);
  });
});

describe('RYS-01: stroke data', () => {
  it('RYS-01: a stored stroke is read back; invalid strokes are rejected', () => {
    const stroke = line('pen', 4, 0.5);
    expect(readStroke(JSON.parse(JSON.stringify(stroke)))).toEqual(stroke);
    expect(readStroke({ ...stroke, tool: 'brush' })).toBeUndefined();
    expect(readStroke({ ...stroke, color: 'black' })).toBeUndefined();
    expect(readStroke({ ...stroke, points: [] })).toBeUndefined();
    expect(readStroke({ ...stroke, points: [[1, 2, 3]] })).toBeUndefined();
    expect(readStroke(null)).toBeUndefined();
    expect(readStroke({ ...stroke, width: 99 })?.width).toBe(50);
  });
});
