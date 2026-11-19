// Layer host (WAR-01, ADR-007): a stack of DOM containers, one per layer, in document order
// (bottom to top), all drawn with the same camera. Each plugin renders only inside its own
// container (WAR-06).
import type { LayerView } from '@tablica/plugin-api';
import type { Board } from './board';
import type { LayerRecord } from './document';

interface Slot {
  readonly element: HTMLElement;
  view: LayerView | undefined;
}

export class LayerHost {
  private slots = new Map<string, Slot>();
  private unsubscribe: Array<() => void>;
  private syncing = false;
  private syncAgain = false;

  constructor(
    private readonly board: Board,
    private readonly root: HTMLElement,
  ) {
    if (getComputedStyle(root).position === 'static') root.style.position = 'relative';
    this.unsubscribe = [
      board.document.changed.subscribe(() => this.sync()),
      board.camera.changed.subscribe(() => this.renderAll()),
    ];
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => this.renderAll());
      observer.observe(root);
      this.unsubscribe.push(() => observer.disconnect());
    }
    this.sync();
  }

  /** Brings containers in line with the document: order, status, mounted views. */
  sync(): void {
    if (this.syncing) {
      this.syncAgain = true;
      return;
    }
    this.syncing = true;
    try {
      do {
        this.syncAgain = false;
        this.syncOnce();
      } while (this.syncAgain);
    } finally {
      this.syncing = false;
    }
  }

  private syncOnce(): void {
    const layers = this.board.document.layers;
    const present = new Set(layers.map((record) => record.id));
    for (const [id, slot] of this.slots) {
      if (!present.has(id)) {
        this.unmount(slot);
        slot.element.remove();
        this.slots.delete(id);
      }
    }
    layers.forEach((record, index) => {
      const slot = this.slotFor(record);
      slot.element.style.zIndex = String(index);
      slot.element.dataset['status'] = record.status;
      // DOM order equals rendering order. Elements are moved only when needed, because moving
      // a node reloads embedded frames and media.
      const current = this.root.children.item(index);
      if (current !== slot.element) this.root.insertBefore(slot.element, current);
      // WAR-05: opacity of the whole layer; WAR-02: a hidden layer is not displayed.
      slot.element.style.opacity = String(record.opacity);
      const shown = slot.element.hidden && record.visible;
      slot.element.hidden = !record.visible;
      slot.element.style.display = record.visible ? '' : 'none';
      slot.element.dataset['locked'] = String(record.locked);
      if (record.status === 'ready' && !slot.view) this.mount(record, slot);
      else if (shown) this.render(record.id);
      if (record.status !== 'ready' && slot.view) this.unmount(slot);
    });
  }

  private slotFor(record: LayerRecord): Slot {
    let slot = this.slots.get(record.id);
    if (!slot) {
      const element = document.createElement('div');
      element.className = 'layer';
      element.dataset['layerId'] = record.id;
      element.dataset['pluginId'] = record.pluginId;
      element.style.position = 'absolute';
      element.style.inset = '0';
      element.style.overflow = 'hidden';
      slot = { element, view: undefined };
      this.slots.set(record.id, slot);
    }
    return slot;
  }

  private mount(record: LayerRecord, slot: Slot): void {
    const plugin = this.board.pluginOf(record);
    if (!plugin) return;
    try {
      slot.view = plugin.mountLayer(this.board.layerContext(record, slot.element));
      if (record.visible) slot.view.render();
    } catch (error) {
      this.board.breakLayer(record, error);
    }
  }

  private unmount(slot: Slot): void {
    const view = slot.view;
    slot.view = undefined;
    try {
      view?.unmount?.();
    } catch (error) {
      console.error('Layer unmount failed', error);
    }
    slot.element.replaceChildren();
  }

  /**
   * Redraws one layer; an error marks only that layer as broken. A hidden layer is not rendered
   * (WAR-02 K1); it is redrawn when it is shown again.
   */
  render(layerId: string): void {
    const view = this.slots.get(layerId)?.view;
    const record = this.board.document.getLayer(layerId);
    if (!view || !record || !record.visible) return;
    try {
      view.render();
    } catch (error) {
      this.board.breakLayer(record, error);
    }
  }

  renderAll(): void {
    for (const id of [...this.slots.keys()]) this.render(id);
  }

  /** Container of a layer (for tests and the interface). */
  container(layerId: string): HTMLElement | undefined {
    return this.slots.get(layerId)?.element;
  }

  destroy(): void {
    for (const off of this.unsubscribe) off();
    for (const slot of this.slots.values()) {
      this.unmount(slot);
      slot.element.remove();
    }
    this.slots.clear();
  }
}
