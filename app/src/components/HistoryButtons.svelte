<script lang="ts">
  import type { Board } from '../lib/core/board';
  import { t } from '../lib/i18n/i18n.svelte';

  interface Props {
    board: Board;
  }

  const { board }: Props = $props();
  let canUndo = $state(false);
  let canRedo = $state(false);

  // DAN-03 K1: undo and redo buttons, enabled only when there is something to undo or redo.
  $effect(() => {
    const update = () => {
      canUndo = board.history.canUndo;
      canRedo = board.history.canRedo;
    };
    update();
    return board.history.changed.subscribe(update);
  });
</script>

<div class="history">
  <button
    type="button"
    data-testid="undo"
    disabled={!canUndo}
    aria-label={t('history.undo')}
    title={t('history.undoHint')}
    onclick={() => board.undo()}
  >
    <svg viewBox="0 0 24 24" aria-hidden={true}
      ><path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg
    >
  </button>
  <button
    type="button"
    data-testid="redo"
    disabled={!canRedo}
    aria-label={t('history.redo')}
    title={t('history.redoHint')}
    onclick={() => board.redo()}
  >
    <svg viewBox="0 0 24 24" aria-hidden={true}
      ><path d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" /></svg
    >
  </button>
</div>

<style>
  .history {
    display: flex;
    gap: 4px;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    color: var(--color-text-muted);
    opacity: 0.5;
    cursor: default;
  }

  button:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }

  svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
