[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / DocumentAccess

# Interface: DocumentAccess

Access to the document from a plugin.

## Methods

### layer()

> **layer**\<`TData`\>(`layerId`): [`LayerHandle`](LayerHandle.md)\<`TData`\>

Returns a handle to a layer owned by this plugin.

#### Type Parameters

##### TData

`TData`

#### Parameters

##### layerId

`string`

#### Returns

[`LayerHandle`](LayerHandle.md)\<`TData`\>

#### Throws

[LayerAccessError](../classes/LayerAccessError.md) when the layer belongs to another plugin or does not exist.

***

### layers()

> **layers**(): readonly [`LayerInfo`](LayerInfo.md)[]

All layers of the document, from the bottom to the top.

#### Returns

readonly [`LayerInfo`](LayerInfo.md)[]
