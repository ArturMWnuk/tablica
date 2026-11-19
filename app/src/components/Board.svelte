<script lang="ts">
  import type { Board } from '../lib/core/board';
  import { TapGestureRecognizer, type TouchSample } from '../lib/core/tap-gesture';
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

  // D3: a tap with two fingers undoes, with three fingers redoes (DAN-03 K1).
  const taps = new TapGestureRecognizer((fingers) => board.handleTap(fingers));

  function onTouch(type: TouchSample['type'], event: PointerEvent) {
    if (event.pointerType !== 'touch') return;
    taps.handle({
      type,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
    });
  }

  /** Text fields keep their own Ctrl+Z (undo of typing), not the board history. */
  function isTextField(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable || target instanceof HTMLTextAreaElement) return true;
    return (
      target instanceof HTMLInputElement &&
      !['range', 'checkbox', 'radio', 'button', 'color'].includes(target.type)
    );
  }

  function onKeyDown(event: KeyboardEvent) {
    if (isTextField(event.target)) return;
    if (board.handleKey(event)) event.preventDefault();
  }
</script>

<svelte:window onkeydown={onKeyDown} />

<main
  class="board"
  data-testid="board"
  aria-label={t('board.label')}
  bind:this={element}
  onpointerdown={(event) => onTouch('down', event)}
  onpointermove={(event) => onTouch('move', event)}
  onpointerup={(event) => onTouch('up', event)}
  onpointercancel={(event) => onTouch('cancel', event)}
></main>

<style>
  .board {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: var(--color-board);
    touch-action: none;
  }
</style>
