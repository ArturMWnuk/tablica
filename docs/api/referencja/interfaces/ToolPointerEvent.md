[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / ToolPointerEvent

# Interface: ToolPointerEvent

A pointer event delivered to the active tool.

## Properties

### buttons

> `readonly` **buttons**: `number`

Pressed buttons as in `PointerEvent.buttons`.

***

### phase

> `readonly` **phase**: `"down"` \| `"move"` \| `"up"` \| `"cancel"`

Phase of the gesture. `cancel` ends the gesture without a result: the tool must drop what
it started (e.g. a second finger turned the touch into a gesture of the view).

***

### pointerType

> `readonly` **pointerType**: [`PointerKind`](../type-aliases/PointerKind.md)

Device that produced the event.

***

### predicted

> `readonly` **predicted**: readonly [`ToolPointerSample`](ToolPointerSample.md)[]

Positions the pointer will probably reach next (`move` only; empty when the platform does
not predict). Use them only to draw a temporary preview that hides the latency; never store
them.

#### Since

API 1.1.0

***

### pressure

> `readonly` **pressure**: `number`

Pressure from 0 to 1 (0.5 for devices without pressure, also for the mouse and fingers).

***

### screen

> `readonly` **screen**: [`Point`](Point.md)

Position in the board container.

***

### tilt

> `readonly` **tilt**: `number`

Tilt of the pen from the perpendicular to the screen, in degrees from 0 to 90.
0 for devices that do not report tilt.

#### Since

API 1.1.0

***

### world

> `readonly` **world**: [`Point`](Point.md)

Position on the board.
