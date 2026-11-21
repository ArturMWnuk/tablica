// The `.tablica` file format (DAN-01 K1–K3, ADR-009).
import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from 'fflate';
import { describe, expect, it } from 'vitest';
import type { SerializedDocument } from '../core/document';
import {
  decodeLesson,
  encodeLesson,
  LESSON_FORMAT_VERSION,
  LESSON_SCHEMA_VERSION,
  LessonFormatError,
} from './lesson-format';

const lesson: SerializedDocument = {
  schemaVersion: 1,
  view: { x: -120.5, y: 40, zoom: 1.75 },
  layers: [
    {
      id: 'layer-bg',
      pluginId: 'layer-background',
      pluginVersion: '0.1.0',
      schemaVersion: 1,
      data: null,
      number: 0,
      visible: true,
      locked: true,
      opacity: 1,
    },
    {
      id: 'layer-draw',
      pluginId: 'layer-drawing',
      pluginVersion: '0.2.0',
      schemaVersion: 2,
      data: { strokes: [{ id: 's1', tool: 'pen', points: [[1, 2, 0.5, 0]] }], note: 'żółć' },
      number: 2,
      visible: false,
      locked: false,
      opacity: 0.35,
    },
  ],
};

function entries(bytes: Uint8Array): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(unzipSync(bytes)).map(([name, content]) => [
      name,
      name.endsWith('.json') ? JSON.parse(strFromU8(content)) : content,
    ]),
  );
}

/** Archive with the given JSON entries (and raw ones), to build damaged or future files. */
function archive(json: Record<string, unknown>, raw: Record<string, Uint8Array> = {}) {
  const zippable: Zippable = { ...raw };
  for (const [name, value] of Object.entries(json)) zippable[name] = strToU8(JSON.stringify(value));
  return zipSync(zippable);
}

function validEntries(): Record<string, unknown> {
  const decoded = entries(encodeLesson({ document: lesson, files: new Map() }));
  return decoded;
}

function failure(run: () => unknown): LessonFormatError {
  try {
    run();
  } catch (error) {
    if (error instanceof LessonFormatError) return error;
    throw error;
  }
  throw new Error('Expected a LessonFormatError');
}

describe('DAN-01: lesson file', () => {
  it('DAN-01: the file is a ZIP with manifest.json, document.json and one entry per layer', () => {
    const decoded = entries(encodeLesson({ document: lesson, files: new Map() }));
    expect(Object.keys(decoded).sort()).toEqual([
      'document.json',
      'layers/layer-draw.json',
      'manifest.json',
    ]);
    expect(decoded['manifest.json']).toEqual({
      format: 'tablica',
      formatVersion: LESSON_FORMAT_VERSION,
    });
    const document = decoded['document.json'] as Record<string, unknown>;
    expect(document['schemaVersion']).toBe(LESSON_SCHEMA_VERSION);
    expect(document['view']).toEqual(lesson.view);
    // Layer data lives in its own entry, written only by the plugin (WAR-06).
    expect((document['layers'] as Array<Record<string, unknown>>).map((l) => l['data'])).toEqual([
      null,
      'layers/layer-draw.json',
    ]);
    expect(decoded['layers/layer-draw.json']).toEqual(lesson.layers[1]?.data);
  });

  it('DAN-01: writing and reading keep layers, settings, numbers, data and the view', () => {
    const read = decodeLesson(encodeLesson({ document: lesson, files: new Map() }));
    expect(read.document).toEqual(lesson);
    expect(read.files.size).toBe(0);
  });

  it('DAN-01: embedded and unknown entries are carried over unchanged', () => {
    const image = new Uint8Array([137, 80, 78, 71, 0, 255]);
    const future = strToU8('{"from":"a newer program"}');
    const files = new Map([
      ['assets/picture.png', image],
      ['notes/future.json', future],
    ]);
    const read = decodeLesson(encodeLesson({ document: lesson, files }));
    expect(read.files).toEqual(files);
    const again = decodeLesson(encodeLesson(read));
    expect(again.files).toEqual(files);
    expect(again.document).toEqual(lesson);
  });

  it('DAN-01: an unknown entry cannot replace the lesson entries', () => {
    const files = new Map([['document.json', strToU8('{"broken":true}')]]);
    expect(decodeLesson(encodeLesson({ document: lesson, files })).document).toEqual(lesson);
  });

  it('DAN-01: layer ids that are not safe file names are refused when writing', () => {
    const unsafe = { ...lesson, layers: [{ ...lesson.layers[1]!, id: '../evil' }] };
    expect(() => encodeLesson({ document: unsafe, files: new Map() })).toThrow(/Unsafe/);
  });
});

