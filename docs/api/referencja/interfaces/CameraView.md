[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / CameraView

# Interface: CameraView

Read-only access to the shared camera. Layers must draw their elements through it.

## Properties

### state

> `readonly` **state**: [`CameraState`](CameraState.md)

Current camera state.

## Methods

### screenToWorld()

> **screenToWorld**(`point`): [`Point`](Point.md)

Converts a point in the layer container to a board point.

#### Parameters

##### point

[`Point`](Point.md)

#### Returns

[`Point`](Point.md)

***

### worldToScreen()

> **worldToScreen**(`point`): [`Point`](Point.md)

Converts a board point to a point in the layer container.

#### Parameters

##### point

[`Point`](Point.md)

#### Returns

[`Point`](Point.md)
