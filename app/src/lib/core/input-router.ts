// Input pipeline (WEJ-01–06, NF-04): pointer events of the pen, fingers and mouse go either to the
// active tool or to the view (moving and zooming). Framework-independent; the board component
// feeds it with DOM events converted by `toInputEvent`.
import type { PointerKind, ToolPointerEvent, ToolPointerSample } from '@tablica/plugin-api';
import type { Board } from './board';
import type { Camera } from './camera';
import { LatencyMeter } from './latency';
import { TapGestureRecognizer } from './tap-gesture';

/** One position of a pointer, in board container coordinates. */
export interface InputPointer {
  readonly pointerId: number;
  readonly pointerType: string;
  readonly x: number;
  readonly y: number;
  readonly pressure: number;
  /** Degrees, as `PointerEvent.tiltX` / `tiltY`. */
  readonly tiltX: number;
  readonly tiltY: number;
  /** Radians, as `PointerEvent.altitudeAngle` (π/2 = perpendicular); preferred over tilt. */
  readonly altitudeAngle?: number | undefined;
  readonly buttons: number;
  readonly button: number;
  /** Milliseconds on the clock of `performance.now()` (`Event.timeStamp`). */
  readonly timeStamp: number;
}

/** A pointer event with its coalesced and predicted samples (NF-04 K2). */
export interface InputPointerEvent extends InputPointer {
  /** Samples merged into this event (oldest first); empty when the platform does not give them. */
  readonly coalesced: readonly InputPointer[];
  /** Predicted next positions; empty when the platform does not predict. */
  readonly predicted: readonly InputPointer[];
}

export interface InputWheel {
  readonly x: number;
  readonly y: number;
  readonly deltaX: number;
  readonly deltaY: number;
  /** 0 pixels, 1 lines, 2 pages (as `WheelEvent.deltaMode`). */
  readonly deltaMode: number;
  readonly ctrlKey: boolean;
}

/** WEJ-06 K1: touches are ignored this long after the last pen event, in milliseconds. */
export const PALM_REJECTION_MS = 500;
/** WEJ-05 K3: `buttons` bit of the eraser end of a pen. */
export const ERASER_BUTTON = 32;
/** D4: `buttons` bit of the first pen button (context menu, UI-06; it does not draw). */
export const PEN_BARREL_BUTTON = 2;
/** D5: zoom range 10–1000 %. */
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10;
/** Zoom change per pixel of wheel movement with Ctrl. */
const WHEEL_ZOOM_SPEED = 0.002;
const LINE_HEIGHT = 16;
const PAGE_HEIGHT = 800;

type PointerEventLike = Pick<
  PointerEvent,
  | 'pointerId'
  | 'pointerType'
  | 'clientX'
  | 'clientY'
  | 'pressure'
  | 'tiltX'
  | 'tiltY'
  | 'buttons'
  | 'button'
  | 'timeStamp'
> & {
  readonly altitudeAngle?: number;
  getCoalescedEvents?: () => PointerEventLike[];
  getPredictedEvents?: () => PointerEventLike[];
};

/**
 * Converts a DOM pointer event to the router's input. `origin` is the top-left corner of the
 * board container in client coordinates. Coalesced and predicted events are used where the
 * WebView gives them; otherwise the lists are empty and the event itself is used (NF-04 K2).
 */
export function toInputEvent(
  event: PointerEventLike,
  origin: { readonly x: number; readonly y: number },
): InputPointerEvent {
  const convert = (item: PointerEventLike): InputPointer => ({
    pointerId: item.pointerId,
    pointerType: item.pointerType,
    x: item.clientX - origin.x,
    y: item.clientY - origin.y,
    pressure: item.pressure,
    tiltX: item.tiltX ?? 0,
    tiltY: item.tiltY ?? 0,
    altitudeAngle: item.altitudeAngle,
    buttons: item.buttons,
    button: item.button,
    timeStamp: item.timeStamp,
  });
  const list = (read: (() => PointerEventLike[]) | undefined): InputPointer[] => {
    try {
      return read ? read.call(event).map(convert) : [];
    } catch {
      return [];
    }
  };
  return {
    ...convert(event),
    coalesced: list(event.getCoalescedEvents),
    predicted: list(event.getPredictedEvents),
  };
}

