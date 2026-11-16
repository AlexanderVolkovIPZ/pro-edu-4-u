import fs from 'node:fs';
import path from 'node:path';
import { env } from '../../config/env';
import type { CatalogFilter } from '../business/pages/CatalogPage';
import type { LotPrices } from '../business/pages/LotPage';

// Test Data Layer: reads JSON from the data/ folder and returns ready sets
// for test parameterization. The tests themselves contain no hard-coded data.
const DATA_DIR = path.resolve(__dirname, '../../data');

export function loadJson<T>(file: string): T {
  const full = path.join(DATA_DIR, file);
  try {
    return JSON.parse(fs.readFileSync(full, 'utf-8')) as T;
  } catch (e) {
    throw new Error(`Failed to read test data ${file}: ${(e as Error).message}`);
  }
}

// ---------- users ----------
export type Role = 'owner' | 'buyer' | 'admin' | 'blockedOwner';
const users = loadJson<Record<Role, { email: string }>>('users.json');

export function credentialsOf(role: Role) {
  if (!users[role]) throw new Error(`users.json has no role ${role}`);
  return { email: users[role].email, password: env.password };
}

// ---------- bids ----------
export type DataSet = 'valid' | 'boundary' | 'invalid';
export interface BidCase {
  id: string;
  title: string;
  amount: string; // "min-1", "buyout+1" or a raw value ("abc")
  expect: 'accepted' | 'disabled' | 'rejected';
  set: DataSet;
}

export function bidCases(): BidCase[] {
  const data = loadJson<Record<DataSet, Omit<BidCase, 'set'>[]>>('bids.json');
  return (['valid', 'boundary', 'invalid'] as DataSet[]).flatMap((set) =>
    (data[set] ?? []).map((c) => ({ ...c, set })),
  );
}

// Boundaries are counted from the current lot state: after an accepted bid the minimum grows,
// so "1549" from labs 1-2 is written here as "min-1".
export function resolveAmount(expr: string, prices: LotPrices): string {
  const m = /^(min|buyout)([+-]\d+)?$/.exec(expr);
  if (!m) return expr;
  const base = m[1] === 'min' ? prices.min : prices.buyout;
  return String(base + Number(m[2] ?? 0));
}

// ---------- sign-in ----------
export interface LoginCase {
  id: string;
  title: string;
  email: string;
  password: string;
  expect: 'success' | 'error';
  smoke: boolean;
  set: DataSet;
}

export function loginCases(): LoginCase[] {
  type Raw = { id: string; title: string; user?: Role; email?: string; password: string; expect: LoginCase['expect']; smoke?: boolean };
  const data = loadJson<Partial<Record<DataSet, Raw[]>>>('login.json');
  return (['valid', 'boundary', 'invalid'] as DataSet[]).flatMap((set) =>
    (data[set] ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      email: r.user ? credentialsOf(r.user).email : r.email!,
      password: r.password === '$SEED' ? env.password : r.password,
      expect: r.expect,
      smoke: r.smoke ?? false,
      set,
    })),
  );
}

// ---------- access rights (MC/DC from lab 4) ----------
export interface AccessCase {
  id: string;
  actor: Role;
  auction: string;
  expect: 'allowed' | 'denied';
}
export const accessCases = () => loadJson<AccessCase[]>('access.json');

// ---------- catalog ----------
export interface CatalogCase {
  id: string;
  title: string;
  filter: CatalogFilter;
  expectEmpty: boolean;
  smoke?: boolean;
}
export const catalogCases = () => loadJson<CatalogCase[]>('catalog.json');

export const tags = (...t: (string | false | undefined)[]) => t.filter(Boolean).join(' ');