describe('DAN-01: damaged files and newer versions', () => {
  it.each([
    ['empty file', new Uint8Array()],
    ['text file', strToU8('not a lesson at all')],
    ['ZIP without manifest', archive({ 'document.json': { schemaVersion: 1, layers: [] } })],
    [
      'other format',
      archive({
        'manifest.json': { format: 'other', formatVersion: 1 },
        'document.json': { schemaVersion: 1, layers: [] },
      }),
    ],
    ['missing document', archive({ 'manifest.json': { format: 'tablica', formatVersion: 1 } })],
  ])('DAN-01: %s gives a "corrupt" error, not a crash', (_name, bytes) => {
    expect(failure(() => decodeLesson(bytes)).kind).toBe('corrupt');
  });

  it('DAN-01: invalid JSON, a missing layer entry or bad settings give "corrupt"', () => {
    const base = validEntries();
    const cases: Array<Record<string, unknown>> = [];
    const layers = (base['document.json'] as { layers: Array<Record<string, unknown>> }).layers;
    const withLayers = (changed: unknown[]) => ({
      ...base,
      'document.json': { ...(base['document.json'] as object), layers: changed },
    });
    cases.push(withLayers([{ ...layers[0], id: '../x' }]));
    cases.push(withLayers([{ ...layers[0], opacity: 'full' }]));
    cases.push(withLayers([{ ...layers[0], visible: 1 }]));
    cases.push(withLayers([layers[0], layers[0]]));
    cases.push(withLayers([{ ...layers[1], data: 'layers/other.json' }]));
    cases.push({ ...base, 'document.json': { ...(base['document.json'] as object), view: {} } });
    const missingEntry = { ...base };
    delete missingEntry['layers/layer-draw.json'];
    cases.push(missingEntry);
    for (const entry of cases) {
      expect(failure(() => decodeLesson(archive(entry))).kind).toBe('corrupt');
    }
    const badJson = archive(
      { 'manifest.json': base['manifest.json'], 'document.json': base['document.json'] },
      { 'layers/layer-draw.json': strToU8('{"strokes": [') },
    );
    expect(failure(() => decodeLesson(badJson)).kind).toBe('corrupt');
  });

  it('DAN-01: a truncated file gives "corrupt"', () => {
    const bytes = encodeLesson({ document: lesson, files: new Map() });
    expect(failure(() => decodeLesson(bytes.slice(0, bytes.length - 30))).kind).toBe('corrupt');
  });

  it('DAN-01: a file from a newer program (layout or schema) gives "newer"', () => {
    const base = validEntries();
    const newerLayout = archive({
      ...base,
      'manifest.json': { format: 'tablica', formatVersion: LESSON_FORMAT_VERSION + 1 },
    });
    expect(failure(() => decodeLesson(newerLayout)).kind).toBe('newer');
    const newerSchema = archive({
      ...base,
      'document.json': {
        ...(base['document.json'] as object),
        schemaVersion: LESSON_SCHEMA_VERSION + 1,
      },
    });
    expect(failure(() => decodeLesson(newerSchema)).kind).toBe('newer');
  });

  it('DAN-01: older schemas are migrated step by step on reading', () => {
    // Schema 1 had `settings` instead of separate layer fields, schema 2 named the view `camera`.
    const old = archive({
      'manifest.json': { format: 'tablica', formatVersion: 1 },
      'document.json': {
        schemaVersion: 1,
        camera: { x: 5, y: 6, zoom: 2 },
        layers: [
          {
            id: 'a',
            pluginId: 'p',
            pluginVersion: null,
            schemaVersion: null,
            data: null,
            settings: { hidden: true },
          },
        ],
      },
    });
    const migrations = {
      1: (document: Record<string, unknown>) => ({
        ...document,
        layers: (document['layers'] as Array<Record<string, unknown>>).map(
          ({ settings, ...layer }) => ({
            ...layer,
            visible: !(settings as { hidden?: boolean }).hidden,
          }),
        ),
      }),
      2: ({ camera, ...document }: Record<string, unknown>) => ({ ...document, view: camera }),
    };
    const read = decodeLesson(old, { migrations, schemaVersion: 3 });
    expect(read.document.view).toEqual({ x: 5, y: 6, zoom: 2 });
    expect(read.document.layers[0]).toMatchObject({ id: 'a', visible: false });
    // A missing migration step is a damaged file, not a crash.
    expect(failure(() => decodeLesson(old, { migrations: {}, schemaVersion: 2 })).kind).toBe(
      'corrupt',
    );
  });
});
