// Colour and width of the pen and the highlighter (RYS-01 K2). Kept for the session.
import { isHexColor, normalizeWidth, type StrokeTool } from './stroke';

/** RYS-01 K2: palette of 13 colours (at least 12 required). */
export const PALETTE: readonly string[] = [
  '#000000',
  '#ffffff',
  '#757575',
  '#e53935',
  '#fb8c00',
  '#fdd835',
  '#7cb342',
  '#2e7d32',
  '#00acc1',
  '#1e88e5',
  '#3949ab',
  '#8e24aa',
  '#d81b60',
];

/** RYS-01 K2: ready widths (at least 5) in pixels; any width 1–50 px with the slider. */
export const WIDTH_PRESETS: Readonly<Record<StrokeTool, readonly number[]>> = {
  pen: [1, 2, 4, 6, 10, 16],
  highlighter: [8, 12, 16, 24, 32],
};

export interface ToolStyle {
  readonly color: string;
  readonly width: number;
}

const DEFAULTS: Readonly<Record<StrokeTool, ToolStyle>> = {
  pen: { color: '#000000', width: 4 },
  highlighter: { color: '#fdd835', width: 16 },
};

export class DrawingSettings {
  private styles: Record<StrokeTool, ToolStyle> = { ...DEFAULTS };
  private readonly listeners = new Set<() => void>();

  style(tool: StrokeTool): ToolStyle {
    return this.styles[tool];
  }

  /** Changes the colour (`#rrggbb`) and/or width of a tool; invalid values are ignored. */
  update(tool: StrokeTool, change: { color?: string; width?: number }): void {
    const current = this.styles[tool];
    const color = change.color?.toLowerCase();
    const next: ToolStyle = {
      color: color !== undefined && isHexColor(color) ? color : current.color,
      width: change.width !== undefined ? normalizeWidth(change.width) : current.width,
    };
    if (next.color === current.color && next.width === current.width) return;
    this.styles = { ...this.styles, [tool]: next };
    for (const listener of this.listeners) listener();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
