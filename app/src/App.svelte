<script lang="ts">
  import Board from './components/Board.svelte';
  import SettingsBar from './components/SettingsBar.svelte';
  import { i18n, t } from './lib/i18n/i18n.svelte';
  import { applyTheme, themeState } from './lib/theme/theme.svelte';

  $effect(() => themeState.watchSystem());

  $effect(() => {
    applyTheme(document.documentElement, themeState.theme);
  });

  $effect(() => {
    document.documentElement.lang = i18n.locale;
    document.title = t('app.title');
  });
</script>

<div class="layout">
  <SettingsBar />
  <Board />
</div>

<style>
  .layout {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>
