// The board: document, shared camera, history and plugins wired together through the public
// plugin API (WAR-01, WAR-06, WAR-12). Framework-independent; the Svelte interface only displays it.
import {
  LayerAccessError,
  type LayerCommand,
  type LayerContext,
  type LayerHandle,
  type LayerPlugin,
  type PluginContext,
  type PluginManifest,
  type ToolDefinition,
  type ToolPointerEvent,
  type TranslationParams,
} from '@tablica/plugin-api';
import { Camera } from './camera';
import {
  BoardDocument,
  type LayerRecord,
  normalizeOpacity,
  type SerializedDocument,
  type SerializedLayer,
} from './document';
import { History, type HistoryEntry } from './history';
import { InputRouter } from './input-router';
import { LayerHost } from './layer-host';
import { Notices } from './notices';
import { PluginManager, type PluginSource } from './plugin-manager';
import {
  type KeyInput,
  matchesKeys,
  PanelRegistry,
  ShortcutRegistry,
  ToolRegistry,
} from './registries';

export interface BoardOptions {
  /** Plugins available to the program (built-in and installed). */
  readonly sources: readonly PluginSource[];
  /** Lesson to open; a new board when omitted. */
  readonly document?: SerializedDocument;
  /** Translates a key of the merged catalogs (core + plugin namespaces). */
  readonly translate: (key: string, params?: TranslationParams) => string;
  /** Adds a plugin catalog under the plugin id; returns false if the namespace is taken. */
  readonly addTranslations: (manifest: PluginManifest) => boolean;
}

/** Layer data is opaque to the core; only the owning plugin knows its type. */
function opaque(data: unknown): Readonly<unknown> {
  return data as Readonly<unknown>;
}

/** History entry of a layer command; knows its layer so it can be dropped with the layer. */
class LayerHistoryEntry implements HistoryEntry {
  constructor(
    readonly layerId: string,
    private readonly record: LayerRecord,
    private readonly command: LayerCommand<unknown>,
  ) {}

  apply(): void {
    this.command.apply(this.record.data);
  }

  revert(): void {
    this.command.revert(this.record.data);
  }
}

/** WAR-05 K2, D12: a change of layer opacity is undoable; slider drags merge into one step. */
class OpacityEntry implements HistoryEntry {
  constructor(
    private readonly document: BoardDocument,
    readonly layerId: string,
    private readonly from: number,
    private to: number,
  ) {}

  apply(): void {
    this.document.setOpacity(this.layerId, this.to);
  }

  revert(): void {
    this.document.setOpacity(this.layerId, this.from);
  }

  merge(next: HistoryEntry): boolean {
    if (!(next instanceof OpacityEntry) || next.layerId !== this.layerId) return false;
    this.to = next.to;
    return true;
  }

  /** A slider moved back to its starting value changes nothing. */
  isEmpty(): boolean {
    return this.from === this.to;
  }
}

/**
 * DAN-03 K1, P17 b: adding or removing a layer. The same record (with live data and its last
 * stored form) is taken out and put back, so undo restores the layer without losses.
 */
class LayerStructureEntry implements HistoryEntry {
  readonly layerId: string;

  constructor(
    private readonly document: BoardDocument,
    /** The layer; outside the document while the addition is undone or the removal is done. */
    readonly record: LayerRecord,
    private readonly index: number,
    private readonly kind: 'add' | 'remove',
  ) {
    this.layerId = record.id;
  }

  apply(): void {
    if (this.kind === 'add') this.document.restoreLayer(this.record, this.index);
    else this.document.removeLayer(this.layerId);
  }

  revert(): void {
    if (this.kind === 'add') this.document.removeLayer(this.layerId);
    else this.document.restoreLayer(this.record, this.index);
  }
}

/** WAR-04 K2, D12: a change of layer order is undoable. */
class MoveEntry implements HistoryEntry {
  constructor(
    private readonly document: BoardDocument,
    readonly layerId: string,
    private readonly from: number,
    private readonly to: number,
  ) {}

  apply(): void {
    this.document.moveLayer(this.layerId, this.to);
  }

