import type { Page } from '@playwright/test';

// Behaviour shared by all pages: open by path and wait
// until the page is ready (explicit wait instead of sleep).
export abstract class BasePage {
  protected constructor(readonly page: Page) {}

  protected async openPath(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitUntilLoaded();
  }

  protected abstract waitUntilLoaded(): Promise<void>;
}
