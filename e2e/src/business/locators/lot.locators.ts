import type { Page } from '@playwright/test';

export const lotLocators = (page: Page) => ({
  // "Overview" tab
  startPrice: page.getByTestId('lot-start-price'),
  buyoutPrice: page.getByTestId('lot-buyout-price'),
  // "Bid process" tab
  bidTab: page.getByTestId('lot-tab-bid-process'),
  connecting: page.getByTestId('lot-connecting'), // "no connection to the server yet" label
  currentPrice: page.getByTestId('lot-current-price'), // top row of the bid history
  bidInput: page.getByTestId('bid-amount'), // the minimum bid is stored in its min attribute
  bidSubmit: page.getByTestId('bid-submit'),
  bidError: page.getByTestId('bid-error'), // text inside the pop-up message (toast)
});
