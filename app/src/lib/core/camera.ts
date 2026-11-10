// Camera shared by all layers (WAR-01, ADR-007): one view transform for the whole board.
import type { CameraState, CameraView, Point } from '@tablica/plugin-api';
import { Emitter } from './emitter';

export class Camera implements CameraView {
  private current: CameraState = { x: 0, y: 0, zoom: 1 };
  readonly changed = new Emitter<CameraState>();

  get state(): CameraState {
    return this.current;
  }

  set(state: CameraState): void {
    if (!(state.zoom > 0) || !Number.isFinite(state.x) || !Number.isFinite(state.y)) {
      throw new RangeError('Invalid camera state');
    }
    this.current = { x: state.x, y: state.y, zoom: state.zoom };
    this.changed.emit(this.current);
  }

  /** Moves the view by a distance in container pixels. */
  panBy(dx: number, dy: number): void {
    this.set({ ...this.current, x: this.current.x + dx, y: this.current.y + dy });
  }

  /** Changes the zoom by `factor`, keeping the container point `anchor` in place. */
  zoomAt(factor: number, anchor: Point): void {
    const zoom = this.current.zoom * factor;
    const world = this.screenToWorld(anchor);
    this.set({ x: anchor.x - world.x * zoom, y: anchor.y - world.y * zoom, zoom });
  }

  worldToScreen(point: Point): Point {
    const { x, y, zoom } = this.current;
    return { x: point.x * zoom + x, y: point.y * zoom + y };
  }

  screenToWorld(point: Point): Point {
    const { x, y, zoom } = this.current;
    return { x: (point.x - x) / zoom, y: (point.y - y) / zoom };
  }
}
