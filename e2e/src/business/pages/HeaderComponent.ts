import { expect, type Page } from '@playwright/test';
import { headerLocators } from '../locators/header.locators';

// A component, not a page: the header is present on every page of the site.
export class HeaderComponent {
  private readonly el;

  constructor(private readonly page: Page) {
    this.el = headerLocators(page);
  }

  async expectLoggedIn(): Promise<void> {
    await expect(this.el.userMenu).toBeVisible();
    await expect(this.page).not.toHaveURL(/\/sign-in/);
  }

  async expectLoggedOut(): Promise<void> {
    await expect(this.el.loginLink).toBeVisible();
  }
}
