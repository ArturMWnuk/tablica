// The `.tablica` lesson file (DAN-01, ADR-009): a ZIP archive with
//   manifest.json        what the file is and the version of its layout,
//   document.json        the lesson (layers with their settings, the view) with a schema version,
//   layers/<id>.json     data of each layer, written and read only by its plugin (WAR-06),
//   assets/…             embedded files; kept as they are, also when no plugin uses them yet.
// Any other entry (written by a newer program) is carried over unchanged on the next save.
// Loaded lazily, on the first save or open (NF-03).
import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from 'fflate';
import type { JsonValue } from '@tablica/plugin-api';
import {
  DOCUMENT_SCHEMA_VERSION,
  type SerializedDocument,
  type SerializedLayer,
  type SerializedView,
} from '../core/document';

/** Layout of the archive. A file with a higher number comes from a newer program. */
export const LESSON_FORMAT_VERSION = 1;
/** Schema of `document.json`; older schemas are migrated on reading (DAN-01 K2). */
export const LESSON_SCHEMA_VERSION = 1;
export const LESSON_FORMAT = 'tablica';

const MANIFEST = 'manifest.json';
const DOCUMENT = 'document.json';
const LAYERS = 'layers/';

/** A lesson read from or written to a file. */
export interface LessonContent {
  readonly document: SerializedDocument;
  /** Entries other than the manifest, the document and the layer data (e.g. `assets/…`). */
  readonly files: ReadonlyMap<string, Uint8Array>;
}

/**
 * Why a file could not be read: `corrupt` (not a lesson, damaged or incomplete) or `newer`
 * (written by a newer version of the program). The interface shows a message instead of failing.
 */
export class LessonFormatError extends Error {
  constructor(
    readonly kind: 'corrupt' | 'newer',
    message: string,
  ) {
    super(message);
    this.name = 'LessonFormatError';
  }
}

/** Upgrades `document.json` from schema `n` to `n + 1`. */
export type LessonMigration = (document: Record<string, unknown>) => Record<string, unknown>;

/**
 * Migrations of `document.json`, by the schema they start from. Empty while there is only the
 * first schema; each future schema change adds one step here, with a test.
 */
export const LESSON_MIGRATIONS: Readonly<Record<number, LessonMigration>> = {};

/** Layer ids become file names, so only safe characters are accepted. */
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

