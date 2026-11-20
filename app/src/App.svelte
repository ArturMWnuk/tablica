<script lang="ts">
  import Board from './components/Board.svelte';
  import LayersPanel from './components/LayersPanel.svelte';
  import Notices from './components/Notices.svelte';
  import PluginPanels from './components/PluginPanels.svelte';
  import SettingsBar from './components/SettingsBar.svelte';
  import type { Board as BoardModel } from './lib/core/board';
  import { i18n, t } from './lib/i18n/i18n.svelte';
  import { applyTheme, themeState } from './lib/theme/theme.svelte';

  interface Props {
    board: BoardModel;
  }

  const { board }: Props = $props();

  $effect(() => themeState.watchSystem());

  $effect(() => {
    applyTheme(document.documentElement, themeState.theme);
  });

  $effect(() => {
    document.documentElement.lang = i18n.locale;
    document.title = t('app.title');
    // Plugin texts are rendered by the plugins: redraw them in the new language.
    board.renderAll();
  });
</script>

<div class="layout">
  <SettingsBar {board} />
  <div class="workspace">
    <Board {board} />
    <div class="side">
      <LayersPanel {board} />
      <PluginPanels {board} />
    </div>
  </div>
  <Notices {board} />
</div>

<style>
  .layout {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .workspace {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .side {
    display: flex;
    flex-direction: column;
    width: 260px;
    min-height: 0;
    overflow-y: auto;
    background: var(--color-surface);
    border-left: 1px solid var(--color-border);
  }
</style>
