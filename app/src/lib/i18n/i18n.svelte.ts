// Reactive i18n state for Svelte components. Changing the locale re-renders every t() call
// immediately, without restarting the program (UI-01).
import { loadSetting, saveSetting } from '../settings/storage';
import { coreCatalogs } from './catalogs';
import {
  addNamespaceIfFree,
  type Catalogs,
  detectLocale,
  hasTranslation,
  isLocale,
  type Locale,
  translate,
} from './core';

const SETTING_KEY = 'locale';

class I18n {
  locale = $state<Locale>(
    loadSetting(SETTING_KEY, isLocale) ?? detectLocale(globalThis.navigator?.language),
  );
  catalogs = $state<Catalogs>(coreCatalogs);

  setLocale(locale: Locale): void {
    this.locale = locale;
    saveSetting(SETTING_KEY, locale);
  }

  t = (key: string, params?: Readonly<Record<string, string | number>>): string =>
    translate(this.catalogs, this.locale, key, params);

  /** Adds a plugin catalog under the plugin id (WAR-12); false if the namespace is taken. */
  addTranslations = (manifest: { id: string; translations: Catalogs }): boolean => {
    const result = addNamespaceIfFree(this.catalogs, manifest.id, manifest.translations);
    if (!result) return false;
    this.catalogs = result;
    return true;
  };
}

export const i18n = new I18n();
export const t = i18n.t;

/** Translated name of a layer type, or the plugin id when the plugin has no translations. */
export function layerName(pluginId: string): string {
  const key = `${pluginId}.name`;
  return hasTranslation(i18n.catalogs, key) ? t(key) : pluginId;
}

/**
 * Name of one layer as the layer panel shows it: the type name, with the number among layers of
 * the same type when there are several ("Drawing 2"); `number` 0 means the type occurs once.
 */
export function layerTitle(pluginId: string, number: number): string {
  const name = layerName(pluginId);
  return number > 0 ? t('layers.numbered', { name, number }) : name;
}
