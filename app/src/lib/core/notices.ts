// Messages for the user about plugin problems (WAR-06 K3, WAR-12 K4). Texts are translation keys
// of the core catalog (UI-01); `pluginId` lets the interface show the translated layer name.
import { Emitter } from './emitter';

export interface Notice {
  readonly id: number;
  readonly key: string;
  readonly pluginId: string;
  readonly params: Readonly<Record<string, string | number>>;
}

export class Notices {
  private items: Notice[] = [];
  private nextId = 1;
  readonly changed = new Emitter();

  get list(): readonly Notice[] {
    return this.items;
  }

  add(key: string, pluginId: string, params: Record<string, string | number> = {}): void {
    this.items = [...this.items, { id: this.nextId++, key, pluginId, params }];
    this.changed.emit();
  }

  /** Adds the notice unless the same one (key, plugin, params) is already shown. */
  addOnce(key: string, pluginId: string, params: Record<string, string | number> = {}): void {
    const same = this.items.some(
      (item) =>
        item.key === key &&
        item.pluginId === pluginId &&
        JSON.stringify(item.params) === JSON.stringify(params),
    );
    if (!same) this.add(key, pluginId, params);
  }

  dismiss(id: number): void {
    this.items = this.items.filter((notice) => notice.id !== id);
    this.changed.emit();
  }
}
