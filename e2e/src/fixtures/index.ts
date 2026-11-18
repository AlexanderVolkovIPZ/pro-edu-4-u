import { test as base, expect, request, type APIRequestContext } from '@playwright/test';
import { Logger } from '../core/Logger';
import { HttpClient } from '../core/HttpClient';
import { TafError } from '../core/TafError';
import { runSeed, seedConfigured } from '../core/SeedRunner';
import { AuthApi } from '../business/api/AuthApi';
import { AuctionsApi } from '../business/api/AuctionsApi';
import { LoginPage } from '../business/pages/LoginPage';
import { CatalogPage } from '../business/pages/CatalogPage';
import { LotPage } from '../business/pages/LotPage';
import { HeaderComponent } from '../business/pages/HeaderComponent';
import { credentialsOf, type Role } from '../data/DataProvider';

// Playwright fixtures = the analogue of @BeforeMethod / @AfterMethod:
// code before "await use()" is the pre-condition, code after it is the post-condition.

type ApiFixtures = {
  log: Logger;
  // returns an API client that is already signed in
  apiAs: (role: Role, opts?: { mustLogin?: boolean }) => Promise<AuctionsApi>;
};

export const test = base.extend<ApiFixtures>({
  log: async ({}, use, testInfo) => {
    const log = new Logger(testInfo.title);
    log.info(`START ${testInfo.project.name}`);
    await use(log);
    log.info(`END status=${testInfo.status} (${testInfo.duration} ms)`);
    await testInfo.attach('test.log', { body: log.dump(), contentType: 'text/plain' });
  },

  apiAs: async ({ log, baseURL }, use) => {
    const contexts: APIRequestContext[] = [];
    await use(async (role, opts = { mustLogin: true }) => {
      const ctx = await request.newContext({ baseURL });
      contexts.push(ctx);
      const http = new HttpClient(ctx, log);
      const ok = await new AuthApi(http).login(credentialsOf(role));
      log.info(`login as ${role}: ${ok ? 'success' : 'session not created'}`);
      if (!ok && opts.mustLogin) throw new TafError(`Pre-condition: failed to log in as ${role}`);
      return new AuctionsApi(http);
    });
    for (const ctx of contexts) await ctx.dispose(); // post-condition: close the sessions
  },
});

type GuiFixtures = {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  lotPage: LotPage;
  header: HeaderComponent;
  loginAs: (role: Role) => Promise<void>;
  resetLot: (lotId: string) => void;
  failureArtifacts: void;
};

export const guiTest = test.extend<GuiFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  catalogPage: async ({ page }, use) => use(new CatalogPage(page)),
  lotPage: async ({ page }, use) => use(new LotPage(page)),
  header: async ({ page }, use) => use(new HeaderComponent(page)),

  // Sign-in through the API is faster and more stable than through the form.
  // page.request shares cookies with the browser, so the page is already signed in.
  loginAs: async ({ page, log }, use) => {
    await use(async (role) => {
      const ok = await new AuthApi(new HttpClient(page.request, log)).login(credentialsOf(role));
      if (!ok) throw new TafError(`Pre-condition: failed to log in as ${role}`);
      log.info(`browser logged in as ${role}`);
    });
  },

  // Pre-condition for bids: the lot has no bids and is not sold.
  // Needed because an accepted bid changes the price, and Bidium does not let the same buyer bid twice in a row.
  resetLot: async ({ log }, use) => {
    await use((lotId) => {
      if (!seedConfigured()) {
        log.warn('SEED_COMMAND is not set: the lot was not reset to its initial state');
        return;
      }
      runSeed(['--lot', lotId]);
      log.info(`lot ${lotId} reset to its initial state`);
    });
  },

  // Failure Recovery: on failure - screenshot, URL and browser console errors.
  failureArtifacts: [
    async ({ page, log }, use, testInfo) => {
      const consoleErrors: string[] = [];
      page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
      page.on('pageerror', (e) => consoleErrors.push(e.message));

      await use();

      if (testInfo.status === testInfo.expectedStatus) return;
      log.error(`test failed on page ${page.url()}`);
      try {
        const png = await page.screenshot({ fullPage: true });
        await testInfo.attach('screenshot-on-failure', { body: png, contentType: 'image/png' });
      } catch (e) {
        log.error(`screenshot not taken: ${(e as Error).message}`);
      }
      if (consoleErrors.length) {
        await testInfo.attach('browser-console', { body: consoleErrors.join('\n'), contentType: 'text/plain' });
      }
    },
    { auto: true },
  ],
});

export { expect };
