<script lang="ts">
  import type { Board } from '../lib/core/board';
  import { i18n, t } from '../lib/i18n/i18n.svelte';

  interface Props {
    board: Board;
  }

  interface PanelItem {
    readonly key: string;
    readonly pluginId: string;
    readonly titleKey: string;
  }

  const { board }: Props = $props();
  let panels: readonly PanelItem[] = $state([]);

  $effect(() => {
    const update = () => {
      panels = board.panels.list().map((panel) => ({
        key: panel.key,
        pluginId: panel.pluginId,
        titleKey: panel.definition.titleKey,
      }));
    };
    update();
    return board.panels.changed.subscribe(update);
  });

  /** Mounts a plugin panel (WAR-12); it is built again when the interface language changes. */
  function mountPanel(element: HTMLElement, key: string): () => void {
    void i18n.locale;
    return board.mountPanel(key, element);
  }
</script>

<section class="panels" aria-label={t('panels.label')} data-testid="plugin-panels">
  {#each panels as panel (panel.key)}
    <div class="panel" data-panel={panel.key}>
      <h2>{t(`${panel.pluginId}.${panel.titleKey}`)}</h2>
      <div class="content" {@attach (element) => mountPanel(element, panel.key)}></div>
    </div>
  {/each}
</section>

<style>
  .panels {
    border-top: 1px solid var(--color-border);
  }

  h2 {
    margin: 0;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 600;
  }

  .content {
    padding: 0 8px 8px;
  }
</style>
