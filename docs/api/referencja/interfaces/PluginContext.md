[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / PluginContext

# Interface: PluginContext

What the plugin gets once, when it is activated.

## Properties

### document

> `readonly` **document**: [`DocumentAccess`](DocumentAccess.md)

Access to the document.

***

### pluginId

> `readonly` **pluginId**: `string`

Identifier of the plugin (from the manifest).

***

### t

> `readonly` **t**: [`Translate`](../type-aliases/Translate.md)

Translates a key of the plugin's catalog.

## Methods

### registerPanel()

> **registerPanel**(`panel`): `void`

Registers a panel.

#### Parameters

##### panel

[`PanelDefinition`](PanelDefinition.md)

#### Returns

`void`

***

### registerShortcut()

> **registerShortcut**(`shortcut`): `void`

Registers a keyboard shortcut.

#### Parameters

##### shortcut

[`ShortcutDefinition`](ShortcutDefinition.md)

#### Returns

`void`

***

### registerTool()

> **registerTool**\<`TData`\>(`tool`): `void`

Registers a tool.

#### Type Parameters

##### TData

`TData`

#### Parameters

##### tool

[`ToolDefinition`](ToolDefinition.md)\<`TData`\>

#### Returns

`void`
