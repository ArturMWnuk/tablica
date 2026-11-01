import { test as base } from '@playwright/test';

/** IPC calls recorded by the Tauri API mock, readable in tests via `window.__TAURI_MOCK_CALLS__`. */
export interface MockedIpcCall {
  cmd: string;
  args: unknown;
}

/**
 * Playwright test with the Tauri IPC layer mocked, so the web app runs in a plain browser.
 * Commands answer from `responses` (by command name) and every call is recorded.
 */
export const test = base.extend<{ tauriResponses: Record<string, unknown> }>({
  tauriResponses: [{}, { option: true }],
  page: async ({ page, tauriResponses }, use) => {
    await page.addInitScript((responses: Record<string, unknown>) => {
      const calls: MockedIpcCall[] = [];
      const w = window as unknown as Record<string, unknown>;
      w['__TAURI_MOCK_CALLS__'] = calls;
      w['__TAURI_INTERNALS__'] = {
        metadata: {
          currentWindow: { label: 'main' },
          currentWebview: { windowLabel: 'main', label: 'main' },
        },
        invoke: (cmd: string, args: unknown) => {
          calls.push({ cmd, args });
          return Promise.resolve(responses[cmd] ?? null);
        },
        transformCallback: () => 0,
        convertFileSrc: (path: string) => path,
      };
    }, tauriResponses);
    await use(page);
  },
});

export { expect } from '@playwright/test';
