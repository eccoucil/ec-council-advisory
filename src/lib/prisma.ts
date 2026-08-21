import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function hasCurrentModels(client: PrismaClient | undefined): client is PrismaClient {
  return Boolean(client?.pulseAnswer && client?.pulseSubmission);
}

export const prisma = hasCurrentModels(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
