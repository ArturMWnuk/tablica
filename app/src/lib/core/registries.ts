// Registries of what plugins contribute: tools, shortcuts and panels (WAR-12).
import type { PanelDefinition, ShortcutDefinition, ToolDefinition } from '@tablica/plugin-api';
import { Emitter } from './emitter';

export interface Contribution<T> {
  /** Global key: `<pluginId>/<id>`. */
  readonly key: string;
  readonly pluginId: string;
  readonly definition: T;
}

class Registry<T extends { readonly id: string }> {
  protected items = new Map<string, Contribution<T>>();
  readonly changed = new Emitter();

  register(pluginId: string, definition: T): Contribution<T> {
    const key = `${pluginId}/${definition.id}`;
    if (this.items.has(key)) throw new Error(`Duplicate contribution ${key}`);
    const contribution = { key, pluginId, definition };
    this.items.set(key, contribution);
    this.changed.emit();
    return contribution;
  }

  get(key: string): Contribution<T> | undefined {
    return this.items.get(key);
  }

  list(): Contribution<T>[] {
    return [...this.items.values()];
  }

  removePlugin(pluginId: string): void {
    for (const [key, item] of this.items) {
      if (item.pluginId === pluginId) this.items.delete(key);
    }
    this.changed.emit();
  }
}

export class ToolRegistry extends Registry<ToolDefinition<unknown>> {
  private activeKey: string | undefined;

  setActive(key: string | undefined): void {
    if (key !== undefined && !this.items.has(key)) throw new Error(`Unknown tool ${key}`);
    this.activeKey = key;
    this.changed.emit();
  }

  get active(): Contribution<ToolDefinition<unknown>> | undefined {
    return this.activeKey === undefined ? undefined : this.items.get(this.activeKey);
  }

  override removePlugin(pluginId: string): void {
    if (this.active?.pluginId === pluginId) this.activeKey = undefined;
    super.removePlugin(pluginId);
  }
}

/** Keyboard state needed to match a shortcut. */
export interface KeyInput {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

const MODIFIERS = ['ctrl', 'alt', 'shift', 'meta'] as const;

/** Normalizes `Ctrl+Shift+K` to a canonical form; returns undefined for an invalid combination. */
export function normalizeKeys(keys: string): string | undefined {
  const parts = keys.split('+').map((part) => part.trim().toLowerCase());
  const key = parts.pop();
  if (!key) return undefined;
  const modifiers = new Set<string>();
  for (const part of parts) {
    if (!(MODIFIERS as readonly string[]).includes(part)) return undefined;
    modifiers.add(part);
  }
  return [...MODIFIERS.filter((modifier) => modifiers.has(modifier)), key].join('+');
}

function inputKeys(input: KeyInput): string {
  const modifiers = MODIFIERS.filter((modifier) => input[`${modifier}Key`]);
  return [...modifiers, input.key.toLowerCase()].join('+');
}

export class ShortcutRegistry extends Registry<ShortcutDefinition> {
  /** Throws when the combination is invalid; returns false when it is already taken. */
  tryRegister(pluginId: string, definition: ShortcutDefinition): boolean {
    const keys = normalizeKeys(definition.keys);
    if (keys === undefined) throw new Error(`Invalid shortcut ${definition.keys}`);
    if (this.list().some((item) => normalizeKeys(item.definition.keys) === keys)) return false;
    this.register(pluginId, definition);
    return true;
  }

  /** Finds the shortcut matching a key press. */
  match(input: KeyInput): Contribution<ShortcutDefinition> | undefined {
    const keys = inputKeys(input);
    return this.list().find((item) => normalizeKeys(item.definition.keys) === keys);
  }
}

export class PanelRegistry extends Registry<PanelDefinition> {}
