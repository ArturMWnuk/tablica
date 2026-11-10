/**
 * Public API for Tablica layer plugins (WAR-12). A layer plugin may import only this package.
 *
 * Guide: `docs/api/jak-napisac-warstwe.md`.
 *
 * @packageDocumentation
 */
export { API_VERSION, isApiCompatible, parseVersion, type SemVer } from './version';
export {
  validateManifest,
  type Locale,
  type ManifestProblem,
  type Messages,
  type PluginManifest,
} from './manifest';
export {
  defineLayerPlugin,
  LayerAccessError,
  type CameraState,
  type CameraView,
  type DocumentAccess,
  type JsonValue,
  type LayerCommand,
  type LayerContext,
  type LayerHandle,
  type LayerInfo,
  type LayerPlugin,
  type LayerStatus,
  type LayerView,
  type PanelDefinition,
  type PluginContext,
  type Point,
  type PointerKind,
  type ShortcutDefinition,
  type ToolDefinition,
  type ToolPointerEvent,
  type Translate,
  type TranslationParams,
} from './plugin';
