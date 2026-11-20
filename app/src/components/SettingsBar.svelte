<script lang="ts">
  import type { Board } from '../lib/core/board';
  import { clampHistoryLimit, MAX_HISTORY_LIMIT, MIN_HISTORY_LIMIT } from '../lib/core/history';
  import { i18n, t } from '../lib/i18n/i18n.svelte';
  import { isLocale, LOCALES } from '../lib/i18n/core';
  import { saveHistoryLimit } from '../lib/settings/history-limit';
  import { savePenDisablesFingerDrawing } from '../lib/settings/input';
  import { themeState } from '../lib/theme/theme.svelte';
  import { isThemePreference, THEME_PREFERENCES } from '../lib/theme/tokens';
  import HistoryButtons from './HistoryButtons.svelte';
  import ToolBar from './ToolBar.svelte';

  interface Props {
    board: Board;
  }

  const { board }: Props = $props();
  let historyLimit = $state(0);
  let penDisablesFinger = $derived(board.input.settings.penDisablesFingerDrawing);

  /** D4: switch of finger drawing after the first use of the pen, remembered on this device. */
  function onPenDisablesFingerChange(event: Event) {
    const value = (event.currentTarget as HTMLInputElement).checked;
    board.input.settings.penDisablesFingerDrawing = value;
    savePenDisablesFingerDrawing(value);
    penDisablesFinger = value;
  }

  $effect(() => {
    const update = () => {
      historyLimit = board.history.limit;
    };
    update();
    return board.history.changed.subscribe(update);
  });

  /** DAN-03 K2, D6: number of undo steps, 10–500, remembered on this device. */
  function onHistoryLimitChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const limit = clampHistoryLimit(Number(input.value));
    board.history.setLimit(limit);
    saveHistoryLimit(limit);
    input.value = String(limit);
  }

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
  <ToolBar {board} />
  <HistoryButtons {board} />
  <label class="field" title={t('settings.penDisablesFingerHint')}>
    <input
      type="checkbox"
      data-testid="pen-disables-finger"
      checked={penDisablesFinger}
      onchange={onPenDisablesFingerChange}
    />
    <span>{t('settings.penDisablesFinger')}</span>
  </label>
  <label
    class="field"
    title={t('settings.historyLimitHint', { min: MIN_HISTORY_LIMIT, max: MAX_HISTORY_LIMIT })}
  >
    <span>{t('settings.historyLimit')}</span>
    <input
      type="number"
      data-testid="history-limit"
      min={MIN_HISTORY_LIMIT}
      max={MAX_HISTORY_LIMIT}
      step="1"
      value={historyLimit}
      onchange={onHistoryLimitChange}
    />
  </label>
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

  input[type='number'] {
    width: 64px;
  }

  input[type='checkbox'] {
    accent-color: var(--color-accent);
  }

  select,
  input {
    font: inherit;
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 2px 6px;
  }

  select:focus-visible,
  input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }
</style>
