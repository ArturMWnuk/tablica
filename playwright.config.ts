import { defineConfig, devices } from '@playwright/test';

// Frontend tests run against the built web app in Chromium (engine of WebView2 and Android
// WebView) and WebKit (engine of WebKitGTK on Linux), with the Tauri API mocked (e2e/fixtures.ts).
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'pnpm --filter @tablica/app preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env['CI'],
  },
});
