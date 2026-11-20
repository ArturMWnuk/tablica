[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / ToolPointerSample

# Interface: ToolPointerSample

One position of the pointer: a sample of a pointer event or a predicted position.

## Since

API 1.1.0

## Properties

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

***

### world

> `readonly` **world**: [`Point`](Point.md)

Position on the board.
