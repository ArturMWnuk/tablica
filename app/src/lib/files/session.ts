// The lesson open on the board and its file (DAN-01, DAN-02, ADR-009): New, Open, Save, Save as,
// Recent files, the autosave to a separate recovery copy (P5) and the restore offer after a session
// that did not close properly. Framework-independent; the File menu only displays it.
import type { TranslationParams } from '@tablica/plugin-api';
import type { Board } from '../core/board';
import type { SerializedDocument } from '../core/document';
import { Emitter } from '../core/emitter';
import { DEFAULT_AUTOSAVE_MINUTES, MAX_RECENT_FILES, withRecent } from '../settings/recent-files';
import { fileName, LESSON_EXTENSION, type LessonPlatform } from './platform';

/** The file format module is loaded on the first save or open (NF-03). */
const format = () => import('./lesson-format');

export interface LessonSessionOptions {
  readonly board: Board;
  readonly platform: LessonPlatform;
  /** Content of a new lesson (DAN-01 K4: New). */
  readonly newDocument: () => SerializedDocument;
  readonly translate: (key: string, params?: TranslationParams) => string;
  /** Recently used files, newest first, and where to remember changes of the list. */
  readonly recentFiles?: readonly string[];
  readonly saveRecentFiles?: (paths: readonly string[]) => void;
  /** Autosave interval in minutes (DAN-02 K1, D7); null switches the autosave off. */
  readonly autosaveMinutes?: number | null;
  readonly now?: () => Date;
}

/** Notice keys about files; they are not about a layer, so no plugin is named. */
const NO_PLUGIN = '';

export class LessonSession {
  readonly board: Board;
  readonly changed = new Emitter();
  private readonly platform: LessonPlatform;
  private readonly options: LessonSessionOptions;
  private currentPath: string | null = null;
  private recent: string[];
  /** Entries of the opened file that the program does not use itself (e.g. `assets/…`). */
  private files: ReadonlyMap<string, Uint8Array> = new Map();
  private savedRevision: number;
  /** Revision covered by the latest autosave copy (or save); nothing new means no autosave. */
  private autosavedRevision: number;
  /** Set for a lesson restored from the recovery copy: it differs from its file until saved. */
  private restored = false;
  private minutes: number | null;
  private timer: ReturnType<typeof setInterval> | undefined;
  /** Operations run one after another (an autosave never mixes with an open). */
  private queue: Promise<unknown> = Promise.resolve();
  private unsubscribe: Array<() => void>;

  constructor(options: LessonSessionOptions) {
    this.options = options;
    this.board = options.board;
    this.platform = options.platform;
    this.recent = [...(options.recentFiles ?? [])].slice(0, MAX_RECENT_FILES);
    this.savedRevision = this.board.revision;
    this.autosavedRevision = this.board.revision;
    this.minutes =
      options.autosaveMinutes === undefined ? DEFAULT_AUTOSAVE_MINUTES : options.autosaveMinutes;
    const notify = () => this.changed.emit();
    this.unsubscribe = [
      this.board.history.changed.subscribe(notify),
      this.board.document.changed.subscribe(notify),
    ];
    this.schedule();
  }

  /** File of the lesson; null for a lesson never saved. */
  get path(): string | null {
    return this.currentPath;
  }

  /** Name shown to the user: the file name or "Untitled lesson". */
  get title(): string {
    return this.currentPath ? fileName(this.currentPath) : this.t('file.untitled');
  }

  /** The lesson has changes that are not in its file. */
  get dirty(): boolean {
    return this.restored || this.board.revision !== this.savedRevision;
  }

  get recentFiles(): readonly string[] {
    return this.recent;
  }

  get autosaveMinutes(): number | null {
    return this.minutes;
  }

  private t(key: string, params?: TranslationParams): string {
    return this.options.translate(key, params);
  }

