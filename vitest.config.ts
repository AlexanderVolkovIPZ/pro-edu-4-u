import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: {
      // The Prisma client is instantiated on import; it never connects in unit tests.
      DATABASE_URL: 'mongodb://localhost:27017/bidium-test',
      NEXTAUTH_SECRET: 'test-secret',
      JWT_SECRET: 'test-secret',
      STRIPE_SECRET_KEY: 'sk_test_dummy',
    },
  },
});
