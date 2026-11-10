[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / LayerPlugin

# Interface: LayerPlugin\<TData\>

A layer plugin: the default export of the plugin module.

`TData` is the in-memory data of one layer instance. A lesson may contain any number of
layers of the same plugin.

## Type Parameters

### TData

`TData`

## Properties

### schemaVersion

> `readonly` **schemaVersion**: `number`

Version of the serialized data format. Increase it when the format changes and handle
older versions in [LayerPlugin.deserialize](#deserialize).

## Methods

### activate()?

> `optional` **activate**(`context`): `void`

Called once after loading: register tools, shortcuts and panels here.

#### Parameters

##### context

[`PluginContext`](PluginContext.md)

#### Returns

`void`

***

### createData()

> **createData**(): `TData`

Data of a new, empty layer.

#### Returns

`TData`

***

### deserialize()

> **deserialize**(`json`, `schemaVersion`): `TData`

Reads layer data from JSON written by [LayerPlugin.serialize](#serialize) with format version
`schemaVersion` (possibly older than the current one: migrate it here).

#### Parameters

##### json

[`JsonValue`](../type-aliases/JsonValue.md)

##### schemaVersion

`number`

#### Returns

`TData`

***

### mountLayer()

> **mountLayer**(`layer`): [`LayerView`](LayerView.md)

Mounts one layer instance in its container.

#### Parameters

##### layer

[`LayerContext`](LayerContext.md)\<`TData`\>

#### Returns

[`LayerView`](LayerView.md)

***

### serialize()

> **serialize**(`data`): [`JsonValue`](../type-aliases/JsonValue.md)

Converts layer data to JSON stored in the lesson file.

#### Parameters

##### data

`Readonly`\<`TData`\>

#### Returns

[`JsonValue`](../type-aliases/JsonValue.md)
