import { parseVersion } from './version';

/** Interface languages supported by the program. */
export type Locale = 'pl' | 'en';

/** A translation catalog: nested keys with texts. Placeholders look like `{name}`. */
export interface Messages {
  [key: string]: string | Messages;
}

/**
 * Plugin manifest (`manifest.json` in the plugin package).
 *
 * The plugin `id` is also the layer type and the namespace of the plugin's translations.
 */
export interface PluginManifest {
  /** Unique identifier in kebab-case, e.g. `layer-drawing`. */
  readonly id: string;
  /** Version of the plugin itself (SemVer), independent of the program version. */
  readonly version: string;
  /** API version the plugin was written for (SemVer), e.g. `1.0.0`. */
  readonly apiVersion: string;
  /**
   * Translations for every interface language. Each catalog must contain at least the keys
   * `name` (layer name) and `description` (one sentence for the layer list).
   */
  readonly translations: Readonly<Record<Locale, Messages>>;
  /** Reserved for future use; must be empty or omitted in API 1.x. */
  readonly permissions?: readonly string[];
}

/** Problems reported by {@link validateManifest}. Each code names the invalid field. */
export type ManifestProblem =
  'not-an-object' | 'id' | 'version' | 'apiVersion' | 'translations' | 'permissions';

const ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const LOCALES: readonly Locale[] = ['pl', 'en'];

function isMessages(value: unknown): value is Messages {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return Object.values(value).every((item) => typeof item === 'string' || isMessages(item));
}

function hasText(messages: Messages, key: string): boolean {
  const value = messages[key];
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Checks a manifest. Returns an empty list when the manifest is valid.
 * Use it in the plugin's own tests; the program runs the same check before loading a plugin.
 */
export function validateManifest(value: unknown): ManifestProblem[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return ['not-an-object'];
  }
  const manifest = value as Record<string, unknown>;
  const problems: ManifestProblem[] = [];
  if (typeof manifest['id'] !== 'string' || !ID_PATTERN.test(manifest['id'])) problems.push('id');
  if (typeof manifest['version'] !== 'string' || !parseVersion(manifest['version'])) {
    problems.push('version');
  }
  if (typeof manifest['apiVersion'] !== 'string' || !parseVersion(manifest['apiVersion'])) {
    problems.push('apiVersion');
  }
  const translations = manifest['translations'];
  const validTranslations =
    typeof translations === 'object' &&
    translations !== null &&
    LOCALES.every((locale) => {
      const catalog = (translations as Record<string, unknown>)[locale];
      return isMessages(catalog) && hasText(catalog, 'name') && hasText(catalog, 'description');
    });
  if (!validTranslations) problems.push('translations');
  const permissions = manifest['permissions'];
  if (permissions !== undefined && !(Array.isArray(permissions) && permissions.length === 0)) {
    problems.push('permissions');
  }
  return problems;
}
