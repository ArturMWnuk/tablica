import { expect, test } from './fixtures';

test.describe('application shell', () => {
  test('PLAT-01: window shows an empty board', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('board')).toBeVisible();
    // The board holds only the (still empty) layer containers, no text and no messages.
    await expect(page.getByTestId('board')).toHaveText('');
    await expect(page.getByTestId('notices')).toHaveCount(0);
  });
});

test.describe('WAR-01: layers', () => {
  test('WAR-01: a new lesson shows background, multimedia and drawing layers in this order', async ({
    page,
  }) => {
    await page.goto('/');
    const layers = page.getByTestId('board').locator(':scope > .layer');
    await expect(layers).toHaveCount(3);
    await expect(layers.nth(2)).toHaveAttribute('data-status', 'ready');
    const stack = await layers.evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          plugin: (element as HTMLElement).dataset['pluginId'],
          status: (element as HTMLElement).dataset['status'],
          zIndex: style.zIndex,
          visible: style.display !== 'none' && box.width > 0 && box.height > 0,
        };
      }),
    );
    expect(stack).toEqual([
      { plugin: 'layer-background', status: 'ready', zIndex: '0', visible: true },
      { plugin: 'layer-media', status: 'ready', zIndex: '1', visible: true },
      { plugin: 'layer-drawing', status: 'ready', zIndex: '2', visible: true },
    ]);
    // All layers cover the same board area, so their elements are shown together.
    const boxes = await layers.evaluateAll((elements) =>
      elements.map((element) => JSON.stringify(element.getBoundingClientRect())),
    );
    expect(new Set(boxes).size).toBe(1);
    await expect(layers.nth(2).locator('canvas')).toHaveCount(1);
  });
});

test.describe('UI-01: language', () => {
  test.use({ locale: 'pl-PL' });

  test('UI-01: Polish system language starts the interface in Polish (D10)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
    await expect(page.getByText('Motyw')).toBeVisible();
  });

  test('UI-01: switching the language changes texts without restart', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('language-select').selectOption('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByText('Theme', { exact: true })).toBeVisible();
    await expect(page.getByTestId('board')).toHaveAttribute('aria-label', 'Drawing board');
  });

  test('UI-01: selected language is remembered after reload', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('language-select').selectOption('en');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('UI-01: language for other systems', () => {
  test.use({ locale: 'de-DE' });

  test('UI-01: non-Polish system language starts the interface in English (D10)', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('UI-02: themes', () => {
  test('UI-02: system theme follows the OS color scheme (D11)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('UI-02: light and dark themes can be selected', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    await page.getByTestId('theme-select').selectOption('dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const dark = await background();

    await page.getByTestId('theme-select').selectOption('light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await background()).not.toBe(dark);
  });
});
