import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

// Layer panel, undo/redo buttons, keys and gestures in the running interface
// (DAN-03, WAR-02, WAR-03, WAR-04, WAR-05).

const panel = (page: Page) => page.getByTestId('layers-panel');
const row = (page: Page, pluginId: string) =>
  panel(page).locator(`li[data-plugin-id="${pluginId}"]`);
const container = (page: Page, pluginId: string) =>
  page.getByTestId('board').locator(`:scope > .layer[data-plugin-id="${pluginId}"]`);

/** Plugin ids of the board layers from the bottom to the top. */
async function stack(page: Page): Promise<string[]> {
  return page
    .getByTestId('board')
    .locator(':scope > .layer')
    .evaluateAll((elements) =>
      elements.map((element) => (element as HTMLElement).dataset['pluginId'] ?? ''),
    );
}

/** Plugin ids of the panel rows from the top to the bottom. */
async function panelOrder(page: Page): Promise<string[]> {
  return panel(page)
    .locator('li')
    .evaluateAll((elements) =>
      elements.map((element) => (element as HTMLElement).dataset['pluginId'] ?? ''),
    );
}

async function openBoard(page: Page): Promise<void> {
  await page.goto('/');
  await expect(
    page.getByTestId('board').locator(':scope > .layer[data-status="ready"]'),
  ).toHaveCount(3);
}

test.describe('WAR-02, WAR-03: layer panel', () => {
  test('WAR-02: the panel lists the layers from the top and hides and shows a layer', async ({
    page,
  }) => {
    await openBoard(page);
    expect(await panelOrder(page)).toEqual(['layer-drawing', 'layer-media', 'layer-background']);
    const toggle = row(page, 'layer-drawing').getByTestId('layer-visible');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(container(page, 'layer-drawing')).toBeHidden();
    await toggle.click();
    await expect(container(page, 'layer-drawing')).toBeVisible();
  });

  test('WAR-03: the panel shows the lock state of a layer', async ({ page }) => {
    await openBoard(page);
    const toggle = row(page, 'layer-media').getByTestId('layer-locked');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(container(page, 'layer-media')).toHaveAttribute('data-locked', 'true');
    // Locking is a view setting: nothing to undo (D12).
    await expect(page.getByTestId('undo')).toBeDisabled();
  });
});

test.describe('WAR-04: layer order in the panel', () => {
  test('WAR-04: buttons move a layer up and down and change the rendering order', async ({
    page,
  }) => {
    await openBoard(page);
    await expect(row(page, 'layer-drawing').getByTestId('layer-up')).toBeDisabled();
    await expect(row(page, 'layer-background').getByTestId('layer-down')).toBeDisabled();
    await row(page, 'layer-drawing').getByTestId('layer-down').click();
    expect(await stack(page)).toEqual(['layer-background', 'layer-drawing', 'layer-media']);
    await row(page, 'layer-background').getByTestId('layer-up').click();
    expect(await stack(page)).toEqual(['layer-drawing', 'layer-background', 'layer-media']);
    expect(await panelOrder(page)).toEqual(['layer-media', 'layer-background', 'layer-drawing']);
  });

  test('WAR-04: dragging a layer in the panel changes the rendering order', async ({ page }) => {
    await openBoard(page);
    const handle = row(page, 'layer-background').getByTestId('layer-drag');
    const from = await handle.boundingBox();
    const top = await row(page, 'layer-drawing').boundingBox();
    if (!from || !top) throw new Error('Panel is not laid out');
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(from.x + from.width / 2, top.y + 4, { steps: 8 });
    await page.mouse.up();
    await expect
      .poll(() => stack(page))
      .toEqual(['layer-media', 'layer-drawing', 'layer-background']);
    expect(await panelOrder(page)).toEqual(['layer-background', 'layer-drawing', 'layer-media']);
  });

  test('WAR-04: a change of order is undone with the undo button (D12)', async ({ page }) => {
    await openBoard(page);
    await row(page, 'layer-drawing').getByTestId('layer-down').click();
    await page.getByTestId('undo').click();
    expect(await stack(page)).toEqual(['layer-background', 'layer-media', 'layer-drawing']);
    await page.getByTestId('redo').click();
    expect(await stack(page)).toEqual(['layer-background', 'layer-drawing', 'layer-media']);
  });
});

