// Lesson files through Tauri (DAN-01, DAN-02): system dialogs of the dialog plugin and the file
// commands of the Rust core (`src-tauri/src/files.rs`). Bytes travel as raw IPC bodies; paths go in
// URI-encoded headers, because they may contain Polish letters.
import { invoke } from '@tauri-apps/api/core';
import { ask, open, save } from '@tauri-apps/plugin-dialog';
import {
  LESSON_EXTENSION,
  type LessonPlatform,
  parseRecoveryInfo,
  type RecoveryInfo,
} from './platform';

function bytesOf(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (Array.isArray(value)) return Uint8Array.from(value as number[]);
  throw new TypeError('Unexpected file content');
}

export function createTauriPlatform(filterName: () => string): LessonPlatform {
  const filters = () => [{ name: filterName(), extensions: [LESSON_EXTENSION] }];
  return {
    async chooseOpenPath() {
      const path = await open({ multiple: false, directory: false, filters: filters() });
      return typeof path === 'string' ? path : null;
    },
    async chooseSavePath(suggestedName) {
      return save({ defaultPath: suggestedName, filters: filters() });
    },
    async read(path) {
      return bytesOf(await invoke('lesson_read', { path }));
    },
    async writeAtomic(path, bytes) {
      await invoke('lesson_write', bytes, { headers: { path: encodeURIComponent(path) } });
    },
    async confirm(message) {
      return ask(message, { kind: 'warning' });
    },
    async writeRecovery(bytes, info: RecoveryInfo) {
      await invoke('recovery_write', bytes, {
        headers: { meta: encodeURIComponent(JSON.stringify(info)) },
      });
    },
    async readRecoveryInfo() {
      const text = await invoke<string | null>('recovery_meta');
      return typeof text === 'string' ? parseRecoveryInfo(text) : null;
    },
    async readRecovery() {
      return bytesOf(await invoke('recovery_read'));
    },
    async clearRecovery() {
      await invoke('recovery_clear');
    },
  };
}
