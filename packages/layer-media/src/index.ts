// Multimedia layer plugin (skeleton, step 1.2). Media elements come in steps 1.9 and 1.10 (MM-01–09).
import { defineLayerPlugin } from '@tablica/plugin-api';

/** Layer data; filled with media elements in step 1.9. */
export type MediaData = Record<string, never>;

export default defineLayerPlugin<MediaData>({
  schemaVersion: 1,
  createData: () => ({}),
  serialize: () => ({}),
  deserialize: () => ({}),
  mountLayer(layer) {
    // Media elements are DOM elements (ADR-007) placed in this element with the shared camera.
    const items = document.createElement('div');
    items.className = 'media-items';
    items.style.position = 'absolute';
    items.style.inset = '0';
    layer.container.append(items);
    return {
      render() {
        // Nothing to place yet.
      },
      unmount() {
        items.remove();
      },
    };
  },
});