function kindOf(pointerType: string): PointerKind {
  return pointerType === 'pen' || pointerType === 'touch' ? pointerType : 'mouse';
}

function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}

/** WEJ-05 K4: tilt of the pen from the perpendicular, in degrees 0–90. */
export function tiltOf(pointer: Pick<InputPointer, 'tiltX' | 'tiltY' | 'altitudeAngle'>): number {
  if (pointer.altitudeAngle !== undefined && Number.isFinite(pointer.altitudeAngle)) {
    return clamp(90 - (pointer.altitudeAngle * 180) / Math.PI, 0, 90);
  }
  const x = clamp(Math.abs(pointer.tiltX), 0, 90);
  const y = clamp(Math.abs(pointer.tiltY), 0, 90);
  // A pen cannot lie flat on the screen: exactly 90° is a missing value (WebKit reports
  // tiltX 90 for pen events without tilt data), not a real tilt.
  if (x >= 90 || y >= 90) return 0;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const tangent = Math.hypot(Math.tan(radians(x)), Math.tan(radians(y)));
  return (Math.atan(tangent) * 180) / Math.PI;
}

/** What a pressed pointer does until it is lifted. */
type Track =
  | {
      readonly kind: 'tool';
      readonly pointerType: PointerKind;
      last: InputPointer;
      readonly restore?: { readonly tool: string | undefined };
    }
  | { readonly kind: 'pan'; x: number; y: number }
  | { readonly kind: 'gesture' }
  | { readonly kind: 'ignored' };

export interface InputSettings {
  /**
   * D4: after the first use of the pen in the session a single finger does not draw (it moves
   * the view). Switchable in the settings.
   */
  penDisablesFingerDrawing: boolean;
}

export class InputRouter {
  /** NF-04 K1: drawing latency of the active tool. */
  readonly latency = new LatencyMeter();
  readonly settings: InputSettings = { penDisablesFingerDrawing: true };
  /**
   * WEJ-05 K3: tool (`<pluginId>/<toolId>`) used while the eraser end of the pen touches the
   * board. Set by the composition root; when unset, the eraser end does not draw.
   */
  eraserTool: string | undefined;

  private readonly tracks = new Map<number, Track>();
  /** Positions of the touches that move the view. */
  private readonly touches = new Map<number, { x: number; y: number }>();
  private readonly penContacts = new Set<number>();
  private penHover = false;
  private lastPenTime = Number.NEGATIVE_INFINITY;
  private penUsed = false;
  private spaceHeld = false;
  private readonly taps: TapGestureRecognizer;

  constructor(
    private readonly board: Board,
    private readonly now: () => number = () => performance.now(),
  ) {
    // D3: a tap with two fingers undoes, with three fingers redoes.
    this.taps = new TapGestureRecognizer((fingers) => board.handleTap(fingers));
  }

  /** Tells whether the pen was used in this session (D4). */
  get penWasUsed(): boolean {
    return this.penUsed;
  }

  /** Space is held: the left mouse button moves the view (WEJ-04 K1). */
  get panKeyHeld(): boolean {
    return this.spaceHeld;
  }

  private get camera(): Camera {
    return this.board.camera;
  }

  /** Handles a pointer press. Returns true when the board takes the pointer (capture it). */
  pointerDown(event: InputPointerEvent): boolean {
    const kind = kindOf(event.pointerType);
    this.tracks.delete(event.pointerId);
    if (kind === 'pen') return this.penDown(event);
    if (kind === 'touch') return this.touchDown(event);
    return this.mouseDown(event);
  }

