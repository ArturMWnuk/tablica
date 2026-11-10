// Drawing layer plugin (skeleton, step 1.2). Tools come in steps 1.4, 1.6 and 1.7 (RYS-01–14).
import { defineLayerPlugin } from '@tablica/plugin-api';

/** Layer data; filled with strokes and shapes in step 1.4. */
export type DrawingData = Record<string, never>;

export default defineLayerPlugin<DrawingData>({
  schemaVersion: 1,
  createData: () => ({}),
  serialize: () => ({}),
  deserialize: () => ({}),
  mountLayer(layer) {
    // Canvas 2D with a low-latency context (ADR-007).
    const canvas = document.createElement('canvas');
    canvas.className = 'drawing-canvas';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    layer.container.append(canvas);
    const context = canvas.getContext('2d', { desynchronized: true });
    return {
      render() {
        const ratio = globalThis.devicePixelRatio || 1;
        const width = Math.round(layer.container.clientWidth * ratio);
        const height = Math.round(layer.container.clientHeight * ratio);
        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;
        context?.clearRect(0, 0, canvas.width, canvas.height);
      },
      unmount() {
        canvas.remove();
      },
    };
  },
});
