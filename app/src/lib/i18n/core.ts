// Framework-independent translation core (UI-01). Every user-facing string is looked up by key
// in a per-locale message catalog; plugins add their own catalogs under their namespace.

export const LOCALES = ['pl', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export interface Messages {
  [key: string]: string | Messages;
}

export type Catalogs = Record<Locale, Messages>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Default locale from the system language (D10): Polish -> pl, anything else -> en. */
export function detectLocale(systemLanguage: string | undefined): Locale {
  return systemLanguage?.toLowerCase().startsWith('pl') ? 'pl' : 'en';
}

/** Lists all leaf keys of a catalog in dotted form, e.g. "settings.language". */
export function flattenKeys(messages: Messages, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : flattenKeys(value, path);
  });
}

function lookup(messages: Messages, key: string): string | undefined {
  let node: string | Messages | undefined = messages;
  for (const part of key.split('.')) {
    if (node === undefined || typeof node === 'string') return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

/**
 * Translates a key. Placeholders like `{name}` are replaced from `params`.
 * Falls back to the other locale and finally to the key itself, so a missing
 * translation is visible but never crashes the UI.
 */
export function translate(
  catalogs: Catalogs,
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const fallback: Locale = locale === 'pl' ? 'en' : 'pl';
  const text = lookup(catalogs[locale], key) ?? lookup(catalogs[fallback], key) ?? key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** Adds a namespaced catalog (e.g. from a layer plugin) to the existing catalogs. */
export function addNamespace(catalogs: Catalogs, namespace: string, added: Catalogs): Catalogs {
  const result = { ...catalogs };
  for (const locale of LOCALES) {
    result[locale] = { ...catalogs[locale], [namespace]: added[locale] };
  }
  return result;
}
