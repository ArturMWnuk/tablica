import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

// The File menu in the running interface (DAN-01 K4) with the Tauri file commands answered from
// memory: Save writes the archive, New clears the board, Recent files opens it again; a damaged
// file gives a message (DAN-01 K3).

const board = (page: Page) => page.getByTestId('board');

/** Replaces the Tauri mock with one that keeps files and the recovery copy in memory. */
async function memoryFiles(page: Page, saveAnswers: string[]): Promise<void> {
  await page.addInitScript((answers: string[]) => {
    const files = new Map<string, Uint8Array>();
    const w = window as unknown as Record<string, unknown>;
    const internals = w['__TAURI_INTERNALS__'] as Record<string, unknown>;
    const calls = w['__TAURI_MOCK_CALLS__'] as Array<{ cmd: string; args: unknown }>;
    w['__FILES__'] = files;
    internals['invoke'] = (
      cmd: string,
      args: unknown,
      options?: { headers?: Record<string, string> },
    ) => {
      calls.push({ cmd, args });
      const header = (name: string) => decodeURIComponent(options?.headers?.[name] ?? '');
      switch (cmd) {
        case 'plugin:dialog|save':
        case 'plugin:dialog|open':
          return Promise.resolve(answers.shift() ?? null);
        case 'lesson_write':
          files.set(header('path'), new Uint8Array(args as Uint8Array));
          return Promise.resolve(null);
        case 'lesson_read': {
          const bytes = files.get((args as { path: string }).path);
          return bytes ? Promise.resolve(bytes.slice()) : Promise.reject(new Error('ENOENT'));
        }
        default:
          return Promise.resolve(cmd.startsWith('plugin:dialog|') ? true : null);
      }
    };
  }, saveAnswers);
}

async function openBoard(page: Page): Promise<void> {
  await page.goto('/');
  await expect(board(page).locator(':scope > .layer[data-status="ready"]')).toHaveCount(3);
  await expect(page.getByTestId('tool')).not.toHaveCount(0);
}

async function mouseStroke(page: Page, points: ReadonlyArray<readonly [number, number]>) {
  const box = await board(page).boundingBox();
  if (!box) throw new Error('Board not visible');
  const [first = [0, 0], ...rest] = points;
  await page.mouse.move(box.x + first[0], box.y + first[1]);
  await page.mouse.down();
  for (const [x, y] of rest) await page.mouse.move(box.x + x, box.y + y, { steps: 8 });
  await page.mouse.up();
}

/** Alpha of the drawing canvas at a board point: 0 where nothing is drawn. */
async function inkAt(page: Page, x: number, y: number): Promise<number> {
  return board(page).evaluate(
    (element, [px, py]) => {
      const canvas = element.querySelector<HTMLCanvasElement>('canvas.drawing-canvas');
      const context = canvas?.getContext('2d');
      if (!canvas || !context) throw new Error('No drawing canvas');
      const ratio = canvas.width / element.clientWidth;
      return context.getImageData(Math.round(px * ratio), Math.round(py * ratio), 1, 1).data[3]!;
    },
    [x, y] as const,
  );
}

test('DAN-01: Save, New and Recent files through the File menu keep the stroke', async ({
  page,
}) => {
  await memoryFiles(page, ['C:\\Lekcje\\Żółw']);
  await openBoard(page);
  await mouseStroke(page, [
    [100, 200],
    [300, 200],
  ]);
  await expect.poll(() => inkAt(page, 200, 200)).toBeGreaterThan(0);
  await expect(page.getByTestId('lesson-title')).toHaveAttribute('data-dirty', 'true');

  await page.keyboard.press('Control+s');
  await expect(page.getByTestId('lesson-title')).toHaveText('Żółw.tablica');
  await expect(page.getByTestId('lesson-title')).toHaveAttribute('data-dirty', 'false');
  const saved = await page.evaluate(() => [
    ...(window as unknown as { __FILES__: Map<string, Uint8Array> }).__FILES__.keys(),
  ]);
  expect(saved).toEqual(['C:\\Lekcje\\Żółw.tablica']);

  await page.getByTestId('file-menu').click();
  await page.getByTestId('file-new').click();
  await expect(page.getByTestId('lesson-title')).not.toHaveText('Żółw.tablica');
  await expect(board(page).locator(':scope > .layer[data-status="ready"]')).toHaveCount(3);
  await expect.poll(() => inkAt(page, 200, 200)).toBe(0);

  await page.getByTestId('file-menu').click();
  await page.getByTestId('recent-file').filter({ hasText: 'Żółw.tablica' }).click();
  await expect(page.getByTestId('lesson-title')).toHaveText('Żółw.tablica');
  await expect.poll(() => inkAt(page, 200, 200)).toBeGreaterThan(0);
  // The opened lesson starts with an empty history.
  await expect(page.getByTestId('undo')).toBeDisabled();
});

test('DAN-01: Ctrl+Shift+S, Ctrl+N and Ctrl+O run Save as, New and Open', async ({ page }) => {
  // Answers of the dialogs in order: Save as, then Open.
  await memoryFiles(page, ['/lekcje/druga.tablica', '/lekcje/druga.tablica']);
  await openBoard(page);
  await mouseStroke(page, [
    [100, 250],
    [300, 250],
  ]);
  await expect.poll(() => inkAt(page, 200, 250)).toBeGreaterThan(0);
  await page.keyboard.press('Control+Shift+s');
  await expect(page.getByTestId('lesson-title')).toHaveText('druga.tablica');
  await page.keyboard.press('Control+n');
  await expect(page.getByTestId('lesson-title')).not.toHaveText('druga.tablica');
  await expect.poll(() => inkAt(page, 200, 250)).toBe(0);
  await page.keyboard.press('Control+o');
  await expect(page.getByTestId('lesson-title')).toHaveText('druga.tablica');
  await expect.poll(() => inkAt(page, 200, 250)).toBeGreaterThan(0);
});

test('DAN-01: a damaged file gives a message and the board keeps working', async ({ page }) => {
  await memoryFiles(page, []);
  await page.addInitScript(() => {
    localStorage.setItem('tablica.recentFiles', JSON.stringify(['/zepsuty.tablica']));
  });
  await openBoard(page);
  await page.evaluate(() =>
    (window as unknown as { __FILES__: Map<string, Uint8Array> }).__FILES__.set(
      '/zepsuty.tablica',
      new TextEncoder().encode('this is not a lesson'),
    ),
  );
  await page.getByTestId('file-menu').click();
  await page.getByTestId('recent-file').click();
  await expect(page.locator('[data-notice="notice.fileCorrupt"]')).toContainText('zepsuty.tablica');
  await mouseStroke(page, [
    [100, 300],
    [300, 300],
  ]);
  await expect.poll(() => inkAt(page, 200, 300)).toBeGreaterThan(0);
});
