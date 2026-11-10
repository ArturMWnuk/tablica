[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / validateManifest

# Function: validateManifest()

> **validateManifest**(`value`): [`ManifestProblem`](../type-aliases/ManifestProblem.md)[]

Checks a manifest. Returns an empty list when the manifest is valid.
Use it in the plugin's own tests; the program runs the same check before loading a plugin.

## Parameters

### value

`unknown`

## Returns

[`ManifestProblem`](../type-aliases/ManifestProblem.md)[]