  pointerMove(event: InputPointerEvent): void {
    const kind = kindOf(event.pointerType);
    if (kind === 'pen') {
      this.lastPenTime = event.timeStamp;
      // A pen moving without contact is in range (hover): palms are rejected (WEJ-06 K1).
      if (!this.penContacts.has(event.pointerId)) this.penHover = true;
    }
    const track = this.tracks.get(event.pointerId);
    if (!track) return;
    switch (track.kind) {
      case 'tool':
        if (track.pointerType === 'touch') this.feedTap('move', event);
        this.toolMove(track, event);
        return;
      case 'pan':
        this.camera.panBy(event.x - track.x, event.y - track.y);
        track.x = event.x;
        track.y = event.y;
        return;
      case 'gesture':
        this.feedTap('move', event);
        this.gestureMove(event);
        return;
      case 'ignored':
        return;
    }
  }

  pointerUp(event: InputPointerEvent): void {
    this.release(event, 'up');
  }

  pointerCancel(event: InputPointerEvent): void {
    this.release(event, 'cancel');
  }

  /** The pointer left the board; for a pen this means it is out of range. */
  pointerLeave(event: Pick<InputPointer, 'pointerType' | 'timeStamp'>): void {
    if (kindOf(event.pointerType) !== 'pen') return;
    this.penHover = false;
    this.lastPenTime = event.timeStamp;
  }

  /** WEJ-04 K1: the wheel scrolls the view; with Ctrl it zooms at the pointer. */
  wheel(event: InputWheel): void {
    const unit = event.deltaMode === 1 ? LINE_HEIGHT : event.deltaMode === 2 ? PAGE_HEIGHT : 1;
    const dx = event.deltaX * unit;
    const dy = event.deltaY * unit;
    if (event.ctrlKey) {
      const anchor = { x: event.x, y: event.y };
      this.transformView(anchor, anchor, Math.exp(-dy * WHEEL_ZOOM_SPEED));
    } else {
      this.camera.panBy(-dx, -dy);
    }
  }

  /** WEJ-04 K1: Space held with the left button moves the view. Returns true when taken. */
  keyDown(event: { readonly code: string }): boolean {
    if (event.code !== 'Space') return false;
    this.spaceHeld = true;
    return true;
  }

  keyUp(event: { readonly code: string }): boolean {
    if (event.code !== 'Space') return false;
    this.spaceHeld = false;
    return true;
  }

  /** The window lost focus: keys held so far are released. */
  blur(): void {
    this.spaceHeld = false;
  }

  /** WEJ-06 K1: the pen touches the board, hovers over it or was used a moment ago. */
  palmRejectionActive(time: number): boolean {
    return (
      this.penContacts.size > 0 || this.penHover || time - this.lastPenTime <= PALM_REJECTION_MS
    );
  }

  private penDown(event: InputPointerEvent): boolean {
    this.penUsed = true;
    this.penContacts.add(event.pointerId);
    this.lastPenTime = event.timeStamp;
    // A hand on the screen when the pen lands is a palm: its touches stop (WEJ-06).
    this.rejectTouches(event.timeStamp);
    if (this.activeToolTrack()) {
      this.tracks.set(event.pointerId, { kind: 'ignored' });
      return true;
    }
    if (event.buttons & ERASER_BUTTON) {
      // WEJ-05 K3: the eraser end works as the eraser while it touches the board.
      const eraser = this.eraserTool;
      if (!eraser || !this.board.tools.get(eraser)) {
        this.tracks.set(event.pointerId, { kind: 'ignored' });
        return true;
      }
      const restore = { tool: this.board.tools.active?.key };
      this.board.tools.setActive(eraser);
      this.startTool(event, 'pen', restore);
      return true;
    }
    if (event.buttons & PEN_BARREL_BUTTON) {
      // D4: the first pen button opens the context menu (UI-06, step 1.12); it never draws.
      this.tracks.set(event.pointerId, { kind: 'ignored' });
      return true;
    }
    this.startTool(event, 'pen');
    return true;
  }

