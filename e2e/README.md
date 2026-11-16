# Bidium TAF

Test automation framework for Bidium (Lab 5): Playwright + TypeScript, POM, DDT, Allure, GitHub Actions.

## Running

The framework lives in the `e2e/` folder of the Bidium repository and has its own `package.json`.
All commands below are run from `e2e/` unless stated otherwise.

```bash
npm ci
npx playwright install
cp .env.example .env          # set TEST_PASSWORD

# 1. Test database (MongoDB in Docker, single-node replica set, port 27018)
docker compose up -d --wait

# 2. Application: from the repository root, with the same database as in e2e/.env
cd ..
export DATABASE_URL='mongodb://localhost:27018/bidium_e2e?replicaSet=rs0&directConnection=true'
export NEXTAUTH_SECRET=e2e-local-secret NEXTAUTH_URL=http://localhost:3000 STRIPE_SECRET_KEY=sk_test_dummy
npm run build && npm run start
cd e2e

# 3. Tests and report
npm test                      # all tests on dev (seed runs automatically)
npm run test:smoke            # @smoke only
TEST_ENV=staging npm run test:api
npm run report                # generate and open the Allure report (requires Java)
```

## Layers (gTAA)

| Layer | Folder |
| --- | --- |
| Test Scripts | `tests/gui`, `tests/api` |
| Business Logic | `src/business` (pages, locators, api) |
| Core / Adaptation | `src/core`, `src/fixtures`, `playwright.config.ts` |
| Test Data | `data/*.json`, `config/environments/*.json`, `src/data/DataProvider.ts` |

## How the framework is bound to Bidium

1. **URLs.** Sign-in: `/sign-in`. Catalog: `/` (only after sign-in). Lot: `/auctions/:auctionId/lots/:lotId/overview`.
2. **data-testid.** Page Objects find elements by `data-testid` (the list is in `src/business/locators`). The attributes were added to the Bidium components.
3. **API.** AT-03 uses `GET/PATCH /api/auction/:id`; sign-in is the standard NextAuth credentials flow (`/api/auth/csrf`, `/api/auth/callback/credentials`, `/api/auth/session`).
4. **Seed data.** `scripts/seed.js` creates the accounts from `data/users.json` (password: `TEST_PASSWORD`), five auctions with one lot each, and the "Electronics" and "Furniture" categories. Their ids are fixed and stored in `config/environments/dev.json`. The script works only with a local database (any other one requires `SEED_ALLOW_REMOTE=true`) and does not touch records it did not create.
5. **Lot state.** Before every bid test the lot is reset to its initial state (`SEED_COMMAND --lot <id>`): no bids, bidding in progress.
6. **Lot page.** The start price and the buyout price are read from the Overview tab, the current price from the top row of the bid history, and the minimum bid from the `min` attribute of the amount field.

On prod (`TEST_ENV=prod`) only tests tagged `@smoke` are run, and seeding is not allowed.
