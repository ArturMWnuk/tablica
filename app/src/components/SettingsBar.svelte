<script lang="ts">
  import { i18n, t } from '../lib/i18n/i18n.svelte';
  import { isLocale, LOCALES } from '../lib/i18n/core';
  import { themeState } from '../lib/theme/theme.svelte';
  import { isThemePreference, THEME_PREFERENCES } from '../lib/theme/tokens';

  function onLocaleChange(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value;
    if (isLocale(value)) i18n.setLocale(value);
  }

  function onThemeChange(event: Event) {
    const value = (event.currentTarget as HTMLSelectElement).value;
    if (isThemePreference(value)) themeState.setPreference(value);
  }
</script>

<header class="bar">
  <h1 class="title">{t('app.title')}</h1>
  <label class="field">
    <span>{t('settings.language')}</span>
    <select data-testid="language-select" value={i18n.locale} onchange={onLocaleChange}>
      {#each LOCALES as locale (locale)}
        <option value={locale}>{t(`language.${locale}`)}</option>
      {/each}
    </select>
  </label>
  <label class="field">
    <span>{t('settings.theme')}</span>
    <select data-testid="theme-select" value={themeState.preference} onchange={onThemeChange}>
      {#each THEME_PREFERENCES as preference (preference)}
        <option value={preference}>{t(`theme.${preference}`)}</option>
      {/each}
    </select>
  </label>
</header>

<style>
  .bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 6px 12px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .title {
    margin: 0 auto 0 0;
    font-size: 16px;
    font-weight: 600;
  }

  .field {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-text-muted);
  }

  select {
    font: inherit;
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 2px 6px;
  }

  select:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }
</style>