test.describe('WAR-05: layer opacity', () => {
  test('WAR-05: the slider changes the opacity of the whole layer in steps of 5 %', async ({
    page,
  }) => {
    await openBoard(page);
    const slider = row(page, 'layer-drawing').getByTestId('layer-opacity');
    await expect(slider).toHaveAttribute('min', '0');
    await expect(slider).toHaveAttribute('max', '100');
    await expect(slider).toHaveAttribute('step', '5');
    await slider.focus();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(row(page, 'layer-drawing').getByTestId('layer-opacity-value')).toHaveText('85 %');
    await expect(container(page, 'layer-drawing')).toHaveCSS('opacity', '0.85');
    await page.keyboard.press('Home');
    await expect(container(page, 'layer-drawing')).toHaveCSS('opacity', '0');
  });

  test('WAR-05: a change of opacity is undone and redone (D12)', async ({ page }) => {
    await openBoard(page);
    await row(page, 'layer-media').getByTestId('layer-opacity').fill('40');
    await expect(container(page, 'layer-media')).toHaveCSS('opacity', '0.4');
    await page.getByTestId('undo').click();
    await expect(container(page, 'layer-media')).toHaveCSS('opacity', '1');
    await page.getByTestId('redo').click();
    await expect(container(page, 'layer-media')).toHaveCSS('opacity', '0.4');
  });
});

test.describe('DAN-03: undo and redo in the interface', () => {
  test('DAN-03: buttons are enabled only when there is something to undo or redo', async ({
    page,
  }) => {
    await openBoard(page);
    await expect(page.getByTestId('undo')).toBeDisabled();
    await expect(page.getByTestId('redo')).toBeDisabled();
    await row(page, 'layer-drawing').getByTestId('layer-down').click();
    await expect(page.getByTestId('undo')).toBeEnabled();
    await page.getByTestId('undo').click();
    await expect(page.getByTestId('undo')).toBeDisabled();
    await expect(page.getByTestId('redo')).toBeEnabled();
  });

  test('DAN-03: Ctrl+Z undoes, Ctrl+Y and Ctrl+Shift+Z redo', async ({ page }) => {
    await openBoard(page);
    await row(page, 'layer-drawing').getByTestId('layer-down').click();
    await row(page, 'layer-drawing').getByTestId('layer-down').click();
    expect(await stack(page)).toEqual(['layer-drawing', 'layer-background', 'layer-media']);
    await page.keyboard.press('Control+z');
    await page.keyboard.press('Control+z');
    await expect
      .poll(() => stack(page))
      .toEqual(['layer-background', 'layer-media', 'layer-drawing']);
    await page.keyboard.press('Control+y');
    await expect
      .poll(() => stack(page))
      .toEqual(['layer-background', 'layer-drawing', 'layer-media']);
    await page.keyboard.press('Control+Shift+z');
    await expect
      .poll(() => stack(page))
      .toEqual(['layer-drawing', 'layer-background', 'layer-media']);
  });

  test('DAN-03: a tap with two fingers undoes and with three fingers redoes (D3)', async ({
    page,
  }) => {
    await openBoard(page);
    await row(page, 'layer-drawing').getByTestId('layer-down').click();
    const tap = (fingers: number) =>
      page.getByTestId('board').evaluate((board, count) => {
        const box = board.getBoundingClientRect();
        const send = (type: string, id: number) =>
          board.dispatchEvent(
            new PointerEvent(type, {
              bubbles: true,
              pointerType: 'touch',
              pointerId: 100 + id,
              isPrimary: id === 0,
              clientX: box.left + 50 + id * 40,
              clientY: box.top + 50,
            }),
          );
        for (let id = 0; id < count; id += 1) send('pointerdown', id);
        for (let id = 0; id < count; id += 1) send('pointerup', id);
      }, fingers);
    await tap(2);
    await expect
      .poll(() => stack(page))
      .toEqual(['layer-background', 'layer-media', 'layer-drawing']);
    await tap(3);
    await expect
      .poll(() => stack(page))
      .toEqual(['layer-background', 'layer-drawing', 'layer-media']);
  });

  test('DAN-03: the undo limit is set in the settings within 10–500 and remembered (D6)', async ({
    page,
  }) => {
    await openBoard(page);
    const limit = page.getByTestId('history-limit');
    await expect(limit).toHaveValue('50');
    await limit.fill('5');
    await limit.press('Enter');
    await limit.blur();
    await expect(limit).toHaveValue('10');
    await limit.fill('120');
    await limit.blur();
    await expect(limit).toHaveValue('120');
    await page.reload();
    await expect(page.getByTestId('history-limit')).toHaveValue('120');
  });
});

