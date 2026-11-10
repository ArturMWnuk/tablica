[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / CameraState

# Interface: CameraState

State of the camera shared by all layers. A board point `p` is displayed at
`p * zoom + (x, y)` in the layer container.

## Properties

### x

> `readonly` **x**: `number`

Horizontal offset of the board origin in the container, in pixels.

***

### y

> `readonly` **y**: `number`

Vertical offset of the board origin in the container, in pixels.

***

### zoom

> `readonly` **zoom**: `number`

Zoom factor; 1 means 100 %.
