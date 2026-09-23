import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton.
 *
 * Next.js hot-reloads modules in development, which would otherwise open a new
 * connection pool on every save until the database refuses them. Stashing the
 * client on `globalThis` keeps exactly one instance alive across reloads.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
