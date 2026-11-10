[**@tablica/plugin-api**](../README.md)

***

[@tablica/plugin-api](../README.md) / isApiCompatible

# Function: isApiCompatible()

> **isApiCompatible**(`required`, `provided?`): `boolean`

Tells whether a plugin that requires API version `required` can run on API version `provided`.
The major versions must be equal and the provided minor version must not be older.

## Parameters

### required

`string`

### provided?

`string` = `API_VERSION`

## Returns

`boolean`
