<script lang="ts">
  import type { LayerStatus } from '@tablica/plugin-api';
  import type { Board } from '../lib/core/board';
  import { layerName, t } from '../lib/i18n/i18n.svelte';

  interface Props {
    board: Board;
  }

  interface Row {
    readonly id: string;
    readonly pluginId: string;
    readonly status: LayerStatus;
    readonly visible: boolean;
    readonly locked: boolean;
    /** Opacity in percent (WAR-05 K1). */
    readonly percent: number;
    /** Position from the bottom of the document. */
    readonly index: number;
    /** Number among layers of the same type, from the bottom; 0 when the type occurs once. */
    readonly number: number;
  }

  interface Drag {
    readonly id: string;
    readonly pointerId: number;
    /** Position in the panel (top first) where the layer would land. */
    target: number;
  }

  const TITLE_ID = 'layers-title';
  const { board }: Props = $props();
  let rows: readonly Row[] = $state([]);
  let activeId: string | undefined = $state();
  let drag: Drag | undefined = $state();
  let list: HTMLOListElement | undefined = $state();
  /** Layer types (plugin ids) that can be added. */
  let types: readonly string[] = $state([]);
  let newType = $state('');

  // The panel lists layers from the top to the bottom, like the stack seen on the board.
  function snapshot(): void {
    const layers = board.document.layers;
    const counts: Record<string, number> = {};
    for (const layer of layers) counts[layer.pluginId] = (counts[layer.pluginId] ?? 0) + 1;
    const seen: Record<string, number> = {};
    const result = layers.map((layer, index) => {
      const number = (seen[layer.pluginId] ?? 0) + 1;
      seen[layer.pluginId] = number;
      return {
        id: layer.id,
        pluginId: layer.pluginId,
        status: layer.status,
        visible: layer.visible,
        locked: layer.locked,
        percent: Math.round(layer.opacity * 100),
        index,
        number: (counts[layer.pluginId] ?? 0) > 1 ? number : 0,
      };
    });
    rows = result.reverse();
    activeId = board.document.activeLayerId;
    types = board.plugins
      .list()
      .filter((entry) => entry.state !== 'broken')
      .map((entry) => entry.manifest.id);
    if (!types.includes(newType)) newType = types[0] ?? '';
  }

  /** P17 b: a new layer goes above the active layer (on top when none is active). */
  function addLayer(): void {
    if (!newType) return;
    const active = activeId === undefined ? -1 : board.document.indexOf(activeId);
    const index = active < 0 ? board.document.layers.length : active + 1;
    void board.addLayer(newType, index);
  }

  $effect(() => {
    snapshot();
    return board.document.changed.subscribe(snapshot);
  });

  function nameOf(row: Row): string {
    const name = layerName(row.pluginId);
    return row.number > 0 ? t('layers.numbered', { name, number: row.number }) : name;
  }

  /** WAR-04 K1: moves a layer one place up (towards the top of the stack) or down. */
  function step(row: Row, delta: 1 | -1): void {
    board.moveLayer(row.id, row.index + delta);
  }

  function onOpacityInput(row: Row, event: Event): void {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    // Changes while the slider moves form one undo step (merged in the history).
    board.setLayerOpacity(row.id, value / 100, { merge: true });
  }

  /** Panel position (top first) where the dragged layer lands for a pointer at `clientY`. */
  function targetAt(id: string, clientY: number): number {
    const items = [...(list?.children ?? [])] as HTMLElement[];
    let target = 0;
    for (const item of items) {
      if (item.dataset['layerId'] === id) continue;
      const box = item.getBoundingClientRect();
      if (clientY > box.top + box.height / 2) target += 1;
    }
    return target;
  }

  function onDragStart(row: Row, event: PointerEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    drag = { id: row.id, pointerId: event.pointerId, target: rows.indexOf(row) };
  }

  function onDragMove(event: PointerEvent): void {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.target = targetAt(drag.id, event.clientY);
  }

  function onDragEnd(event: PointerEvent): void {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const { id } = drag;
    const target = targetAt(id, event.clientY);
    drag = undefined;
    // Panel position `target` (top first) is document position `count - 1 - target`.
    board.moveLayer(id, rows.length - 1 - target);
  }

  function onDragCancel(event: PointerEvent): void {
    if (drag && event.pointerId === drag.pointerId) drag = undefined;
  }
</script>