test.describe('DAN-03: adding and removing layers in the panel (P17 b)', () => {
  test('DAN-03: a layer is added above the active one and removed, both undoable', async ({
    page,
  }) => {
    await openBoard(page);
    await row(page, 'layer-background').getByTestId('layer-select').click();
    await panel(page).getByTestId('layer-add-type').selectOption('layer-drawing');
    await panel(page).getByTestId('layer-add').click();
    await expect
      .poll(() => stack(page))
      .toEqual(['layer-background', 'layer-drawing', 'layer-media', 'layer-drawing']);
    await expect(panel(page).locator('li.active')).toHaveAttribute(
      'data-plugin-id',
      'layer-drawing',
    );
    await page.getByTestId('undo').click();
    await expect
      .poll(() => stack(page))
      .toEqual(['layer-background', 'layer-media', 'layer-drawing']);

    await row(page, 'layer-media').getByTestId('layer-remove').click();
    await expect.poll(() => stack(page)).toEqual(['layer-background', 'layer-drawing']);
    await page.getByTestId('undo').click();
    await expect
      .poll(() => stack(page))
      .toEqual(['layer-background', 'layer-media', 'layer-drawing']);
  });

  test('WAR-03: a locked layer cannot be removed', async ({ page }) => {
    await openBoard(page);
    const remove = row(page, 'layer-media').getByTestId('layer-remove');
    await expect(remove).toBeEnabled();
    await row(page, 'layer-media').getByTestId('layer-locked').click();
    await expect(remove).toBeDisabled();
  });

  test('DAN-03: the remove button of the last layer is disabled', async ({ page }) => {
    await openBoard(page);
    await row(page, 'layer-drawing').getByTestId('layer-remove').click();
    await row(page, 'layer-media').getByTestId('layer-remove').click();
    await expect.poll(() => stack(page)).toEqual(['layer-background']);
    await expect(row(page, 'layer-background').getByTestId('layer-remove')).toBeDisabled();
    await page.getByTestId('undo').click();
    await expect(row(page, 'layer-background').getByTestId('layer-remove')).toBeEnabled();
  });

  test('WAR-03: a held-back step names the layer with its number, as the panel does (P17 a)', async ({
    page,
  }) => {
    await openBoard(page);
    await row(page, 'layer-background').getByTestId('layer-select').click();
    await panel(page).getByTestId('layer-add-type').selectOption('layer-drawing');
    await panel(page).getByTestId('layer-add').click();
    const added = panel(page).locator('li.active');
    await expect(added).toHaveAttribute('data-plugin-id', 'layer-drawing');
    const name = (await added.getByTestId('layer-select').innerText()).trim();
    // Two drawing layers: the panel numbers them; the new one is the lower one.
    expect(name).toMatch(/ 1$/);
    await added.getByTestId('layer-locked').click();
    await page.getByTestId('undo').click();
    const notice = page.locator('[data-notice="notice.historyLocked"]');
    await expect(notice).toHaveCount(1);
    await expect(notice).toContainText(name);
  });
});
