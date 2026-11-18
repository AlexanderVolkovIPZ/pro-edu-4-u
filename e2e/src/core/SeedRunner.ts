import { execSync } from 'node:child_process';
import path from 'node:path';
import { env } from '../../config/env';
import { TafError } from './TafError';

// Core Layer: runs the command that prepares test data (SEED_COMMAND from .env).
// Without arguments it fills the whole test database, with "--lot <id>" it resets one lot to its initial state.
const TAF_ROOT = path.resolve(__dirname, '../..');

export function seedConfigured(): boolean {
  return Boolean(process.env.SEED_COMMAND);
}

export function runSeed(args: string[] = []): void {
  const cmd = process.env.SEED_COMMAND;
  if (!cmd) return;
  if (env.readOnly) throw new TafError(`Seed is not allowed on the ${env.name} environment`);
  try {
    execSync([cmd, ...args].join(' '), { cwd: TAF_ROOT, stdio: 'inherit' });
  } catch (e) {
    throw new TafError(`Seed command failed (${cmd} ${args.join(' ')})`, e);
  }
}
