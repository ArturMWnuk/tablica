// Composition root: the plugins shipped with the program. This is the only place that names
// concrete layers; the core receives them as plugin sources (WAR-12). Plugin modules are loaded
// lazily, when a lesson first uses their layer type (NF-03).
import type { SerializedDocument } from '../lib/core/document';
import type { PluginSource } from '../lib/core/plugin-manager';
import backgroundManifest from '@tablica/layer-background/manifest.json';
import drawingManifest from '@tablica/layer-drawing/manifest.json';
import mediaManifest from '@tablica/layer-media/manifest.json';

export const builtinPlugins: readonly PluginSource[] = [
  { manifest: backgroundManifest, load: () => import('@tablica/layer-background') },
  { manifest: mediaManifest, load: () => import('@tablica/layer-media') },
  { manifest: drawingManifest, load: () => import('@tablica/layer-drawing') },
];

/** Tool active when the program starts: the pen of the drawing layer (RYS-01). */
export const DEFAULT_TOOL = `${drawingManifest.id}/pen`;

/** A new lesson: background at the bottom, multimedia above it and drawing on top (WAR-01). */
export function newLessonDocument(): SerializedDocument {
  return {
    schemaVersion: 1,
    layers: [backgroundManifest.id, mediaManifest.id, drawingManifest.id].map((pluginId) => ({
      id: `layer-${globalThis.crypto.randomUUID()}`,
      pluginId,
      pluginVersion: null,
      schemaVersion: null,
      data: null,
    })),
  };
}
