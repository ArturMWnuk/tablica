import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

// Pen and highlighter in the running interface: mouse use of every tool, images of strokes
// compared with a pattern, and the drawing latency (WEJ-01, WEJ-04, RYS-01, RYS-02, NF-04).

const REFERENCE = join(dirname(fileURLToPath(import.meta.url)), 'reference', 'pen-stroke.png');

const board = (page: Page) => page.getByTestId('board');

async function openBoard(page: Page): Promise<void> {
  await page.goto('/');
  await expect(board(page).locator(':scope > .layer[data-status="ready"]')).toHaveCount(3);
  await expect(page.getByTestId('tool')).not.toHaveCount(0);
}

async function selectTool(page: Page, key: string): Promise<void> {
  const button = page.locator(`[data-testid="tool"][data-tool="${key}"]`);
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
}

/** Drags the mouse through board points (relative to the board's top-left corner). */
async function mouseStroke(page: Page, points: ReadonlyArray<readonly [number, number]>) {
  const box = await board(page).boundingBox();
  if (!box) throw new Error('Board not visible');
  const [first = [0, 0], ...rest] = points;
  await page.mouse.move(box.x + first[0], box.y + first[1]);
  await page.mouse.down();
  for (const [x, y] of rest) await page.mouse.move(box.x + x, box.y + y, { steps: 8 });
  await page.mouse.up();
}

/** RGBA of a pixel of the drawing canvas at a board point (CSS pixels). */
async function pixel(page: Page, x: number, y: number): Promise<number[]> {
  return board(page).evaluate(
    (element, [px, py]) => {
      const canvas = element.querySelector<HTMLCanvasElement>('canvas.drawing-canvas');
      const context = canvas?.getContext('2d');
      if (!canvas || !context) throw new Error('No drawing canvas');
      const ratio = canvas.width / element.clientWidth;
      return [...context.getImageData(Math.round(px * ratio), Math.round(py * ratio), 1, 1).data];
    },
    [x, y] as const,
  );
}

/** Synthetic pen events with pressure (as a pen of a tablet or of Windows Ink sends them). */
async function penStroke(
  page: Page,
  points: ReadonlyArray<readonly [number, number, number]>,
): Promise<void> {
  await board(page).evaluate((element, list) => {
    const box = element.getBoundingClientRect();
    const send = (type: string, [x, y, pressure]: readonly number[], buttons: number) =>
      element.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 41,
          pointerType: 'pen',
          isPrimary: true,
          clientX: box.left + (x ?? 0),
          clientY: box.top + (y ?? 0),
          pressure: buttons ? (pressure ?? 0.5) : 0,
          // A pen held upright (WebKit would otherwise report tiltX 90).
          tiltX: 0,
          tiltY: 0,
          buttons,
          button: type === 'pointermove' ? -1 : 0,
        }),
      );
    const [first, ...rest] = list;
    if (!first) return;
    send('pointerdown', first, 1);
    for (const point of rest) send('pointermove', point, 1);
    send('pointerup', list.at(-1) ?? first, 0);
  }, points);
}

/**
 * Ink mask of a board region: 1 where the drawing canvas is covered (alpha ≥ 50 %), drawn at
 * CSS pixel size so it does not depend on the screen density.
 */
async function inkMask(page: Page, region: readonly [number, number, number, number]) {
  return board(page).evaluate((element, [x, y, width, height]) => {
    const canvas = element.querySelector<HTMLCanvasElement>('canvas.drawing-canvas');
    if (!canvas) throw new Error('No drawing canvas');
    const ratio = canvas.width / element.clientWidth;
    const target = document.createElement('canvas');
    target.width = width;
    target.height = height;
    const context = target.getContext('2d');
    if (!context) throw new Error('No 2D context');
    context.drawImage(
      canvas,
      x * ratio,
      y * ratio,
      width * ratio,
      height * ratio,
      0,
      0,
      width,
      height,
    );
    const image = context.getImageData(0, 0, width, height);
    const mask = context.createImageData(width, height);
    for (let index = 0; index < image.data.length; index += 4) {
      const ink = (image.data[index + 3] ?? 0) >= 128;
      mask.data[index] = ink ? 0 : 255;
      mask.data[index + 1] = ink ? 0 : 255;
      mask.data[index + 2] = ink ? 0 : 255;
      mask.data[index + 3] = 255;
    }
    context.putImageData(mask, 0, 0);
    return target.toDataURL('image/png');
  }, region);
}

