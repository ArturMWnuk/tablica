// Common, chronological history of document changes (DAN-03, P4, ADR-009). Every change of a
// layer made through the plugin API is recorded here. Step 1.2 provides the mechanism used by
// the plugin API; the step limit, merging and the undo/redo interface come in step 1.3.
import { Emitter } from './emitter';

/** One undoable change. */
export interface HistoryEntry {
  apply(): void;
  revert(): void;
}

export class History {
  private done: HistoryEntry[] = [];
  private undone: HistoryEntry[] = [];
  readonly changed = new Emitter();

  /** Applies the entry and records it. If `apply` throws, nothing is recorded. */
  execute(entry: HistoryEntry): void {
    entry.apply();
    this.done.push(entry);
    this.undone = [];
    this.changed.emit();
  }

  get canUndo(): boolean {
    return this.done.length > 0;
  }

  get canRedo(): boolean {
    return this.undone.length > 0;
  }

  /** The entry that the next undo or redo would affect. */
  peek(direction: 'undo' | 'redo'): HistoryEntry | undefined {
    return (direction === 'undo' ? this.done : this.undone).at(-1);
  }

  undo(): boolean {
    const entry = this.done.pop();
    if (!entry) return false;
    entry.revert();
    this.undone.push(entry);
    this.changed.emit();
    return true;
  }

  redo(): boolean {
    const entry = this.undone.pop();
    if (!entry) return false;
    entry.apply();
    this.done.push(entry);
    this.changed.emit();
    return true;
  }

  /** Drops entries matching the predicate (e.g. of a layer whose plugin stopped working). */
  discard(predicate: (entry: HistoryEntry) => boolean): void {
    this.done = this.done.filter((entry) => !predicate(entry));
    this.undone = this.undone.filter((entry) => !predicate(entry));
    this.changed.emit();
  }
}
