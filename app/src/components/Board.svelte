<script lang="ts">
  import type { Board } from '../lib/core/board';
  import { toInputEvent } from '../lib/core/input-router';
  import { t } from '../lib/i18n/i18n.svelte';
  import { isControl, isTextField, releasePointerFocus } from '../lib/ui/focus';

  interface Props {
    board: Board;
  }

  const { board }: Props = $props();
  let element: HTMLElement | undefined = $state();
  let panReady = $state(false);

  // Layer stack (WAR-01): one container per layer, all sharing the board camera.
  $effect(() => {
    if (!element) return;
    board.attach(element);
    return () => board.detach();
  });

  // WEJ-04 K1: the wheel scrolls and Ctrl + wheel zooms. Registered as a non-passive listener so
  // the page itself does not scroll or zoom.
  $effect(() => {
    const target = element;
    if (!target) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const box = target.getBoundingClientRect();
      board.input.wheel({
        x: event.clientX - box.left,
        y: event.clientY - box.top,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaMode: event.deltaMode,
        ctrlKey: event.ctrlKey,
      });
    };
    target.addEventListener('wheel', onWheel, { passive: false });
    return () => target.removeEventListener('wheel', onWheel);
  });

  function input(event: PointerEvent) {
    const box = (element ?? (event.currentTarget as HTMLElement)).getBoundingClientRect();
    return toInputEvent(event, { x: box.left, y: box.top });
  }

  function onPointerDown(event: PointerEvent) {
    if (!board.input.pointerDown(input(event))) return;
    event.preventDefault();
    try {
      element?.setPointerCapture(event.pointerId);
    } catch {
      // The pointer may already be gone.
    }
  }

  // Text fields keep their own Ctrl+Z (undo of typing); Space activates focused controls and
  // moves the view only elsewhere (WEJ-04 K1).
  function onKeyDown(event: KeyboardEvent) {
    if (isTextField(event.target)) return;
    if (!isControl(event.target) && board.input.keyDown(event)) {
      event.preventDefault();
      panReady = board.input.panKeyHeld;
      return;
    }
    if (board.handleKey(event)) event.preventDefault();
  }

  function onKeyUp(event: KeyboardEvent) {
    if (board.input.keyUp(event)) panReady = board.input.panKeyHeld;
  }

  function onBlur() {
    board.input.blur();
    panReady = false;
  }
</script>

<svelte:window
  onkeydown={onKeyDown}
  onkeyup={onKeyUp}
  onblur={onBlur}
  onclick={releasePointerFocus}
/>

<main
  class="board"
  class:pan-ready={panReady}
  data-testid="board"
  aria-label={t('board.label')}
  bind:this={element}
  onpointerdown={onPointerDown}
  onpointermove={(event) => board.input.pointerMove(input(event))}
  onpointerup={(event) => board.input.pointerUp(input(event))}
  onpointercancel={(event) => board.input.pointerCancel(input(event))}
  onpointerleave={(event) => board.input.pointerLeave(event)}
  onauxclick={(event) => event.preventDefault()}
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
    cursor: crosshair;
  }

  .board.pan-ready {
    cursor: grab;
  }
</style>
