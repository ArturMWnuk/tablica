// Reactive theme state: applies the resolved theme's tokens as CSS custom properties on the
// document root and follows the OS color scheme when the preference is "system" (UI-02, D11).
import { loadSetting, saveSetting } from '../settings/storage';
import {
  cssVariableName,
  isThemePreference,
  resolveTheme,
  type Theme,
  type ThemePreference,
  themeTokens,
  type ThemeTokens,
} from './tokens';

const SETTING_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

class ThemeState {
  preference = $state<ThemePreference>(loadSetting(SETTING_KEY, isThemePreference) ?? 'system');
  systemPrefersDark = $state(globalThis.matchMedia?.(DARK_QUERY).matches ?? false);
  readonly theme: Theme = $derived(resolveTheme(this.preference, this.systemPrefersDark));

  setPreference(preference: ThemePreference): void {
    this.preference = preference;
    saveSetting(SETTING_KEY, preference);
  }

  /** Starts following the OS color scheme; returns a function that stops it. */
  watchSystem(): () => void {
    const query = globalThis.matchMedia?.(DARK_QUERY);
    if (!query) return () => {};
    const onChange = (event: MediaQueryListEvent) => {
      this.systemPrefersDark = event.matches;
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }
}

export const themeState = new ThemeState();

export function applyTheme(root: HTMLElement, theme: Theme): void {
  const tokens = themeTokens[theme];
  for (const token of Object.keys(tokens) as Array<keyof ThemeTokens>) {
    root.style.setProperty(cssVariableName(token), tokens[token]);
  }
  root.dataset['theme'] = theme;
  root.style.colorScheme = theme;
}
