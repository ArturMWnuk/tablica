[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / LayerContext

# Interface: LayerContext\<TData\>

Everything a layer instance gets when it is mounted.

## Extends

- [`LayerHandle`](LayerHandle.md)\<`TData`\>

## Type Parameters

### TData

`TData`

## Properties

### camera

> `readonly` **camera**: [`CameraView`](CameraView.md)

The camera shared by all layers.

***

### container

> `readonly` **container**: `HTMLElement`

Container element of the layer. It covers the whole board; the plugin decides what to put
inside (canvas, SVG, HTML elements).

***

### data

> `readonly` **data**: `Readonly`\<`TData`\>

Current layer data. Read it freely; change it only through [LayerHandle.execute](LayerHandle.md#execute).

#### Inherited from

[`LayerHandle`](LayerHandle.md).[`data`](LayerHandle.md#data)

***

### id

> `readonly` **id**: `string`

Layer identifier, unique within the lesson.

#### Inherited from

[`LayerHandle`](LayerHandle.md).[`id`](LayerHandle.md#id)

***

### t

> `readonly` **t**: [`Translate`](../type-aliases/Translate.md)

Translates a key of the plugin's catalog.

## Methods

### execute()

> **execute**(`command`): `void`

Applies a command to this layer, records it in the undo history and redraws the layer.

#### Parameters

##### command

[`LayerCommand`](LayerCommand.md)\<`TData`\>

#### Returns

`void`

#### Inherited from

[`LayerHandle`](LayerHandle.md).[`execute`](LayerHandle.md#execute)
