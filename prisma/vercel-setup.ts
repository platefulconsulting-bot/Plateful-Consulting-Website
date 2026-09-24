/**
 * Runs on every Vercel build, after `prisma db push` has created any missing
 * tables and before `next build` pre-renders the articles.
 *
 * - Empty database (first deploy): installs the 32 legacy articles, authors
 *   and categories. Skipped once any post exists, so articles the team has
 *   since edited, unpublished or deleted in the Studio are never brought back.
 * - Every build: applies STUDIO_EMAIL / STUDIO_PASSWORD, so changing the Studio
 *   password is "edit the variable in Vercel, redeploy".
 */

import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const posts = await db.post.count();
  await db.$disconnect();

  if (posts === 0) {
    console.log("[setup] empty database — installing the legacy articles");
    execSync("tsx prisma/seed.ts", { stdio: "inherit" });
  } else {
    console.log(`[setup] ${posts} posts already in the database — leaving content alone`);
  }

  execSync("tsx prisma/ensure-admin.ts", { stdio: "inherit" });
}

main().catch((error) => {
  console.error("[setup] failed:", error);
  process.exit(1);
});
