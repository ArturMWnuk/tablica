[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / LayerAccessError

# Class: LayerAccessError

Thrown when a plugin tries to reach a layer that it does not own.

## Extends

- `Error`

## Constructors

### Constructor

> **new LayerAccessError**(`layerId`, `pluginId`): `LayerAccessError`

#### Parameters

##### layerId

`string`

##### pluginId

`string`

#### Returns

`LayerAccessError`

#### Overrides

`Error.constructor`

## Properties

### layerId

> `readonly` **layerId**: `string`

Layer the plugin tried to reach.

***

### pluginId

> `readonly` **pluginId**: `string`

Plugin that made the attempt.
