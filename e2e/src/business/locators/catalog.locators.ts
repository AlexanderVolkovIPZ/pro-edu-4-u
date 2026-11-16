import type { Page } from '@playwright/test';

// The Bidium catalog shows auction cards; the filter is hidden in a dropdown menu.
export const catalogLocators = (page: Page) => ({
  openFilters: page.getByTestId('filter-open'),
  // categories are a list of checkboxes, so the checkbox is found by the category name
  category: (name: string) => page.getByTestId('filter-category').getByRole('checkbox', { name, exact: true }),
  priceMin: page.getByTestId('filter-price-min'),
  priceMax: page.getByTestId('filter-price-max'),
  apply: page.getByTestId('filter-apply'),
  cards: page.getByTestId('lot-card'),
  cardPrices: page.getByTestId('lot-card-price'),
  empty: page.getByTestId('catalog-empty'),
});