  revert(): void {
    this.document.moveLayer(this.layerId, this.from);
  }
}

/** Core keyboard shortcuts of the history (DAN-03 K1); plugins cannot take them. */
export const UNDO_KEYS = ['Ctrl+Z'] as const;
export const REDO_KEYS = ['Ctrl+Y', 'Ctrl+Shift+Z'] as const;

/** D3: tap with two fingers undoes, with three fingers redoes. */
export const UNDO_TAP_FINGERS = 2;
export const REDO_TAP_FINGERS = 3;

export class Board {
  readonly camera = new Camera();
  readonly history = new History();
  readonly notices = new Notices();
  readonly tools = new ToolRegistry();
  readonly shortcuts = new ShortcutRegistry([...UNDO_KEYS, ...REDO_KEYS]);
  readonly panels = new PanelRegistry();
  /** Input pipeline: pen, fingers, mouse and keyboard (WEJ-01–06, NF-04). */
  readonly input: InputRouter = new InputRouter(this);
  readonly document: BoardDocument;
  readonly plugins: PluginManager;
  private host: LayerHost | undefined;
  private readonly translate: BoardOptions['translate'];

  constructor(options: BoardOptions) {
    this.translate = options.translate;
    this.document = new BoardDocument(options.document);
    this.plugins = new PluginManager(this.notices, {
      addTranslations: options.addTranslations,
      activate: (manifest, plugin) => this.activatePlugin(manifest, plugin),
    });
    for (const source of options.sources) this.plugins.register(source);
  }

  /**
   * Loads the plugins used by the document's layers (only those: lazy loading, NF-03) and
   * prepares the layer data.
   */
  async loadLayers(): Promise<void> {
    await Promise.all(this.document.layers.map((record) => this.prepareLayer(record)));
  }

  /**
   * Adds a new layer of the plugin at `index` (from the bottom; on top by default) through the
   * history (DAN-03 K1, P17 b), makes it active and prepares it.
   */
  async addLayer(pluginId: string, index = this.document.layers.length): Promise<string> {
    const record = this.document.createLayer(pluginId);
    const at = Math.max(0, Math.min(Math.trunc(index), this.document.layers.length));
    this.history.execute(new LayerStructureEntry(this.document, record, at, 'add'));
    this.document.setActiveLayer(record.id);
    await this.prepareLayer(record);
    return record.id;
  }

  /**
   * Removes a layer through the history (DAN-03 K1, P17 b); undo brings it back with its data.
   * A locked layer and the last layer of the lesson cannot be removed (returns false).
   */
  removeLayer(layerId: string): boolean {
    const record = this.document.getLayer(layerId);
    if (!record) throw new Error(`Unknown layer ${layerId}`);
    if (!this.canRemoveLayer(layerId)) return false;
    const index = this.document.indexOf(layerId);
    this.history.execute(new LayerStructureEntry(this.document, record, index, 'remove'));
    return true;
  }

  canRemoveLayer(layerId: string): boolean {
    const record = this.document.getLayer(layerId);
    return record !== undefined && !record.locked && this.document.layers.length > 1;
  }

  private async prepareLayer(record: LayerRecord): Promise<void> {
    if (record.status !== 'loading') return;
    await this.plugins.load(record.pluginId);
    if (record.status !== 'loading') return;
    const plugin = this.pluginOf(record);
    if (!plugin) {
      this.document.setRecordStatus(
        record,
        this.plugins.get(record.pluginId) ? 'broken' : 'missing',
      );
      return;
    }
    const { data, schemaVersion } = record.stored;
    try {
      record.data =
        data === null
          ? plugin.createData()
          : plugin.deserialize(data, schemaVersion ?? plugin.schemaVersion);
    } catch (error) {
      this.breakLayer(record, error);
      return;
    }
    this.document.setRecordStatus(record, 'ready');
  }

  /** Mounts the layer stack in `root`. */
  attach(root: HTMLElement): LayerHost {
    this.host?.destroy();
    this.host = new LayerHost(this, root);
    return this.host;
  }

  detach(): void {
    this.host?.destroy();
    this.host = undefined;
  }