/** Intersection over union of the ink of two masks (PNG data URLs of the same size). */
async function maskSimilarity(page: Page, actual: string, expected: string): Promise<number> {
  return page.evaluate(
    async ([a, b]) => {
      const read = async (url: string) => {
        const image = new Image();
        image.src = url;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('No 2D context');
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, image.width, image.height);
      };
      const [first, second] = await Promise.all([read(a), read(b)]);
      if (first.width !== second.width || first.height !== second.height) return 0;
      let both = 0;
      let either = 0;
      for (let index = 0; index < first.data.length; index += 4) {
        const one = (first.data[index] ?? 255) < 128;
        const two = (second.data[index] ?? 255) < 128;
        if (one && two) both += 1;
        if (one || two) either += 1;
      }
      return either === 0 ? 0 : both / either;
    },
    [actual, expected] as const,
  );
}

test.describe('WEJ-04: every tool works with the mouse', () => {
  test('WEJ-04: each tool of the toolbar can be chosen and used with the mouse alone', async ({
    page,
  }) => {
    await openBoard(page);
    const keys = await page
      .getByTestId('tool')
      .evaluateAll((items) => items.map((item) => (item as HTMLElement).dataset['tool'] ?? ''));
    expect(keys).toEqual(['layer-drawing/pen', 'layer-drawing/highlighter']);
    // The pen is active when the program starts.
    await expect(page.locator('[data-tool="layer-drawing/pen"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    for (const [index, key] of keys.entries()) {
      await selectTool(page, key);
      const y = 120 + index * 80;
      await mouseStroke(page, [
        [100, y],
        [300, y],
      ]);
      expect((await pixel(page, 200, y))[3]).toBeGreaterThan(0);
    }
    await page.getByTestId('undo').click();
    await page.getByTestId('undo').click();
    expect((await pixel(page, 200, 120))[3]).toBe(0);
    await expect(page.getByTestId('undo')).toBeDisabled();
  });
});

test.describe('RYS-01: pen', () => {
  test('RYS-01: the colour and width chosen in the panel are used by the pen', async ({ page }) => {
    await openBoard(page);
    const panel = page.getByTestId('drawing-style-pen');
    await expect(panel.getByTestId('drawing-swatch')).toHaveCount(13);
    await panel.locator('[data-color="#e53935"]').click();
    await panel.locator('[data-width="16"]').click();
    await expect(panel.getByTestId('drawing-width-value')).toHaveText('16 px');
    await mouseStroke(page, [
      [100, 200],
      [300, 200],
    ]);
    const [r, g, b, a] = await pixel(page, 200, 200);
    expect([r, g, b, a]).toEqual([229, 57, 53, 255]);
    // Width 16 px: covered 6 px from the centre line, empty 12 px from it.
    expect((await pixel(page, 200, 206))[3]).toBe(255);
    expect((await pixel(page, 200, 212))[3]).toBe(0);
  });

  test('RYS-01: a smoothed pen stroke with pressure matches the pattern image', async ({
    page,
  }) => {
    await openBoard(page);
    await page.getByTestId('drawing-style-pen').locator('[data-width="10"]').click();
    // A wave from light to full pressure, sampled like a fast pen (every 6 px).
    const points = Array.from({ length: 51 }, (_, index) => {
      const x = 60 + index * 6;
      return [x, 150 + Math.sin(index / 5) * 40, 0.15 + (0.85 * index) / 50] as const;
    });
    await penStroke(page, points);
    const mask = await inkMask(page, [40, 90, 340, 120]);
    if (process.env['UPDATE_REFERENCE'] || !existsSync(REFERENCE)) {
      test.skip(!process.env['UPDATE_REFERENCE'], `Missing pattern ${REFERENCE}`);
      mkdirSync(dirname(REFERENCE), { recursive: true });
      writeFileSync(REFERENCE, Buffer.from(mask.split(',')[1] ?? '', 'base64'));
    }
    const expected = `data:image/png;base64,${readFileSync(REFERENCE).toString('base64')}`;
    expect(await maskSimilarity(page, mask, expected)).toBeGreaterThanOrEqual(0.9);
    // Pressure: the end of the stroke (full pressure) is much wider than the start (light).
    const [start, end] = await board(page).evaluate((element) => {
      const canvas = element.querySelector<HTMLCanvasElement>('canvas.drawing-canvas');
      const context = canvas?.getContext('2d');
      if (!canvas || !context) throw new Error('No drawing canvas');
      const ratio = canvas.width / element.clientWidth;
      const covered = (x: number) => {
        const column = context.getImageData(Math.round(x * ratio), 0, 1, canvas.height).data;
        let count = 0;
        for (let index = 3; index < column.length; index += 4) {
          if ((column[index] ?? 0) >= 128) count += 1;
        }
        return count / ratio;
      };
      return [covered(66), covered(357)];
    });
    expect(end).toBeGreaterThanOrEqual((start ?? 0) * 2);
  });

  test('WEJ-01: a pen event draws with the pen tool (synthetic pen input)', async ({ page }) => {
    await openBoard(page);
    await penStroke(page, [
      [100, 300, 0.5],
      [200, 300, 0.5],
    ]);
    expect((await pixel(page, 150, 300))[3]).toBe(255);
    await expect(page.getByTestId('undo')).toBeEnabled();
  });
});

test.describe('RYS-02: highlighter', () => {
  test('RYS-02: 40 % opacity and overlapping parts of one stroke do not get darker', async ({
    page,
  }) => {
    await openBoard(page);
    await selectTool(page, 'layer-drawing/highlighter');
    // One stroke that crosses itself at (150, 100).
    await mouseStroke(page, [
      [50, 100],
      [250, 100],
      [250, 160],
      [150, 160],
      [150, 40],
    ]);
    const single = await pixel(page, 210, 100);
    const crossing = await pixel(page, 150, 100);
    // Yellow #fdd835 at 40 % (alpha 102); canvas pixels are stored premultiplied, so the colour
    // read back may differ by a few units.
    for (const [index, value] of [253, 216, 53, 102].entries()) {
      expect(Math.abs((single[index] ?? 0) - value)).toBeLessThanOrEqual(3);
    }
    for (const [index, value] of crossing.entries()) {
      expect(Math.abs(value - (single[index] ?? 0))).toBeLessThanOrEqual(1);
    }
  });

  test('RYS-02: strokes under the highlighter stay readable (multiply blending)', async ({
    page,
  }) => {
    await openBoard(page);
    await page.getByTestId('drawing-style-pen').locator('[data-width="6"]').click();
    await mouseStroke(page, [
      [60, 300],
      [360, 300],
    ]);
    await selectTool(page, 'layer-drawing/highlighter');
    await mouseStroke(page, [
      [200, 240],
      [200, 360],
    ]);
    const [r = 255, g = 255, b = 255, a = 0] = await pixel(page, 200, 300);
    // Black ink multiplied by yellow stays black (a normal 40 % yellow on top would lighten it).
    expect(Math.max(r, g, b)).toBeLessThanOrEqual(10);
    expect(a).toBe(255);
    const [, , blue = 255, alpha = 0] = await pixel(page, 200, 330);
    expect(blue).toBeLessThan(100);
    expect(alpha).toBeLessThan(128);
  });
});

test.describe('NF-04: drawing latency', () => {
  test('NF-04: time from the pointer event to the drawn segment is at most 4 ms (p95)', async ({
    page,
  }) => {
    await openBoard(page);
    await page.evaluate(() => {
      const diagnostics = (globalThis as Record<string, unknown>)['tablicaDiagnostics'] as {
        latency: { reset(): void };
      };
      diagnostics.latency.reset();
    });
    // Pen events are dispatched in the page as the platform delivers them, so the measurement
    // covers the program's own path (input pipeline, tool, drawing) and not the scheduling of
    // the test driver's input. Latency on real devices is checked by hand (NF-04 K3: R10, R11).
    // Long strokes (up to 400 points) are the costly case: the live stroke is redrawn whole.
    await penStroke(
      page,
      Array.from({ length: 400 }, (_, step) => [
        40 + step,
        150 + Math.sin(step / 15) * 80,
        0.3 + 0.6 * Math.abs(Math.sin(step / 40)),
      ]),
    );
    const summary = await page.evaluate(() => {
      const diagnostics = (globalThis as Record<string, unknown>)['tablicaDiagnostics'] as {
        latency: { summary(): { count: number; p95: number } };
      };
      return diagnostics.latency.summary();
    });
    test.info().annotations.push({ type: 'latency', description: JSON.stringify(summary) });
    // The press and every move are measured (the lift draws nothing new).
    expect(summary.count).toBe(400);
    expect(summary.p95).toBeLessThanOrEqual(4);
  });
});