function corrupt(message: string): never {
  throw new LessonFormatError('corrupt', message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJson(bytes: Uint8Array | undefined, name: string): unknown {
  if (!bytes) corrupt(`Missing ${name}`);
  try {
    return JSON.parse(strFromU8(bytes)) as unknown;
  } catch {
    return corrupt(`Invalid JSON in ${name}`);
  }
}

function json(value: unknown): Uint8Array {
  return strToU8(JSON.stringify(value));
}

/** Builds the archive of a lesson. */
export function encodeLesson(content: LessonContent): Uint8Array {
  const { document } = content;
  const entries: Zippable = {};
  // Unknown entries first, so the lesson's own entries always win.
  for (const [name, bytes] of content.files) {
    if (name === MANIFEST || name === DOCUMENT || name.startsWith(LAYERS)) continue;
    entries[name] = [bytes, { level: 0 }];
  }
  entries[MANIFEST] = json({ format: LESSON_FORMAT, formatVersion: LESSON_FORMAT_VERSION });
  const layers = document.layers.map(({ data, ...layer }) => {
    if (!SAFE_ID.test(layer.id)) throw new Error(`Unsafe layer id ${layer.id}`);
    const file = data === null ? null : `${LAYERS}${layer.id}.json`;
    if (file) entries[file] = json(data);
    return { ...layer, data: file };
  });
  entries[DOCUMENT] = json({
    schemaVersion: LESSON_SCHEMA_VERSION,
    ...(document.view ? { view: document.view } : {}),
    layers,
  });
  return zipSync(entries, { level: 6 });
}

function checkVersion(value: unknown, supported: number, name: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    corrupt(`Invalid version in ${name}`);
  }
  if (value > supported) {
    throw new LessonFormatError('newer', `${name} version ${value} is newer than ${supported}`);
  }
  return value;
}

function migrate(
  document: Record<string, unknown>,
  migrations: Readonly<Record<number, LessonMigration>>,
  current: number,
): Record<string, unknown> {
  let version = checkVersion(document['schemaVersion'], current, DOCUMENT);
  let result = document;
  while (version < current) {
    const step = migrations[version];
    if (!step) corrupt(`No migration from schema ${version}`);
    result = { ...step(result), schemaVersion: version + 1 };
    version += 1;
  }
  return result;
}

function readView(value: unknown): SerializedView | undefined {
  if (value === undefined) return undefined;
  if (
    !isRecord(value) ||
    typeof value['x'] !== 'number' ||
    typeof value['y'] !== 'number' ||
    typeof value['zoom'] !== 'number' ||
    !Number.isFinite(value['x']) ||
    !Number.isFinite(value['y']) ||
    !(value['zoom'] > 0) ||
    !Number.isFinite(value['zoom'])
  ) {
    return corrupt('Invalid view');
  }
  return { x: value['x'], y: value['y'], zoom: value['zoom'] };
}

function optional<T>(value: unknown, check: (value: unknown) => value is T): T | undefined {
  if (value === undefined) return undefined;
  if (!check(value)) corrupt('Invalid layer setting');
  return value;
}

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isVersion = (value: unknown): value is number | null =>
  value === null || (typeof value === 'number' && Number.isInteger(value) && value >= 1);

function readLayer(value: unknown, entries: Record<string, Uint8Array>): SerializedLayer {
  if (!isRecord(value)) corrupt('Invalid layer');
  const { id, pluginId, pluginVersion, schemaVersion, data } = value;
  if (typeof id !== 'string' || !SAFE_ID.test(id)) corrupt('Invalid layer id');
  if (typeof pluginId !== 'string' || pluginId === '') corrupt('Invalid plugin id');
  if (pluginVersion !== null && typeof pluginVersion !== 'string') corrupt('Invalid version');
  if (!isVersion(schemaVersion)) corrupt('Invalid layer schema version');
  let layerData: JsonValue | null = null;
  if (data !== null) {
    if (data !== `${LAYERS}${id}.json`) corrupt('Invalid layer data entry');
    layerData = parseJson(entries[data], data) as JsonValue;
  }
  const layer: SerializedLayer = { id, pluginId, pluginVersion, schemaVersion, data: layerData };
  const number = optional(value['number'], isNumber);
  const visible = optional(value['visible'], isBoolean);
  const locked = optional(value['locked'], isBoolean);
  const opacity = optional(value['opacity'], isNumber);
  if (number !== undefined) layer.number = number;
  if (visible !== undefined) layer.visible = visible;
  if (locked !== undefined) layer.locked = locked;
  if (opacity !== undefined) layer.opacity = opacity;
  return layer;
}

export interface DecodeOptions {
  /** For tests of the migration mechanism. */
  readonly migrations?: Readonly<Record<number, LessonMigration>>;
  readonly schemaVersion?: number;
}

/** Reads a lesson archive; throws {@link LessonFormatError} for a damaged or newer file. */
export function decodeLesson(bytes: Uint8Array, options: DecodeOptions = {}): LessonContent {
  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(bytes);
  } catch {
    return corrupt('Not a ZIP archive');
  }
  const manifest = parseJson(entries[MANIFEST], MANIFEST);
  if (!isRecord(manifest) || manifest['format'] !== LESSON_FORMAT) corrupt('Not a lesson file');
  checkVersion(manifest['formatVersion'], LESSON_FORMAT_VERSION, MANIFEST);

  const raw = parseJson(entries[DOCUMENT], DOCUMENT);
  if (!isRecord(raw)) corrupt('Invalid document');
  const document = migrate(
    raw,
    options.migrations ?? LESSON_MIGRATIONS,
    options.schemaVersion ?? LESSON_SCHEMA_VERSION,
  );
  if (!Array.isArray(document['layers'])) corrupt('Invalid layer list');
  const layers = document['layers'].map((layer) => readLayer(layer, entries));
  if (new Set(layers.map((layer) => layer.id)).size !== layers.length) {
    corrupt('Duplicate layer id');
  }
  const view = readView(document['view']);

  const files = new Map<string, Uint8Array>();
  for (const [name, content] of Object.entries(entries)) {
    if (name === MANIFEST || name === DOCUMENT || name.startsWith(LAYERS)) continue;
    // Folder entries carry no data.
    if (name.endsWith('/')) continue;
    files.set(name, content);
  }
  return {
    document: { schemaVersion: DOCUMENT_SCHEMA_VERSION, layers, ...(view ? { view } : {}) },
    files,
  };
}
