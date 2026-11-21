// Helpers for integration tests of the board with real plugins (not shipped: imported only by tests).
import type { PluginManifest } from '@tablica/plugin-api';
import { Board } from '../lib/core/board';
import type { SerializedDocument, SerializedLayer } from '../lib/core/document';
import type { PluginSource } from '../lib/core/plugin-manager';
import type { LessonPlatform, RecoveryInfo } from '../lib/files/platform';
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

/**
 * Files, dialogs and the recovery folder kept in memory (DAN-01, DAN-02 tests). Dialog answers
 * and confirmations are queued by the test; `failWrites` makes every write fail.
 */
export class MemoryPlatform implements LessonPlatform {
  readonly files = new Map<string, Uint8Array>();
  readonly questions: string[] = [];
  openAnswers: Array<string | null> = [];
  saveAnswers: Array<string | null> = [];
  confirmAnswers: boolean[] = [];
  failWrites = false;
  recovery: { bytes: Uint8Array; info: RecoveryInfo } | null = null;
  recoveryWrites = 0;

  chooseOpenPath(): Promise<string | null> {
    return Promise.resolve(this.openAnswers.shift() ?? null);
  }

  chooseSavePath(): Promise<string | null> {
    return Promise.resolve(this.saveAnswers.shift() ?? null);
  }

  read(path: string): Promise<Uint8Array> {
    const bytes = this.files.get(path);
    return bytes ? Promise.resolve(bytes.slice()) : Promise.reject(new Error(`ENOENT ${path}`));
  }

  writeAtomic(path: string, bytes: Uint8Array): Promise<void> {
    if (this.failWrites) return Promise.reject(new Error('EACCES'));
    this.files.set(path, bytes.slice());
    return Promise.resolve();
  }

  confirm(message: string): Promise<boolean> {
    this.questions.push(message);
    return Promise.resolve(this.confirmAnswers.shift() ?? false);
  }

  writeRecovery(bytes: Uint8Array, info: RecoveryInfo): Promise<void> {
    if (this.failWrites) return Promise.reject(new Error('EACCES'));
    this.recovery = { bytes: bytes.slice(), info };
    this.recoveryWrites += 1;
    return Promise.resolve();
  }

  readRecoveryInfo(): Promise<RecoveryInfo | null> {
    return Promise.resolve(this.recovery?.info ?? null);
  }

  readRecovery(): Promise<Uint8Array> {
    return this.recovery
      ? Promise.resolve(this.recovery.bytes.slice())
      : Promise.reject(new Error('no recovery copy'));
  }

  clearRecovery(): Promise<void> {
    this.recovery = null;
    return Promise.resolve();
  }
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
    tilt: 0,
    buttons: 1,
    predicted: [],
  };
}
