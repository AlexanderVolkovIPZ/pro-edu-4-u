import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaDb: PrismaClient | undefined;
}

const client =
  globalThis.prismaDb ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaDb = client;
}

export default client;
