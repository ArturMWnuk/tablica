[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / ToolDefinition

# Interface: ToolDefinition\<TData\>

A tool of the plugin. The program delivers events only while the tool is active, and only
together with the active layer of the plugin's type; the tool cannot reach other layers.

## Type Parameters

### TData

`TData`

## Properties

### id

> `readonly` **id**: `string`

Identifier unique within the plugin.

***

### labelKey

> `readonly` **labelKey**: `string`

Translation key of the tool name (in the plugin's catalog).

## Methods

### onPointer()

> **onPointer**(`event`, `layer`): `void`

Handles a pointer event on the active layer of the plugin's type.

#### Parameters

##### event

[`ToolPointerEvent`](ToolPointerEvent.md)

##### layer

[`LayerHandle`](LayerHandle.md)\<`TData`\>

#### Returns

`void`