  /** Redraws all layers (e.g. after a change of the interface language). */
  renderAll(): void {
    this.host?.renderAll();
  }

  /** The working plugin of a layer; undefined when it is missing, loading or broken. */
  pluginOf(record: LayerRecord): LayerPlugin<unknown> | undefined {
    const entry = this.plugins.get(record.pluginId);
    return entry?.state === 'active' ? entry.plugin : undefined;
  }

  /** Context given to a plugin when one of its layers is mounted. */
  layerContext(record: LayerRecord, container: HTMLElement): LayerContext<unknown> {
    const handle = this.handle(record);
    return {
      id: record.id,
      get data() {
        return handle.data;
      },
      execute: handle.execute,
      container,
      camera: this.camera,
      t: this.pluginTranslate(record.pluginId),
    };
  }

  private handle(record: LayerRecord): LayerHandle<unknown> {
    return {
      id: record.id,
      get data() {
        return opaque(record.data);
      },
      execute: (command) => this.execute(record.id, command),
    };
  }

  private pluginTranslate(pluginId: string) {
    return (key: string, params?: TranslationParams) =>
      this.translate(`${pluginId}.${key}`, params);
  }

  /**
   * Applies a command to a layer through the common history (DAN-03). A failing command marks
   * the layer as broken instead of stopping the program (WAR-06 K3).
   */
  execute<TData>(layerId: string, command: LayerCommand<TData>): void {
    const record = this.document.getLayer(layerId);
    if (!record || record.status !== 'ready') throw new Error(`Layer ${layerId} is not ready`);
    // WAR-03 K1: a locked layer is protected against every change made by its plugin.
    // WAR-02 K1: a hidden layer takes no input, also not from shortcuts and panels.
    if (record.locked || !record.visible) return;
    try {
      this.history.execute(
        new LayerHistoryEntry(layerId, record, command as LayerCommand<unknown>),
      );
    } catch (error) {
      this.breakLayer(record, error);
      return;
    }
    this.host?.render(layerId);
  }

  /** WAR-02: shows or hides a layer. A view setting, not recorded in the history (D12). */
  setLayerVisible(layerId: string, visible: boolean): void {
    this.document.setVisible(layerId, visible);
  }

  /** WAR-03: locks or unlocks a layer. A view setting, not recorded in the history (D12). */
  setLayerLocked(layerId: string, locked: boolean): void {
    this.document.setLocked(layerId, locked);
  }

  /**
   * WAR-05: sets the opacity of a layer (0–1, step 5 %) through the history (D12). With `merge`,
   * consecutive changes of the same layer form one undo step until `history.seal()`.
   */
  setLayerOpacity(layerId: string, opacity: number, options: { merge?: boolean } = {}): void {
    const record = this.document.getLayer(layerId);
    if (!record) throw new Error(`Unknown layer ${layerId}`);
    const to = normalizeOpacity(opacity);
    if (record.opacity === to) return;
    this.history.execute(new OpacityEntry(this.document, layerId, record.opacity, to), {
      merge: options.merge === true,
    });
  }

  /** WAR-04: moves a layer to `index` (counted from the bottom) through the history (D12). */
  moveLayer(layerId: string, index: number): void {
    const from = this.document.indexOf(layerId);
    if (from < 0) throw new Error(`Unknown layer ${layerId}`);
    const to = Math.max(0, Math.min(Math.trunc(index), this.document.layers.length - 1));
    if (from === to) return;
    this.history.execute(new MoveEntry(this.document, layerId, from, to));
  }

  undo(): boolean {
    return this.step(() => this.history.undo(), 'undo');
  }

  redo(): boolean {
    return this.step(() => this.history.redo(), 'redo');
  }

  private step(run: () => boolean, direction: 'undo' | 'redo'): boolean {
    if (this.stepBlocked(direction)) return false;
    // The entry about to be undone or redone is the one whose layer gets redrawn.
    const before = this.peek(direction);
    try {
      if (!run()) return false;
    } catch (error) {
      const record = before ? this.document.getLayer(before.layerId) : undefined;
      if (record) this.breakLayer(record, error);
      return false;
    }
    if (before) this.host?.render(before.layerId);
    return true;
  }

