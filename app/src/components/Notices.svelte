<script lang="ts">
  import type { Board } from '../lib/core/board';
  import type { Notice } from '../lib/core/notices';
  import { layerTitle, t } from '../lib/i18n/i18n.svelte';

  interface Props {
    board: Board;
  }

  const { board }: Props = $props();
  let notices: readonly Notice[] = $state([]);

  $effect(() => {
    notices = board.notices.list;
    return board.notices.changed.subscribe(() => {
      notices = board.notices.list;
    });
  });
</script>

{#if notices.length > 0}
  <section class="notices" aria-label={t('notice.region')} data-testid="notices">
    {#each notices as notice (notice.id)}
      <div class="notice" role="alert" data-notice={notice.key}>
        <p>
          {t(notice.key, {
            ...notice.params,
            name: layerTitle(notice.pluginId, Number(notice.params['number'] ?? 0)),
          })}
        </p>
        <button
          type="button"
          aria-label={t('notice.dismiss')}
          title={t('notice.dismiss')}
          onclick={() => board.notices.dismiss(notice.id)}>×</button
        >
      </div>
    {/each}
  </section>
{/if}

<style>
  .notices {
    position: absolute;
    right: 12px;
    bottom: 12px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: min(420px, calc(100% - 24px));
  }

  .notice {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--color-accent);
    border-radius: 4px;
  }

  p {
    margin: 0;
    flex: 1;
  }

  button {
    font: inherit;
    color: var(--color-text-muted);
    background: none;
    border: none;
    cursor: pointer;
  }

  button:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }
</style>
