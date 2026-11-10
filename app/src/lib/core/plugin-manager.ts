// Plugin manager (WAR-12, ADR-008): manifests, API compatibility and lazy loading of plugin
// modules on first use (NF-03). The core never imports a concrete layer; plugins are given to it
// as sources by the application entry point.
import {
  API_VERSION,
  isApiCompatible,
  type LayerPlugin,
  type PluginManifest,
  validateManifest,
} from '@tablica/plugin-api';
import type { Notices } from './notices';

/** A plugin available to the program: its manifest and a lazy loader of its module. */
export interface PluginSource {
  readonly manifest: unknown;
  load(): Promise<{ default: unknown }>;
}

export type PluginState = 'available' | 'loading' | 'active' | 'broken';

export interface PluginEntry {
  readonly manifest: PluginManifest;
  readonly source: PluginSource;
  state: PluginState;
  plugin: LayerPlugin<unknown> | undefined;
}

export interface PluginManagerHooks {
  /** Adds the plugin's translations under its namespace; returns false if the name is taken. */
  addTranslations(manifest: PluginManifest): boolean;
  /** Activates a freshly loaded plugin (registers its tools, shortcuts, panels). */
  activate(manifest: PluginManifest, plugin: LayerPlugin<unknown>): void;
}

function isPluginModule(value: unknown): value is LayerPlugin<unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const plugin = value as Record<string, unknown>;
  return (
    Number.isInteger(plugin['schemaVersion']) &&
    (plugin['schemaVersion'] as number) >= 1 &&
    typeof plugin['createData'] === 'function' &&
    typeof plugin['serialize'] === 'function' &&
    typeof plugin['deserialize'] === 'function' &&
    typeof plugin['mountLayer'] === 'function' &&
    (plugin['activate'] === undefined || typeof plugin['activate'] === 'function')
  );
}

function manifestId(manifest: unknown): string {
  const id = (manifest as { id?: unknown } | null)?.id;
  return typeof id === 'string' ? id : '?';
}

export class PluginManager {
  private entries = new Map<string, PluginEntry>();
  private loading = new Map<string, Promise<LayerPlugin<unknown> | undefined>>();

  constructor(
    private readonly notices: Notices,
    private readonly hooks: PluginManagerHooks,
    readonly apiVersion: string = API_VERSION,
  ) {}

  /**
   * Registers a plugin source without loading its module. Invalid manifests and plugins written
   * for an incompatible API version are rejected with a notice for the user (WAR-12 K4).
   */
  register(source: PluginSource): boolean {
    const problems = validateManifest(source.manifest);
    if (problems.length > 0) {
      this.notices.add('notice.pluginInvalid', manifestId(source.manifest));
      return false;
    }
    const manifest = source.manifest as PluginManifest;
    if (!isApiCompatible(manifest.apiVersion, this.apiVersion)) {
      this.notices.add('notice.pluginIncompatible', manifest.id, {
        required: manifest.apiVersion,
        provided: this.apiVersion,
      });
      return false;
    }
    if (this.entries.has(manifest.id) || !this.hooks.addTranslations(manifest)) {
      this.notices.add('notice.pluginDuplicate', manifest.id);
      return false;
    }
    this.entries.set(manifest.id, { manifest, source, state: 'available', plugin: undefined });
    return true;
  }

  get(id: string): PluginEntry | undefined {
    return this.entries.get(id);
  }

  list(): PluginEntry[] {
    return [...this.entries.values()];
  }

  /** Loads and activates the plugin once; resolves to undefined if it is missing or fails. */
  load(id: string): Promise<LayerPlugin<unknown> | undefined> {
    const entry = this.entries.get(id);
    if (!entry) return Promise.resolve(undefined);
    let pending = this.loading.get(id);
    if (!pending) {
      pending = this.loadEntry(entry);
      this.loading.set(id, pending);
    }
    return pending;
  }

  private async loadEntry(entry: PluginEntry): Promise<LayerPlugin<unknown> | undefined> {
    entry.state = 'loading';
    let plugin: unknown;
    try {
      plugin = (await entry.source.load()).default;
    } catch (error) {
      return this.fail(entry, 'notice.pluginFailed', error);
    }
    if (!isPluginModule(plugin)) return this.fail(entry, 'notice.pluginInvalid');
    try {
      this.hooks.activate(entry.manifest, plugin);
    } catch (error) {
      return this.fail(entry, 'notice.pluginFailed', error);
    }
    entry.plugin = plugin;
    entry.state = 'active';
    return plugin;
  }

  /** Marks the plugin as not working (its layers are handled by the caller). */
  markBroken(id: string): void {
    const entry = this.entries.get(id);
    if (entry) entry.state = 'broken';
  }

  private fail(entry: PluginEntry, key: string, error?: unknown): undefined {
    if (error !== undefined) console.error(`Plugin ${entry.manifest.id} failed`, error);
    entry.state = 'broken';
    entry.plugin = undefined;
    this.notices.add(key, entry.manifest.id);
    return undefined;
  }
}
