// Background layer plugin (skeleton, step 1.2). Background kinds come in step 1.8 (TLO-01, TLO-04–08);
// until then the board colour from the interface theme shows through the empty layer.
import { defineLayerPlugin } from '@tablica/plugin-api';

/** Layer data; filled with background settings in step 1.8. */
export type BackgroundData = Record<string, never>;

export default defineLayerPlugin<BackgroundData>({
  schemaVersion: 1,
  createData: () => ({}),
  serialize: () => ({}),
  deserialize: () => ({}),
  mountLayer(layer) {
    const surface = document.createElement('div');
    surface.className = 'background-surface';
    surface.style.position = 'absolute';
    surface.style.inset = '0';
    layer.container.append(surface);
    return {
      render() {
        // Nothing to draw yet.
      },
      unmount() {
        surface.remove();
      },
    };
  },
});
