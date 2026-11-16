import type { Page } from '@playwright/test';

// Locators are kept apart from methods: if the markup changes, only this file is edited.
export const loginLocators = (page: Page) => ({
  email: page.getByTestId('login-email'),
  password: page.getByTestId('login-password'),
  submit: page.getByTestId('login-submit'),
  error: page.getByTestId('login-error'), // text inside the pop-up message (toast)
});
