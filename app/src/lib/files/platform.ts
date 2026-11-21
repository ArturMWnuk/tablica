// What the lesson session needs from the system (DAN-01, DAN-02): file dialogs, reading and
// atomic writing of files, questions to the user and the recovery copy of the autosave. The Tauri
// implementation is in `tauri-platform.ts`; tests use an in-memory one.

/** Extension of lesson files (DAN-01 K1). */
export const LESSON_EXTENSION = 'tablica';

/** Description of the autosave copy, kept next to it in the recovery folder. */
export interface RecoveryInfo {
  /** Lesson file the copy belongs to; null for a lesson never saved. */
  readonly path: string | null;
  /** Time of the autosave (ISO 8601). */
  readonly savedAt: string;
}

export interface LessonPlatform {
  /** Asks for a lesson file to open; null when the user cancels. */
  chooseOpenPath(): Promise<string | null>;
  /** Asks where to save the lesson; null when the user cancels. */
  chooseSavePath(suggestedName: string): Promise<string | null>;
  read(path: string): Promise<Uint8Array>;
  /** Writes the file atomically: a temporary file replaces the target only when complete. */
  writeAtomic(path: string, bytes: Uint8Array): Promise<void>;
  /** Yes / no question; true for yes. */
  confirm(message: string): Promise<boolean>;
  /** Writes the autosave copy to the recovery folder (P5: never the lesson file). */
  writeRecovery(bytes: Uint8Array, info: RecoveryInfo): Promise<void>;
  /** The autosave copy left by a session that did not close properly; null when there is none. */
  readRecoveryInfo(): Promise<RecoveryInfo | null>;
  readRecovery(): Promise<Uint8Array>;
  clearRecovery(): Promise<void>;
}

/** Reads a recovery description written by {@link LessonPlatform.writeRecovery}. */
export function parseRecoveryInfo(text: string): RecoveryInfo {
  try {
    const value = JSON.parse(text) as Record<string, unknown>;
    return {
      path: typeof value['path'] === 'string' ? value['path'] : null,
      savedAt: typeof value['savedAt'] === 'string' ? value['savedAt'] : '',
    };
  } catch {
    return { path: null, savedAt: '' };
  }
}

/** File name of a path (Windows or POSIX separators). */
export function fileName(path: string): string {
  return path.split(/[\\/]/).at(-1) ?? path;
}
