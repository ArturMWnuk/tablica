/** Any value that can be stored as JSON in a lesson file. */
export type JsonValue =
  null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

/** Placeholder values for translated texts, e.g. `{ count: 3 }` for `"{count} items"`. */
export type TranslationParams = Readonly<Record<string, string | number>>;

/**
 * Translates a key of the plugin's own catalog (without the plugin id prefix),
 * in the current interface language.
 */
export type Translate = (key: string, params?: TranslationParams) => string;

/** A point. Board coordinates use CSS pixels at zoom 100 %. */
export interface Point {
  /** Horizontal position, growing to the right. */
  readonly x: number;
  /** Vertical position, growing downwards. */
  readonly y: number;
}

/**
 * State of the camera shared by all layers. A board point `p` is displayed at
 * `p * zoom + (x, y)` in the layer container.
 */
export interface CameraState {
  /** Horizontal offset of the board origin in the container, in pixels. */
  readonly x: number;
  /** Vertical offset of the board origin in the container, in pixels. */
  readonly y: number;
  /** Zoom factor; 1 means 100 %. */
  readonly zoom: number;
}

/** Read-only access to the shared camera. Layers must draw their elements through it. */
export interface CameraView {
  /** Current camera state. */
  readonly state: CameraState;
  /** Converts a board point to a point in the layer container. */
  worldToScreen(point: Point): Point;
  /** Converts a point in the layer container to a board point. */
  screenToWorld(point: Point): Point;
}

/**
 * A change of layer data that can be undone. Every change of a layer goes through a command,
 * so it lands in the common undo history.
 *
 * `apply` and `revert` must be exact opposites and must change only the given data.
 */
export interface LayerCommand<TData> {
  /** Performs the change (also used for redo). */
  apply(data: TData): void;
  /** Undoes the change. */
  revert(data: TData): void;
}

/** Access to one layer owned by the plugin. */
export interface LayerHandle<TData> {
  /** Layer identifier, unique within the lesson. */
  readonly id: string;
  /** Current layer data. Read it freely; change it only through {@link LayerHandle.execute}. */
  readonly data: Readonly<TData>;
  /**
   * Applies a command to this layer, records it in the undo history and redraws the layer.
   * When the user has locked or hidden the layer, the command is ignored: nothing changes and
   * nothing is recorded.
   */
  execute(command: LayerCommand<TData>): void;
}

/** Everything a layer instance gets when it is mounted. */
export interface LayerContext<TData> extends LayerHandle<TData> {
  /**
   * Container element of the layer. It covers the whole board; the plugin decides what to put
   * inside (canvas, SVG, HTML elements).
   */
  readonly container: HTMLElement;
  /** The camera shared by all layers. */
  readonly camera: CameraView;
  /** Translates a key of the plugin's catalog. */
  readonly t: Translate;
}

/** What the plugin returns after mounting a layer. */
export interface LayerView {
  /**
   * Redraws the layer from `layer.data` and `layer.camera`. The program calls it after
   * mounting, after every change of the layer data, after a camera change, after a change
   * of the board size and after a change of the interface language. It is not called while the
   * layer is hidden; the layer is redrawn when it is shown again. Opacity of the whole layer is
   * applied by the program to the container.
   */
  render(): void;
  /** Removes everything the plugin added to the container. */
  unmount?(): void;
}

/** Kind of pointing device. */
export type PointerKind = 'mouse' | 'pen' | 'touch';

/** A pointer event delivered to the active tool. */
export interface ToolPointerEvent {
  /** Phase of the gesture. */
  readonly phase: 'down' | 'move' | 'up' | 'cancel';
  /** Position on the board. */
  readonly world: Point;
  /** Position in the board container. */
  readonly screen: Point;
  /** Device that produced the event. */
  readonly pointerType: PointerKind;
  /** Pressure from 0 to 1 (0.5 for devices without pressure). */
  readonly pressure: number;
  /** Pressed buttons as in `PointerEvent.buttons`. */
  readonly buttons: number;
}

/**
 * A tool of the plugin. The program delivers events only while the tool is active, and only
 * together with the active layer of the plugin's type; the tool cannot reach other layers.
 * No events are delivered while that layer is hidden or locked by the user.
 */
