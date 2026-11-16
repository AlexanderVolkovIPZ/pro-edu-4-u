import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { loginLocators } from '../locators/login.locators';

export class LoginPage extends BasePage {
  private readonly el;

  constructor(page: Page) {
    super(page);
    this.el = loginLocators(page);
  }

  async open(): Promise<void> {
    await this.openPath('/sign-in');
  }

  async login(email: string, password: string): Promise<void> {
    await this.el.email.fill(email);
    await this.el.password.fill(password);
    await this.el.submit.click();
  }

  async expectError(): Promise<void> {
    await expect(this.el.error).toBeVisible();
    await expect(this.page).toHaveURL(/\/sign-in/);
  }

  protected async waitUntilLoaded(): Promise<void> {
    await expect(this.el.submit).toBeVisible();
  }
}
