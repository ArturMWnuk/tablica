[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / PanelDefinition

# Interface: PanelDefinition

A panel with plugin settings or content.

## Properties

### id

> `readonly` **id**: `string`

Identifier unique within the plugin.

***

### titleKey

> `readonly` **titleKey**: `string`

Translation key of the panel title (in the plugin's catalog).

## Methods

### mount()

> **mount**(`element`): `void` \| (() => `void`)

Builds the panel inside `element` with any technology. Returns a function that removes it.

#### Parameters

##### element

`HTMLElement`

#### Returns

`void` \| (() => `void`)