  private mouseDown(event: InputPointerEvent): boolean {
    // WEJ-04 K1: middle button, or Space with the left button, moves the view.
    if (event.button === 1 || (event.button === 0 && this.spaceHeld)) {
      this.tracks.set(event.pointerId, { kind: 'pan', x: event.x, y: event.y });
      return true;
    }
    if (event.button !== 0 || this.activeToolTrack()) return false;
    this.startTool(event, 'mouse');
    return true;
  }

  private touchDown(event: InputPointerEvent): boolean {
    // WEJ-06 K1: a touch while the pen is near is a palm; it neither draws nor moves the view.
    if (this.palmRejectionActive(event.timeStamp)) {
      this.tracks.set(event.pointerId, { kind: 'ignored' });
      return true;
    }
    this.feedTap('down', event);
    const drawing = this.activeToolTrack();
    if (drawing && drawing.track.pointerType === 'touch') {
      // WEJ-03 K2: a second finger turns the touch into a view gesture; the stroke is dropped.
      this.dispatch('cancel', drawing.track.last, drawing.track.last.buttons, []);
      this.tracks.set(drawing.pointerId, { kind: 'gesture' });
      this.touches.set(drawing.pointerId, { x: drawing.track.last.x, y: drawing.track.last.y });
    }
    const fingerDraws =
      !(this.penUsed && this.settings.penDisablesFingerDrawing) && this.touches.size === 0;
    if (fingerDraws && !drawing) {
      // WEJ-03 K1: one finger draws with the active tool until the pen is used (D4).
      this.startTool(event, 'touch');
      return true;
    }
    // WEJ-06 K2, D4: after the pen was used a finger only moves the view.
    this.tracks.set(event.pointerId, { kind: 'gesture' });
    this.touches.set(event.pointerId, { x: event.x, y: event.y });
    return true;
  }

  private release(event: InputPointerEvent, phase: 'up' | 'cancel'): void {
    const kind = kindOf(event.pointerType);
    if (kind === 'pen') {
      this.penContacts.delete(event.pointerId);
      this.lastPenTime = event.timeStamp;
    }
    const track = this.tracks.get(event.pointerId);
    this.tracks.delete(event.pointerId);
    if (!track) return;
    if (track.kind === 'tool') {
      const sample = phase === 'up' ? event : track.last;
      this.dispatch(phase, sample, event.buttons, []);
      if (track.pointerType === 'touch') this.feedTap(phase, event);
      if (track.restore) this.restoreTool(track.restore.tool);
    } else if (track.kind === 'gesture') {
      this.feedTap(phase, event);
      this.touches.delete(event.pointerId);
    }
  }

  private restoreTool(key: string | undefined): void {
    this.board.tools.setActive(key !== undefined && this.board.tools.get(key) ? key : undefined);
  }

  private startTool(
    event: InputPointerEvent,
    pointerType: PointerKind,
    restore?: { readonly tool: string | undefined },
  ): void {
    this.tracks.set(event.pointerId, {
      kind: 'tool',
      pointerType,
      last: event,
      ...(restore ? { restore } : {}),
    });
    this.measure(event, () => this.dispatch('down', event, event.buttons, []));
  }

  private toolMove(track: Extract<Track, { kind: 'tool' }>, event: InputPointerEvent): void {
    // NF-04 K2: every coalesced sample is delivered, so fast strokes keep their full shape.
    const samples = event.coalesced.length > 0 ? event.coalesced : [event];
    this.measure(event, () => {
      let handled = false;
      samples.forEach((sample, index) => {
        const predicted = index === samples.length - 1 ? event.predicted : [];
        handled = this.dispatch('move', sample, event.buttons, predicted) || handled;
      });
      return handled;
    });
    track.last = samples.at(-1) ?? event;
  }

