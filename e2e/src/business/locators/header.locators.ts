import type { Page } from '@playwright/test';

export const headerLocators = (page: Page) => ({
  userMenu: page.getByTestId('header-user-menu'),
  loginLink: page.getByTestId('header-login'),
});
