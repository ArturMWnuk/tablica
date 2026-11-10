// Helpers for integration tests of the board with real plugins (not shipped: imported only by tests).
import type { PluginManifest } from '@tablica/plugin-api';
import { Board } from '../lib/core/board';
import type { SerializedDocument, SerializedLayer } from '../lib/core/document';
import type { PluginSource } from '../lib/core/plugin-manager';
import { coreCatalogs } from '../lib/i18n/catalogs';
import { addNamespaceIfFree, type Catalogs, type Locale, translate } from '../lib/i18n/core';

export function layerOf(pluginId: string, id = `${pluginId}-${Math.random()}`): SerializedLayer {
  return { id, pluginId, pluginVersion: null, schemaVersion: null, data: null };
}

export function documentOf(...layers: SerializedLayer[]): SerializedDocument {
  return { schemaVersion: 1, layers };
}

/** Creates a board with translations kept in a plain catalog object. */
export function createTestBoard(
  sources: readonly PluginSource[],
  document?: SerializedDocument,
  locale: Locale = 'en',
): Board {
  let catalogs: Catalogs = coreCatalogs;
  return new Board({
    sources,
    ...(document ? { document } : {}),
    translate: (key, params) => translate(catalogs, locale, key, params),
    addTranslations: (manifest: PluginManifest) => {
      const next = addNamespaceIfFree(catalogs, manifest.id, manifest.translations);
      if (!next) return false;
      catalogs = next;
      return true;
    },
  });
}

/** Mounts the board in a fresh element of the document body. */
export function attachToBody(board: Board): HTMLElement {
  const root = document.createElement('main');
  document.body.append(root);
  board.attach(root);
  return root;
}

export function containers(root: HTMLElement): HTMLElement[] {
  return [...root.children] as HTMLElement[];
}

export function pointerDown(x: number, y: number) {
  return {
    phase: 'down' as const,
    world: { x, y },
    screen: { x, y },
    pointerType: 'mouse' as const,
    pressure: 0.5,
    buttons: 1,
  };
}
