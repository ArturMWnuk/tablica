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

Phase of the gesture.

***

### pointerType

> `readonly` **pointerType**: [`PointerKind`](../type-aliases/PointerKind.md)

Device that produced the event.

***

### pressure

> `readonly` **pressure**: `number`

Pressure from 0 to 1 (0.5 for devices without pressure).

***

### screen

> `readonly` **screen**: [`Point`](Point.md)

Position in the board container.

***

### world

> `readonly` **world**: [`Point`](Point.md)

Position on the board.