  private run<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation, operation);
    this.queue = result.catch(() => undefined);
    return result;
  }

  /**
   * DAN-02 K3: called at start. If the previous session did not close properly, its autosave copy
   * is still in the recovery folder and the user is offered to restore it. Returns true when the
   * lesson was restored.
   */
  start(): Promise<boolean> {
    return this.run(async () => {
      let info;
      try {
        info = await this.platform.readRecoveryInfo();
      } catch (error) {
        console.error('Reading the recovery copy failed', error);
        return false;
      }
      if (!info) return false;
      const when = info.savedAt ? new Date(info.savedAt).toLocaleString() : '';
      const name = info.path ? fileName(info.path) : this.t('file.untitled');
      if (!(await this.platform.confirm(this.t('file.restoreConfirm', { file: name, when })))) {
        await this.clearRecovery();
        return false;
      }
      try {
        const { decodeLesson } = await format();
        const content = decodeLesson(await this.platform.readRecovery());
        await this.load(content.document, content.files, info.path);
      } catch (error) {
        this.fail(error, 'notice.recoveryFailed', name);
        await this.clearRecovery();
        return false;
      }
      // The copy stays until the lesson is saved or closed: it is still the only copy of the work.
      this.restored = true;
      this.changed.emit();
      return true;
    });
  }

  /** Asks before throwing away unsaved changes; true when the caller may go on. */
  private async mayDiscard(): Promise<boolean> {
    if (!this.dirty) return true;
    return this.platform.confirm(this.t('file.discardConfirm', { file: this.title }));
  }

  private async load(
    document: SerializedDocument,
    files: ReadonlyMap<string, Uint8Array>,
    path: string | null,
  ): Promise<void> {
    await this.board.openDocument(document);
    this.files = files;
    this.currentPath = path;
    this.restored = false;
    this.savedRevision = this.board.revision;
    this.autosavedRevision = this.board.revision;
    this.changed.emit();
  }

  /** DAN-01 K4: New (Ctrl+N). */
  newLesson(): Promise<boolean> {
    return this.run(async () => {
      if (!(await this.mayDiscard())) return false;
      await this.load(this.options.newDocument(), new Map(), null);
      await this.clearRecovery();
      return true;
    });
  }

  /** DAN-01 K4: Open (Ctrl+O) or a file from Recent files (`path`). */
  open(path?: string): Promise<boolean> {
    return this.run(async () => {
      if (!(await this.mayDiscard())) return false;
      const target = path ?? (await this.platform.chooseOpenPath());
      if (target === null) return false;
      let bytes: Uint8Array;
      try {
        bytes = await this.platform.read(target);
      } catch (error) {
        this.fail(error, 'notice.fileReadFailed', fileName(target));
        // A file that cannot be read any more leaves the list.
        this.setRecent(this.recent.filter((item) => item !== target));
        return false;
      }
      try {
        const { decodeLesson } = await format();
        const content = decodeLesson(bytes);
        await this.load(content.document, content.files, target);
      } catch (error) {
        this.fail(error, 'notice.fileCorrupt', fileName(target));
        return false;
      }
      this.setRecent(withRecent(this.recent, target));
      await this.clearRecovery();
      return true;
    });
  }

  /** DAN-01 K4: Save (Ctrl+S); asks for a file the first time. */
  save(): Promise<boolean> {
    return this.run(() => this.saveTo(this.currentPath));
  }

  /** DAN-01 K4: Save as (Ctrl+Shift+S). */
  saveAs(): Promise<boolean> {
    return this.run(() => this.saveTo(null));
  }

  private async saveTo(known: string | null): Promise<boolean> {
    let path = known;
    if (path === null) {
      const suggested = this.currentPath
        ? fileName(this.currentPath)
        : `${this.t('file.untitled')}.${LESSON_EXTENSION}`;
      path = await this.platform.chooseSavePath(suggested);
      if (path === null) return false;
      if (!path.toLowerCase().endsWith(`.${LESSON_EXTENSION}`)) path += `.${LESSON_EXTENSION}`;
    }
    const revision = this.board.revision;
    try {
      const bytes = await this.encode();
      await this.platform.writeAtomic(path, bytes);
    } catch (error) {
      this.fail(error, 'notice.fileWriteFailed', fileName(path));
      return false;
    }
    this.currentPath = path;
    this.restored = false;
    this.savedRevision = revision;
    this.autosavedRevision = revision;
    this.setRecent(withRecent(this.recent, path));
    // The lesson file now holds the work; the recovery copy is not needed (P5).
    await this.clearRecovery();
    this.changed.emit();
    return true;
  }

  private async encode(): Promise<Uint8Array> {
    const { encodeLesson } = await format();
    return encodeLesson({ document: this.board.serialize(), files: this.files });
  }

  /** DAN-02 K1, D7: sets the autosave interval in minutes; null switches the autosave off. */
  setAutosaveMinutes(minutes: number | null): void {
    this.minutes = minutes;
    this.schedule();
    this.changed.emit();
  }

  private schedule(): void {
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
    if (this.minutes === null) return;
    this.timer = setInterval(() => void this.autosave(), this.minutes * 60_000);
  }

  /**
   * DAN-02 K2, P5: writes the lesson to the recovery copy, never to the lesson file. Skipped
   * when nothing changed since the last save or autosave. Returns true when a copy was written.
   */
  autosave(): Promise<boolean> {
    return this.run(async () => {
      const revision = this.board.revision;
      if (revision === this.autosavedRevision) return false;
      try {
        const bytes = await this.encode();
        const savedAt = (this.options.now?.() ?? new Date()).toISOString();
        await this.platform.writeRecovery(bytes, { path: this.currentPath, savedAt });
      } catch (error) {
        this.fail(error, 'notice.autosaveFailed', this.title);
        return false;
      }
      this.autosavedRevision = revision;
      return true;
    });
  }

  /**
   * Proper end of the session (closing the window): asks about unsaved changes and removes the
   * recovery copy, so the next start offers no restore. Returns false when the user stays.
   */
  close(): Promise<boolean> {
    return this.run(async () => {
      if (!(await this.mayDiscard())) return false;
      await this.clearRecovery();
      this.dispose();
      return true;
    });
  }

  dispose(): void {
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
    for (const off of this.unsubscribe) off();
    this.unsubscribe = [];
  }

  private setRecent(paths: string[]): void {
    this.recent = paths;
    this.options.saveRecentFiles?.(paths);
    this.changed.emit();
  }

  private async clearRecovery(): Promise<void> {
    try {
      await this.platform.clearRecovery();
    } catch (error) {
      console.error('Removing the recovery copy failed', error);
    }
  }

  /** A file problem becomes a message for the user, never a crash (DAN-01 K2, K3). */
  private fail(error: unknown, key: string, file: string): void {
    console.error(key, error);
    const newer = error instanceof Error && error.name === 'LessonFormatError';
    const kind = newer ? (error as { kind?: string }).kind : undefined;
    const notice = kind === 'newer' ? 'notice.fileNewer' : key;
    this.board.notices.add(notice, NO_PLUGIN, { file });
  }
}
