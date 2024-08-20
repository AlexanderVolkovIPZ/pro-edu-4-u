import { PrismaClient } from "@prisma/client";

declare global {
  var prismaDb: PrismaClient | undefined;
}

const client = globalThis.prismaDb || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaDb = client;
}

export default client;
