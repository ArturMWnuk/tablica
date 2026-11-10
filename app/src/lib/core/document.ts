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
}

export interface SerializedDocument {
  schemaVersion: number;
  layers: SerializedLayer[];
}

export interface LayerRecord extends LayerInfo {
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
      data: undefined,
      stored,
    };
    this.records.splice(index, 0, record);
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

  /** Serializes the document; `serializeLayer` gives the current form of each layer. */
  serialize(serializeLayer: (record: LayerRecord) => SerializedLayer): SerializedDocument {
    return {
      schemaVersion: DOCUMENT_SCHEMA_VERSION,
      layers: this.records.map((record) => serializeLayer(record)),
    };
  }
}
