// Reactive i18n state for Svelte components. Changing the locale re-renders every t() call
// immediately, without restarting the program (UI-01).
import { loadSetting, saveSetting } from '../settings/storage';
import { coreCatalogs } from './catalogs';
import { type Catalogs, detectLocale, isLocale, type Locale, translate } from './core';

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

  t = (key: string, params?: Record<string, string | number>): string =>
    translate(this.catalogs, this.locale, key, params);
}

export const i18n = new I18n();
export const t = i18n.t;
