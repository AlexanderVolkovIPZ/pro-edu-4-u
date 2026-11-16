import { runSeed, seedConfigured } from '../core/SeedRunner';

// Before the whole run: refill the test database if needed,
// so that lots are in the "bidding in progress" state with known prices.
export default async function globalSetup(): Promise<void> {
  if (!seedConfigured()) return;
  console.log('[setup] seeding test data');
  runSeed();
}
