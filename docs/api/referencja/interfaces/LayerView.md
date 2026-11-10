[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / LayerView

# Interface: LayerView

What the plugin returns after mounting a layer.

## Methods

### render()

> **render**(): `void`

Redraws the layer from `layer.data` and `layer.camera`. The program calls it after
mounting, after every change of the layer data, after a camera change, after a change
of the board size and after a change of the interface language.

#### Returns

`void`

***

### unmount()?

> `optional` **unmount**(): `void`

Removes everything the plugin added to the container.

#### Returns

`void`
