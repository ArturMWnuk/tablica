[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / LayerCommand

# Interface: LayerCommand\<TData\>

A change of layer data that can be undone. Every change of a layer goes through a command,
so it lands in the common undo history.

`apply` and `revert` must be exact opposites and must change only the given data.

## Type Parameters

### TData

`TData`

## Methods

### apply()

> **apply**(`data`): `void`

Performs the change (also used for redo).

#### Parameters

##### data

`TData`

#### Returns

`void`

***

### revert()

> **revert**(`data`): `void`

Undoes the change.

#### Parameters

##### data

`TData`

#### Returns

`void`