  /**
   * P17 a: a step that changes the content of a locked or hidden layer (a plugin command), or
   * adds or removes a locked layer, is not undone or redone. The history stays as it is (P4)
   * and the user is told to unlock or show the layer. Order and opacity steps are not blocked.
   */
  private stepBlocked(direction: 'undo' | 'redo'): boolean {
    const entry = this.history.peek(direction);
    const content = entry instanceof LayerHistoryEntry;
    if (!content && !(entry instanceof LayerStructureEntry)) return false;
    const record = this.document.getLayer(entry.layerId);
    if (!record) return false;
    // The message names the layer as the panel does ("Drawing 2" when the type occurs twice).
    const params = { number: this.document.numberOf(record.id) };
    if (record.locked) {
      this.notices.addOnce('notice.historyLocked', record.pluginId, params);
      return true;
    }
    if (content && !record.visible) {
      this.notices.addOnce('notice.historyHidden', record.pluginId, params);
      return true;
    }
    return false;
  }

  private peek(direction: 'undo' | 'redo'): LayerHistoryEntry | undefined {
    const entry = this.history.peek(direction);
    return entry instanceof LayerHistoryEntry ? entry : undefined;
  }

  /**
   * Delivers a pointer event to the active tool, together with the active layer of the tool's
   * type (WAR-06 K2). Returns false when no tool could take it.
   */
  dispatchPointer(event: ToolPointerEvent): boolean {
    const tool = this.tools.active;
    if (!tool) return false;
    const record = this.document.activeLayerOf(tool.pluginId);
    if (!record || record.status !== 'ready') return false;
    // WAR-02 K1: a hidden layer takes no input; WAR-03 K1: a locked layer cannot be edited.
    if (!record.visible || record.locked) return false;
    try {
      tool.definition.onPointer(event, this.handle(record));
    } catch (error) {
      this.breakLayer(record, error);
    }
    return true;
  }

  /**
   * Runs the core or plugin shortcut matching the key press: Ctrl+Z undoes, Ctrl+Y and
   * Ctrl+Shift+Z redo (DAN-03 K1). Returns true if a shortcut was run.
   */
  handleKey(input: KeyInput): boolean {
    if (UNDO_KEYS.some((keys) => matchesKeys(input, keys))) {
      this.undo();
      return true;
    }
    if (REDO_KEYS.some((keys) => matchesKeys(input, keys))) {
      this.redo();
      return true;
    }
    const shortcut = this.shortcuts.match(input);
    if (!shortcut) return false;
    try {
      shortcut.definition.run();
    } catch (error) {
      this.breakPlugin(shortcut.pluginId, error);
    }
    return true;
  }

  /** D3: a tap with two fingers undoes, with three fingers redoes. Returns true if handled. */
  handleTap(fingers: number): boolean {
    if (fingers === UNDO_TAP_FINGERS) {
      this.undo();
      return true;
    }
    if (fingers === REDO_TAP_FINGERS) {
      this.redo();
      return true;
    }
    return false;
  }

  /** Mounts a plugin panel in `element`; returns a function that removes it. */
  mountPanel(key: string, element: HTMLElement): () => void {
    const panel = this.panels.get(key);
    if (!panel) throw new Error(`Unknown panel ${key}`);
    let cleanup: (() => void) | void;
    try {
      cleanup = panel.definition.mount(element);
    } catch (error) {
      this.breakPlugin(panel.pluginId, error);
    }
    return () => {
      try {
        cleanup?.();
      } catch (error) {
        this.breakPlugin(panel.pluginId, error);
      }
      element.replaceChildren();
    };
  }

  /** Serializes the lesson. Broken and missing layers keep their last known data. */
  serialize(): SerializedDocument {
    return this.document.serialize((record) => this.serializeLayer(record));
  }

