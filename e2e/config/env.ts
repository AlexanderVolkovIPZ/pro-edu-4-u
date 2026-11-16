import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// Test Data Layer: environment configuration (dev / staging / prod)
export type EnvName = 'dev' | 'staging' | 'prod';

// In Bidium a lot lives inside an auction, so the page address needs both ids.
export interface SeedLot {
  auctionId: string;
  lotId: string;
}

interface EnvFile {
  baseUrl: string;
  readOnly: boolean; // on prod only @smoke tests that change nothing are allowed
  seed: {
    lots: Record<string, SeedLot>; // a separate lot for every browser
    auctions: Record<string, string>;
  };
}

const name = (process.env.TEST_ENV ?? 'dev') as EnvName;
if (!['dev', 'staging', 'prod'].includes(name)) {
  throw new Error(`Unknown environment TEST_ENV=${name}`);
}

const file = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'environments', `${name}.json`), 'utf-8'),
) as EnvFile;

export const env = {
  name,
  ...file,
  password: process.env.TEST_PASSWORD ?? '',
};

export function seedId(group: 'auctions', key: string): string {
  const id = env.seed[group][key];
  if (!id) throw new Error(`${name}.json has no seed.${group}.${key}`);
  return id;
}

export function seedLot(key: string): SeedLot {
  const lot = env.seed.lots[key];
  if (!lot?.auctionId || !lot?.lotId) throw new Error(`${name}.json has no seed.lots.${key}`);
  return lot;
}
