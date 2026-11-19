// Recognizes a tap with several fingers (D3: two fingers undo, three fingers redo). A tap is a
// short touch of all fingers without moving them; any movement or a long touch is a different
// gesture (e.g. moving the view, step 1.4), not a tap.

/** A touch pointer event reduced to what the recognizer needs. */
export interface TouchSample {
  readonly type: 'down' | 'move' | 'up' | 'cancel';
  readonly pointerId: number;
  readonly x: number;
  readonly y: number;
  /** Time in milliseconds (e.g. `PointerEvent.timeStamp`). */
  readonly time: number;
}

export interface TapGestureOptions {
  /** Longest tap from the first finger down to the last finger up, in milliseconds. */
  readonly maxDuration?: number;
  /** Largest movement of a finger that still counts as a tap, in pixels. */
  readonly maxMovement?: number;
}

export const TAP_MAX_DURATION = 350;
export const TAP_MAX_MOVEMENT = 12;

interface Gesture {
  readonly start: number;
  readonly origins: Map<number, { x: number; y: number }>;
  fingers: number;
  valid: boolean;
}

export class TapGestureRecognizer {
  private gesture: Gesture | undefined;
  private readonly maxDuration: number;
  private readonly maxMovement: number;

  /** `onTap` gets the number of fingers of a recognized tap with two or more fingers. */
  constructor(
    private readonly onTap: (fingers: number) => void,
    options: TapGestureOptions = {},
  ) {
    this.maxDuration = options.maxDuration ?? TAP_MAX_DURATION;
    this.maxMovement = options.maxMovement ?? TAP_MAX_MOVEMENT;
  }

  handle(sample: TouchSample): void {
    if (sample.type === 'down') {
      this.gesture ??= { start: sample.time, origins: new Map(), fingers: 0, valid: true };
      this.gesture.origins.set(sample.pointerId, { x: sample.x, y: sample.y });
      this.gesture.fingers = Math.max(this.gesture.fingers, this.gesture.origins.size);
      return;
    }
    const gesture = this.gesture;
    const origin = gesture?.origins.get(sample.pointerId);
    if (!gesture || !origin) return;
    if (sample.type === 'cancel') gesture.valid = false;
    if (Math.hypot(sample.x - origin.x, sample.y - origin.y) > this.maxMovement) {
      gesture.valid = false;
    }
    if (sample.type === 'move') return;
    gesture.origins.delete(sample.pointerId);
    if (gesture.origins.size > 0) return;
    this.gesture = undefined;
    const quick = sample.time - gesture.start <= this.maxDuration;
    if (gesture.valid && quick && gesture.fingers >= 2) this.onTap(gesture.fingers);
  }
}