  /** NF-04 K1: records the time from the input event to the end of the tool's drawing. */
  private measure(event: InputPointer, run: () => boolean): void {
    if (run()) this.latency.record(this.now() - event.timeStamp);
  }

  private dispatch(
    phase: ToolPointerEvent['phase'],
    sample: InputPointer,
    buttons: number,
    predicted: readonly InputPointer[],
  ): boolean {
    const kind = kindOf(sample.pointerType);
    const toSample = (item: InputPointer): ToolPointerSample => {
      const screen = { x: item.x, y: item.y };
      return {
        world: this.camera.screenToWorld(screen),
        screen,
        // WEJ-05 K2: only the pen reports pressure; mouse and fingers draw at nominal pressure.
        pressure: kind === 'pen' ? clamp(item.pressure, 0, 1) : 0.5,
        tilt: kind === 'pen' ? tiltOf(item) : 0,
      };
    };
    return this.board.dispatchPointer({
      ...toSample(sample),
      phase,
      pointerType: kind,
      buttons,
      predicted: predicted.map(toSample),
    });
  }

  private activeToolTrack():
    { pointerId: number; track: Extract<Track, { kind: 'tool' }> } | undefined {
    for (const [pointerId, track] of this.tracks) {
      if (track.kind === 'tool') return { pointerId, track };
    }
    return undefined;
  }

  /** Stops all touches (they are taken as a palm); a stroke drawn by a finger is dropped. */
  private rejectTouches(time: number): void {
    for (const [pointerId, track] of this.tracks) {
      let position: { x: number; y: number } | undefined;
      if (track.kind === 'tool' && track.pointerType === 'touch') {
        this.dispatch('cancel', track.last, track.last.buttons, []);
        position = track.last;
      } else if (track.kind === 'gesture') {
        position = this.touches.get(pointerId);
      }
      if (!position) continue;
      this.tracks.set(pointerId, { kind: 'ignored' });
      this.taps.handle({ type: 'cancel', pointerId, x: position.x, y: position.y, time });
    }
    this.touches.clear();
  }

  private feedTap(type: 'down' | 'move' | 'up' | 'cancel', event: InputPointer): void {
    this.taps.handle({
      type,
      pointerId: event.pointerId,
      x: event.x,
      y: event.y,
      time: event.timeStamp,
    });
  }

  /** WEJ-03 K2: one finger moves the view; two or more move and zoom it (pinch). */
  private gestureMove(event: InputPointer): void {
    const touch = this.touches.get(event.pointerId);
    if (!touch) return;
    const before = this.touchMetrics();
    touch.x = event.x;
    touch.y = event.y;
    const after = this.touchMetrics();
    const factor = before.spread > 0 && after.spread > 0 ? after.spread / before.spread : 1;
    this.transformView(before.center, after.center, factor);
  }

  private touchMetrics(): { center: { x: number; y: number }; spread: number } {
    const points = [...this.touches.values()];
    const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const y = points.reduce((sum, point) => sum + point.y, 0) / points.length;
    const spread =
      points.length < 2
        ? 0
        : points.reduce((sum, point) => sum + Math.hypot(point.x - x, point.y - y), 0) /
          points.length;
    return { center: { x, y }, spread };
  }

  /**
   * Moves and zooms the view in one step: the board point under `from` lands under `to`, and
   * the zoom changes by `factor` within the range of D5.
   */
  private transformView(
    from: { x: number; y: number },
    to: { x: number; y: number },
    factor: number,
  ): void {
    const state = this.camera.state;
    const zoom = clamp(state.zoom * factor, MIN_ZOOM, MAX_ZOOM);
    const world = this.camera.screenToWorld(from);
    if (zoom === state.zoom && from.x === to.x && from.y === to.y) return;
    this.camera.set({ x: to.x - world.x * zoom, y: to.y - world.y * zoom, zoom });
  }
}
