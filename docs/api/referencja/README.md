**@tablica/plugin-api**

***

# @tablica/plugin-api

Public API for Tablica layer plugins (WAR-12). A layer plugin may import only this package.

Guide: `docs/api/jak-napisac-warstwe.md`.

## Classes

- [LayerAccessError](classes/LayerAccessError.md)

## Interfaces

- [CameraState](interfaces/CameraState.md)
- [CameraView](interfaces/CameraView.md)
- [DocumentAccess](interfaces/DocumentAccess.md)
- [LayerCommand](interfaces/LayerCommand.md)
- [LayerContext](interfaces/LayerContext.md)
- [LayerHandle](interfaces/LayerHandle.md)
- [LayerInfo](interfaces/LayerInfo.md)
- [LayerPlugin](interfaces/LayerPlugin.md)
- [LayerView](interfaces/LayerView.md)
- [Messages](interfaces/Messages.md)
- [PanelDefinition](interfaces/PanelDefinition.md)
- [PluginContext](interfaces/PluginContext.md)
- [PluginManifest](interfaces/PluginManifest.md)
- [Point](interfaces/Point.md)
- [SemVer](interfaces/SemVer.md)
- [ShortcutDefinition](interfaces/ShortcutDefinition.md)
- [ToolDefinition](interfaces/ToolDefinition.md)
- [ToolPointerEvent](interfaces/ToolPointerEvent.md)

## Type Aliases

- [JsonValue](type-aliases/JsonValue.md)
- [LayerStatus](type-aliases/LayerStatus.md)
- [Locale](type-aliases/Locale.md)
- [ManifestProblem](type-aliases/ManifestProblem.md)
- [PointerKind](type-aliases/PointerKind.md)
- [Translate](type-aliases/Translate.md)
- [TranslationParams](type-aliases/TranslationParams.md)

## Variables

- [API\_VERSION](variables/API_VERSION.md)

## Functions

- [defineLayerPlugin](functions/defineLayerPlugin.md)
- [isApiCompatible](functions/isApiCompatible.md)
- [parseVersion](functions/parseVersion.md)
- [validateManifest](functions/validateManifest.md)