<aside class="panel" data-testid="layers-panel" aria-labelledby={TITLE_ID}>
  <h2 id={TITLE_ID}>{t('layers.title')}</h2>
  <ol bind:this={list}>
    {#each rows as row, position (row.id)}
      {@const name = nameOf(row)}
      <li
        data-layer-id={row.id}
        data-plugin-id={row.pluginId}
        class:active={row.id === activeId}
        class:dragging={drag?.id === row.id}
        class:drop-target={drag !== undefined && drag.id !== row.id && drag.target === position}
      >
        <div class="line">
          <button
            type="button"
            class="handle"
            data-testid="layer-drag"
            aria-label={t('layers.drag', { name })}
            title={t('layers.drag', { name })}
            onpointerdown={(event) => onDragStart(row, event)}
            onpointermove={onDragMove}
            onpointerup={onDragEnd}
            onpointercancel={onDragCancel}
          >
            <svg viewBox="0 0 24 24" aria-hidden={true}
              ><path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" /></svg
            >
          </button>
          <button
            type="button"
            class="name"
            data-testid="layer-select"
            aria-pressed={row.id === activeId}
            aria-label={t('layers.select', { name })}
            onclick={() => board.document.setActiveLayer(row.id)}
          >
            {name}
            {#if row.status !== 'ready'}
              <span class="status">{t(`layers.status.${row.status}`)}</span>
            {/if}
          </button>
          <button
            type="button"
            class="toggle"
            data-testid="layer-visible"
            aria-pressed={row.visible}
            aria-label={t('layers.visible', { name })}
            title={t('layers.visible', { name })}
            onclick={() => board.setLayerVisible(row.id, !row.visible)}
          >
            {#if row.visible}
              <svg viewBox="0 0 24 24" aria-hidden={true}
                ><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle
                  cx="12"
                  cy="12"
                  r="3"
                /></svg
              >
            {:else}
              <svg viewBox="0 0 24 24" aria-hidden={true}
                ><path
                  d="M2 12s3.5-7 10-7c2 0 3.7.6 5.1 1.5M22 12s-3.5 7-10 7c-2 0-3.7-.6-5.1-1.5M3 3l18 18"
                /></svg
              >
            {/if}
          </button>
          <button
            type="button"
            class="toggle"
            data-testid="layer-locked"
            aria-pressed={row.locked}
            aria-label={t('layers.locked', { name })}
            title={t('layers.locked', { name })}
            onclick={() => board.setLayerLocked(row.id, !row.locked)}
          >
            {#if row.locked}
              <svg viewBox="0 0 24 24" aria-hidden={true}
                ><rect x="5" y="11" width="14" height="10" rx="2" /><path
                  d="M8 11V7a4 4 0 0 1 8 0v4"
                /></svg
              >
            {:else}
              <svg viewBox="0 0 24 24" aria-hidden={true}
                ><rect x="5" y="11" width="14" height="10" rx="2" /><path
                  d="M8 11V7a4 4 0 0 1 7.5-2"
                /></svg
              >
            {/if}
          </button>
          <button
            type="button"
            class="remove"
            data-testid="layer-remove"
            disabled={row.locked || rows.length <= 1}
            aria-label={t('layers.remove', { name })}
            title={t('layers.remove', { name })}
            onclick={() => board.removeLayer(row.id)}
          >
            <svg viewBox="0 0 24 24" aria-hidden={true}
              ><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg
            >
          </button>
        </div>
        <div class="line">
          <button
            type="button"
            class="move"
            data-testid="layer-up"
            disabled={position === 0}
            aria-label={t('layers.moveUp', { name })}
            title={t('layers.moveUp', { name })}
            onclick={() => step(row, 1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden={true}><path d="m6 15 6-6 6 6" /></svg>
          </button>
          <button
            type="button"
            class="move"
            data-testid="layer-down"
            disabled={position === rows.length - 1}
            aria-label={t('layers.moveDown', { name })}
            title={t('layers.moveDown', { name })}
            onclick={() => step(row, -1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden={true}><path d="m6 9 6 6 6-6" /></svg>
          </button>
          <input
            type="range"
            data-testid="layer-opacity"
            min="0"
            max="100"
            step="5"
            value={row.percent}
            aria-label={t('layers.opacity', { name })}
            aria-valuetext={t('layers.percent', { value: row.percent })}
            title={t('layers.opacity', { name })}
            oninput={(event) => onOpacityInput(row, event)}
            onchange={() => board.history.seal()}
          />
          <output data-testid="layer-opacity-value">
            {t('layers.percent', { value: row.percent })}
          </output>
        </div>
      </li>
    {/each}
  </ol>
  <div class="add">
    <select
      data-testid="layer-add-type"
      aria-label={t('layers.addType')}
      title={t('layers.addType')}
      bind:value={newType}
    >
      {#each types as type (type)}
        <option value={type}>{layerName(type)}</option>
      {/each}
    </select>
    <button
      type="button"
      class="add-button"
      data-testid="layer-add"
      disabled={!newType}
      onclick={addLayer}
    >
      <svg viewBox="0 0 24 24" aria-hidden={true}><path d="M12 5v14M5 12h14" /></svg>
      {t('layers.add')}
    </button>
  </div>
</aside>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    width: 260px;
    min-height: 0;
    overflow-y: auto;
    background: var(--color-surface);
    border-left: 1px solid var(--color-border);
  }

  .add {
    display: flex;
    gap: 4px;
    padding: 0 8px 8px;
  }

  .add select {
    flex: 1;
    min-width: 0;
    font: inherit;
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
  }

  .add-button {
    gap: 4px;
    border-color: var(--color-border);
  }

  h2 {
    margin: 0;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 600;
  }

  ol {
    margin: 0;
    padding: 0 8px 8px;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  li {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
  }

  li.active {
    border-color: var(--color-accent);
  }

  li.dragging {
    opacity: 0.6;
  }

  li.drop-target {
    box-shadow: 0 -3px 0 var(--color-accent);
  }

  .line {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 4px;
    font: inherit;
    color: var(--color-text);
    background: none;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    color: var(--color-text-muted);
    opacity: 0.4;
    cursor: default;
  }

  button:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }

  .handle {
    cursor: grab;
    touch-action: none;
  }

  .name {
    flex: 1;
    justify-content: flex-start;
    gap: 6px;
    overflow: hidden;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .status {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .toggle[aria-pressed='false'] {
    color: var(--color-text-muted);
  }

  input[type='range'] {
    flex: 1;
    min-width: 0;
    accent-color: var(--color-accent);
  }

  output {
    min-width: 44px;
    font-size: 12px;
    text-align: right;
    color: var(--color-text-muted);
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
