[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / PluginManifest

# Interface: PluginManifest

Plugin manifest (`manifest.json` in the plugin package).

The plugin `id` is also the layer type and the namespace of the plugin's translations.

## Properties

### apiVersion

> `readonly` **apiVersion**: `string`

API version the plugin was written for (SemVer), e.g. `1.0.0`.

***

### id

> `readonly` **id**: `string`

Unique identifier in kebab-case, e.g. `layer-drawing`.

***

### permissions?

> `readonly` `optional` **permissions?**: readonly `string`[]

Reserved for future use; must be empty or omitted in API 1.x.

***

### translations

> `readonly` **translations**: `Readonly`\<`Record`\<[`Locale`](../type-aliases/Locale.md), [`Messages`](Messages.md)\>\>

Translations for every interface language. Each catalog must contain at least the keys
`name` (layer name) and `description` (one sentence for the layer list).

***

### version

> `readonly` **version**: `string`

Version of the plugin itself (SemVer), independent of the program version.
