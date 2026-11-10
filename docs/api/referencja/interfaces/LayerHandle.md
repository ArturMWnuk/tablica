[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / LayerHandle

# Interface: LayerHandle\<TData\>

Access to one layer owned by the plugin.

## Extended by

- [`LayerContext`](LayerContext.md)

## Type Parameters

### TData

`TData`

## Properties

### data

> `readonly` **data**: `Readonly`\<`TData`\>

Current layer data. Read it freely; change it only through [LayerHandle.execute](#execute).

***

### id

> `readonly` **id**: `string`

Layer identifier, unique within the lesson.

## Methods

### execute()

> **execute**(`command`): `void`

Applies a command to this layer, records it in the undo history and redraws the layer.

#### Parameters

##### command

[`LayerCommand`](LayerCommand.md)\<`TData`\>

#### Returns

`void`
