// Smoke test of the built desktop application through tauri-driver (WebDriver).
// Requires: a debug build (`pnpm tauri build --debug --no-bundle`), `tauri-driver` on PATH and
// the platform WebDriver (msedgedriver on Windows, WebKitWebDriver on Linux).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { Builder, By, Capabilities, until } from 'selenium-webdriver';

const binary = fileURLToPath(
  new URL(
    `../src-tauri/target/debug/tablica${process.platform === 'win32' ? '.exe' : ''}`,
    import.meta.url,
  ),
);

/** @type {import('node:child_process').ChildProcess | undefined} */
let driverProcess;
/** @type {import('selenium-webdriver').WebDriver | undefined} */
let driver;

const DRIVER_URL = 'http://127.0.0.1:4444/';

/** Waits until tauri-driver accepts connections. */
async function waitForDriver(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(`${DRIVER_URL}status`);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error('tauri-driver did not start');
}

before(async () => {
  assert.ok(existsSync(binary), `Application binary not found: ${binary}`);
  driverProcess = spawn('tauri-driver', [], { stdio: [null, process.stdout, process.stderr] });
  await waitForDriver();
  const capabilities = new Capabilities();
  capabilities.set('tauri:options', { application: binary });
  capabilities.setBrowserName('wry');
  driver = await new Builder().withCapabilities(capabilities).usingServer(DRIVER_URL).build();
});

after(async () => {
  await driver?.quit();
  driverProcess?.kill();
});

test('PLAT-01, PLAT-02: application starts and shows an empty board', async () => {
  assert.ok(driver);
  const board = await driver.wait(until.elementLocated(By.css('[data-testid="board"]')), 15000);
  assert.ok(await board.isDisplayed());
  assert.equal(await driver.getTitle(), 'Tablica');
  assert.equal(await board.getText(), '');
});
