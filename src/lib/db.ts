import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton.
 *
 * Next.js hot-reloads modules in development, which would otherwise open a new
 * connection pool on every save until the database refuses them. Stashing the
 * client on `globalThis` keeps exactly one instance alive across reloads.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Prisma's default pool is tiny (derived from CPU count), and the build
 * pre-renders every article in parallel, which starves it and times out.
 * Neon's pooled endpoint takes plenty of clients, so widen the pool and wait
 * longer unless the URL already says otherwise.
 */
function datasourceUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw?.startsWith("postgres")) return undefined;
  const url = new URL(raw);
  if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "10");
  if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "60");
  return url.toString();
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: datasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
