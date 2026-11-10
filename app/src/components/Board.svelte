<script lang="ts">
  import type { Board } from '../lib/core/board';
  import { t } from '../lib/i18n/i18n.svelte';

  interface Props {
    board: Board;
  }

  const { board }: Props = $props();
  let element: HTMLElement | undefined = $state();

  // Layer stack (WAR-01): one container per layer, all sharing the board camera.
  $effect(() => {
    if (!element) return;
    board.attach(element);
    return () => board.detach();
  });

  function onKeyDown(event: KeyboardEvent) {
    if (board.handleKey(event)) event.preventDefault();
  }
</script>

<svelte:window onkeydown={onKeyDown} />

<main class="board" data-testid="board" aria-label={t('board.label')} bind:this={element}></main>

<style>
  .board {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background: var(--color-board);
    touch-action: none;
  }
</style>
