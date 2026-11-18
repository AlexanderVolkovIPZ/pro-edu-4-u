import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

// VS Code installed as a snap adds its own GTK/GIO variables to the terminal.
// Because of them WebKit cannot load any page ("WebKit encountered an internal error"),
// so these variables are removed from the browser environment for WebKit.
const SNAP_VARS = ['GTK_PATH', 'GTK_EXE_PREFIX', 'GTK_IM_MODULE_FILE', 'GIO_MODULE_DIR', 'GDK_PIXBUF_MODULE_FILE', 'GDK_PIXBUF_MODULEDIR', 'GSETTINGS_SCHEMA_DIR', 'LOCPATH'];
const webkitEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry): entry is [string, string] =>
      entry[1] !== undefined && !(SNAP_VARS.includes(entry[0]) && entry[1].includes('/snap/')),
  ),
);

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./src/fixtures/globalSetup'),
  fullyParallel: true,
  // Locally all browsers run one after another: Bidium broadcasts the new-bid event to every open
  // lot page, so parallel bids from different browsers would interfere with each other.
  // In CI every browser runs on its own machine (matrix), with 4 workers there.
  workers: process.env.CI ? 4 : 1,
  retries: process.env.CI ? 1 : 0,       // one retry in CI only, to tell a flaky test from a real bug
  timeout: 30_000,
  expect: { timeout: 5_000 },            // explicit wait for every expect
  grep: env.readOnly ? /@smoke/ : undefined, // only safe smoke tests on prod
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],
  use: {
    baseURL: env.baseUrl,
    testIdAttribute: 'data-testid',
    actionTimeout: 10_000,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'api', testDir: './tests/api' },
    { name: 'chromium', testDir: './tests/gui', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testDir: './tests/gui', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testDir: './tests/gui', use: { ...devices['Desktop Safari'], launchOptions: { env: webkitEnv } } },
  ],
});
