[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / ShortcutDefinition

# Interface: ShortcutDefinition

A keyboard shortcut of the plugin.

## Properties

### id

> `readonly` **id**: `string`

Identifier unique within the plugin.

***

### keys

> `readonly` **keys**: `string`

Key combination: modifiers `Ctrl`, `Alt`, `Shift`, `Meta` and a key joined with `+`,
e.g. `Ctrl+Shift+K`. Key names follow `KeyboardEvent.key` and ignore letter case.

***

### labelKey

> `readonly` **labelKey**: `string`

Translation key of the action name (in the plugin's catalog).

## Methods

### run()

> **run**(): `void`

Runs the action.

#### Returns

`void`