export interface ToolDefinition<TData> {
  /** Identifier unique within the plugin. */
  readonly id: string;
  /** Translation key of the tool name (in the plugin's catalog). */
  readonly labelKey: string;
  /** Handles a pointer event on the active layer of the plugin's type. */
  onPointer(event: ToolPointerEvent, layer: LayerHandle<TData>): void;
}

/** A keyboard shortcut of the plugin. */
export interface ShortcutDefinition {
  /** Identifier unique within the plugin. */
  readonly id: string;
  /**
   * Key combination: modifiers `Ctrl`, `Alt`, `Shift`, `Meta` and a key joined with `+`,
   * e.g. `Ctrl+Shift+K`. Key names follow `KeyboardEvent.key` and ignore letter case.
   */
  readonly keys: string;
  /** Translation key of the action name (in the plugin's catalog). */
  readonly labelKey: string;
  /** Runs the action. */
  run(): void;
}

/** A panel with plugin settings or content. */
export interface PanelDefinition {
  /** Identifier unique within the plugin. */
  readonly id: string;
  /** Translation key of the panel title (in the plugin's catalog). */
  readonly titleKey: string;
  /**
   * Builds the panel inside `element` with any technology. Returns a function that removes it.
   */
  mount(element: HTMLElement): (() => void) | void;
}

/** State of a layer in the document. */
export type LayerStatus = 'loading' | 'ready' | 'broken' | 'missing';

/** Public information about a layer of the document. */
export interface LayerInfo {
  /** Layer identifier. */
  readonly id: string;
  /** Plugin (layer type) that owns the layer. */
  readonly pluginId: string;
  /** Current state of the layer. */
  readonly status: LayerStatus;
}

/** Access to the document from a plugin. */
export interface DocumentAccess {
  /** All layers of the document, from the bottom to the top. */
  layers(): readonly LayerInfo[];
  /**
   * Returns a handle to a layer owned by this plugin.
   * @throws {@link LayerAccessError} when the layer belongs to another plugin or does not exist.
   */
  layer<TData>(layerId: string): LayerHandle<TData>;
}

/** What the plugin gets once, when it is activated. */
export interface PluginContext {
  /** Identifier of the plugin (from the manifest). */
  readonly pluginId: string;
  /** Translates a key of the plugin's catalog. */
  readonly t: Translate;
  /** Access to the document. */
  readonly document: DocumentAccess;
  /** Registers a tool. */
  registerTool<TData>(tool: ToolDefinition<TData>): void;
  /** Registers a keyboard shortcut. */
  registerShortcut(shortcut: ShortcutDefinition): void;
  /** Registers a panel. */
  registerPanel(panel: PanelDefinition): void;
}

/**
 * A layer plugin: the default export of the plugin module.
 *
 * `TData` is the in-memory data of one layer instance. A lesson may contain any number of
 * layers of the same plugin.
 */
export interface LayerPlugin<TData> {
  /**
   * Version of the serialized data format. Increase it when the format changes and handle
   * older versions in {@link LayerPlugin.deserialize}.
   */
  readonly schemaVersion: number;
  /** Data of a new, empty layer. */
  createData(): TData;
  /** Converts layer data to JSON stored in the lesson file. */
  serialize(data: Readonly<TData>): JsonValue;
  /**
   * Reads layer data from JSON written by {@link LayerPlugin.serialize} with format version
   * `schemaVersion` (possibly older than the current one: migrate it here).
   */
  deserialize(json: JsonValue, schemaVersion: number): TData;
  /** Called once after loading: register tools, shortcuts and panels here. */
  activate?(context: PluginContext): void;
  /** Mounts one layer instance in its container. */
  mountLayer(layer: LayerContext<TData>): LayerView;
}

/**
 * Identity helper that gives type inference for a plugin definition:
 * `export default defineLayerPlugin({ ... })`.
 */
export function defineLayerPlugin<TData>(plugin: LayerPlugin<TData>): LayerPlugin<TData> {
  return plugin;
}

/** Thrown when a plugin tries to reach a layer that it does not own. */
export class LayerAccessError extends Error {
  /** Layer the plugin tried to reach. */
  readonly layerId: string;
  /** Plugin that made the attempt. */
  readonly pluginId: string;

  constructor(layerId: string, pluginId: string) {
    super(`Plugin "${pluginId}" has no access to layer "${layerId}"`);
    this.name = 'LayerAccessError';
    this.layerId = layerId;
    this.pluginId = pluginId;
  }
}
