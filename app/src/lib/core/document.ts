// Lesson document model (WAR-01): an ordered list of layers, from the bottom to the top.
// The core keeps layer data opaque; only the owning plugin understands it (WAR-06, WAR-12).
import type { JsonValue, LayerInfo, LayerStatus } from '@tablica/plugin-api';
import { Emitter } from './emitter';

export const DOCUMENT_SCHEMA_VERSION = 1;

/** A layer as stored in the lesson. `data: null` means a new, empty layer. */
export interface SerializedLayer {
  id: string;
  pluginId: string;
  pluginVersion: string | null;
  schemaVersion: number | null;
  data: JsonValue | null;
  /** Layer settings kept by the core (WAR-02, WAR-03, WAR-05); defaults when omitted. */
  visible?: boolean;
  locked?: boolean;
  /** Opacity of the whole layer, from 0 to 1. */
  opacity?: number;
}

/** Settings of a layer kept by the core, not by the plugin. */
export interface LayerSettings {
  /** WAR-02: a hidden layer is not rendered and takes no input. */
  visible: boolean;
  /** WAR-03: no tool may change a locked layer. */
  locked: boolean;
  /** WAR-05: opacity of the whole layer, from 0 to 1 in steps of 5 %. */
  opacity: number;
}

export const DEFAULT_LAYER_SETTINGS: Readonly<LayerSettings> = {
  visible: true,
  locked: false,
  opacity: 1,
};

/** Step of the opacity slider (WAR-05 K1): 5 %. */
export const OPACITY_STEP = 0.05;

/** Clamps the opacity to 0–1 and rounds it to the 5 % step. */
export function normalizeOpacity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  const steps = Math.round(Math.min(1, Math.max(0, value)) / OPACITY_STEP);
  return Number((steps * OPACITY_STEP).toFixed(2));
}

export interface SerializedDocument {
  schemaVersion: number;
  layers: SerializedLayer[];
}

export interface LayerRecord extends LayerInfo, LayerSettings {
  status: LayerStatus;
  /** Live data, owned by the plugin; `undefined` until the layer is ready. */
  data: unknown;
  /**
   * Last known serialized form. Written back unchanged when the plugin is missing or broken,
   * so the layer data is never lost (WAR-06 K3, ADR-009).
   */
  stored: SerializedLayer;
}

function newLayerId(): string {
  return `layer-${globalThis.crypto.randomUUID()}`;
}

export class BoardDocument {
  private records: LayerRecord[] = [];
  private activeByPlugin = new Map<string, string>();
  private activeId: string | undefined;
  readonly changed = new Emitter();

  constructor(serialized?: SerializedDocument) {
    if (serialized) {
      for (const layer of serialized.layers) this.insert({ ...layer });
    }
  }

  /** Layers from the bottom to the top. */
  get layers(): readonly LayerRecord[] {
    return this.records;
  }

  getLayer(id: string): LayerRecord | undefined {
    return this.records.find((record) => record.id === id);
  }

  /** Adds a new, empty layer of the plugin on top (or at `index`) and returns its id. */
  addLayer(pluginId: string, index = this.records.length): string {
    const id = newLayerId();
    this.insert(
      { id, pluginId, pluginVersion: null, schemaVersion: null, data: null },
      Math.max(0, Math.min(index, this.records.length)),
    );
    return id;
  }

  private insert(stored: SerializedLayer, index = this.records.length): void {
    if (this.getLayer(stored.id)) throw new Error(`Duplicate layer id ${stored.id}`);
    const record: LayerRecord = {
      id: stored.id,
      pluginId: stored.pluginId,
      status: 'loading',
      visible:
        typeof stored.visible === 'boolean' ? stored.visible : DEFAULT_LAYER_SETTINGS.visible,
      locked: typeof stored.locked === 'boolean' ? stored.locked : DEFAULT_LAYER_SETTINGS.locked,
      opacity:
        typeof stored.opacity === 'number'
          ? normalizeOpacity(stored.opacity)
          : DEFAULT_LAYER_SETTINGS.opacity,
      data: undefined,
      stored,
    };
    this.records.splice(index, 0, record);
    this.changed.emit();
  }

  private require(id: string): LayerRecord {
    const record = this.getLayer(id);
    if (!record) throw new Error(`Unknown layer ${id}`);
    return record;
  }

  /** Position of the layer from the bottom (0); -1 when it does not exist. */
  indexOf(id: string): number {
    return this.records.findIndex((record) => record.id === id);
  }

  /** WAR-02: shows or hides the layer. */
  setVisible(id: string, visible: boolean): void {
    const record = this.require(id);
    if (record.visible === visible) return;
    record.visible = visible;
    this.changed.emit();
  }

  /** WAR-03: locks or unlocks the layer. */
  setLocked(id: string, locked: boolean): void {
    const record = this.require(id);
    if (record.locked === locked) return;
    record.locked = locked;
    this.changed.emit();
  }

  /** WAR-05: sets the opacity of the whole layer (0–1, rounded to 5 %). */
  setOpacity(id: string, opacity: number): void {
    const record = this.require(id);
    const value = normalizeOpacity(opacity);
    if (record.opacity === value) return;
    record.opacity = value;
    this.changed.emit();
  }

  /** WAR-04: moves the layer to `index` (from the bottom), shifting the layers in between. */
  moveLayer(id: string, index: number): void {
    const from = this.indexOf(id);
    if (from < 0) throw new Error(`Unknown layer ${id}`);
    const to = Math.max(0, Math.min(Math.trunc(index), this.records.length - 1));
    if (from === to) return;
    const [record] = this.records.splice(from, 1);
    if (record) this.records.splice(to, 0, record);
    this.changed.emit();
  }

  setStatus(id: string, status: LayerStatus): void {
    const record = this.getLayer(id);
    if (!record || record.status === status) return;
    record.status = status;
    this.changed.emit();
  }

  /** Makes the layer active; it also becomes the active layer of its type (WAR-06 K2). */
  setActiveLayer(id: string): void {
    const record = this.getLayer(id);
    if (!record) throw new Error(`Unknown layer ${id}`);
    this.activeId = id;
    this.activeByPlugin.set(record.pluginId, id);
    this.changed.emit();
  }

  get activeLayerId(): string | undefined {
    return this.activeId;
  }

  /**
   * Active layer of the plugin's type: the one activated last, or the topmost layer of that type
   * when none was activated.
   */
  activeLayerOf(pluginId: string): LayerRecord | undefined {
    const chosen = this.activeByPlugin.get(pluginId);
    const record = chosen === undefined ? undefined : this.getLayer(chosen);
    if (record) return record;
    for (let index = this.records.length - 1; index >= 0; index -= 1) {
      const layer = this.records[index];
      if (layer?.pluginId === pluginId) return layer;
    }
    return undefined;
  }

  /**
   * Serializes the document; `serializeLayer` gives the current form of each layer's data.
   * Layer settings (visibility, lock, opacity) come from the core, also for broken layers.
   */
  serialize(serializeLayer: (record: LayerRecord) => SerializedLayer): SerializedDocument {
    return {
      schemaVersion: DOCUMENT_SCHEMA_VERSION,
      layers: this.records.map((record) => ({
        ...serializeLayer(record),
        visible: record.visible,
        locked: record.locked,
        opacity: record.opacity,
      })),
    };
  }
}