  private serializeLayer(record: LayerRecord): SerializedLayer {
    const plugin = this.pluginOf(record);
    if (record.status !== 'ready' || !plugin) return record.stored;
    try {
      record.stored = {
        id: record.id,
        pluginId: record.pluginId,
        pluginVersion: this.plugins.get(record.pluginId)?.manifest.version ?? null,
        schemaVersion: plugin.schemaVersion,
        data: structuredClone(plugin.serialize(opaque(record.data))),
      };
    } catch (error) {
      this.breakLayer(record, error);
    }
    return record.stored;
  }

  /**
   * Marks a layer as broken after an error in its plugin: the layer is unmounted, its undo
   * entries are dropped and its last known data is kept for saving. Other layers keep working.
   */
  breakLayer(record: LayerRecord, error: unknown, notify = true): void {
    if (record.status === 'broken') return;
    console.error(`Layer ${record.id} (${record.pluginId}) failed`, error);
    const plugin = this.pluginOf(record);
    if (record.status === 'ready' && plugin) {
      try {
        // Keep the newest data if the plugin can still serialize it.
        record.stored = {
          ...record.stored,
          pluginVersion: this.plugins.get(record.pluginId)?.manifest.version ?? null,
          schemaVersion: plugin.schemaVersion,
          data: structuredClone(plugin.serialize(opaque(record.data))),
        };
      } catch {
        // The previous stored form stays.
      }
    }
    this.history.discard(
      (entry) => entry instanceof LayerHistoryEntry && entry.layerId === record.id,
    );
    // The record may be outside the document (an undone addition or a removal that can be undone).
    this.document.setRecordStatus(record, 'broken');
    record.data = undefined;
    if (notify) this.notices.add('notice.layerBroken', record.pluginId);
  }

  /** Marks a whole plugin as broken: its contributions are removed and its layers stop. */
  breakPlugin(pluginId: string, error: unknown): void {
    console.error(`Plugin ${pluginId} failed`, error);
    this.removeContributions(pluginId);
    // Layers first, while the plugin can still serialize their newest data. This includes layers
    // kept only in the history (removed or undone additions): undo can bring them back (P17 b).
    for (const record of this.layerRecords()) {
      if (record.pluginId === pluginId) this.breakLayer(record, error, false);
    }
    this.plugins.markBroken(pluginId);
    this.notices.add('notice.pluginFailed', pluginId);
  }

  /** Layers of the document and layers outside it that the history can bring back. */
  private layerRecords(): Set<LayerRecord> {
    const records = new Set<LayerRecord>(this.document.layers);
    for (const entry of this.history.entries) {
      if (entry instanceof LayerStructureEntry) records.add(entry.record);
    }
    return records;
  }

  private removeContributions(pluginId: string): void {
    this.tools.removePlugin(pluginId);
    this.shortcuts.removePlugin(pluginId);
    this.panels.removePlugin(pluginId);
  }

  private activatePlugin(manifest: PluginManifest, plugin: LayerPlugin<unknown>): void {
    try {
      plugin.activate?.(this.pluginContext(manifest.id));
    } catch (error) {
      this.removeContributions(manifest.id);
      throw error;
    }
  }

  private pluginContext(pluginId: string): PluginContext {
    return {
      pluginId,
      t: this.pluginTranslate(pluginId),
      document: {
        layers: () =>
          this.document.layers.map(({ id, pluginId: owner, status }) => ({
            id,
            pluginId: owner,
            status,
          })),
        layer: <TData>(layerId: string) => {
          const record = this.document.getLayer(layerId);
          // WAR-06 K2: a plugin can reach only its own layers.
          if (!record || record.pluginId !== pluginId) {
            throw new LayerAccessError(layerId, pluginId);
          }
          return this.handle(record) as LayerHandle<TData>;
        },
      },
      registerTool: <TData>(tool: ToolDefinition<TData>) => {
        this.tools.register(pluginId, tool as ToolDefinition<unknown>);
      },
      registerShortcut: (shortcut) => {
        if (!this.shortcuts.tryRegister(pluginId, shortcut)) {
          this.notices.add('notice.shortcutConflict', pluginId, { keys: shortcut.keys });
        }
      },
      registerPanel: (panel) => {
        this.panels.register(pluginId, panel);
      },
    };
  }
}
