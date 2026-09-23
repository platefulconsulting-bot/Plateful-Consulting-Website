/**
 * Applies the Studio login from the environment.
 *
 * Runs on every container boot, so changing the Blog Studio password in
 * production is "edit .env, restart" — no database surgery, and no risk to
 * articles, enquiries or subscribers, none of which this touches.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.STUDIO_EMAIL?.trim().toLowerCase();
  const password = process.env.STUDIO_PASSWORD;

  if (!email || !password) {
    console.log("[admin] STUDIO_EMAIL / STUDIO_PASSWORD not set — existing login left unchanged");
    return;
  }

  if (password.length < 12) {
    console.warn("[admin] WARNING: the Studio password is short. Use a long passphrase.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.upsert({
    where: { email },
    update: { passwordHash, role: "admin" },
    create: { email, name: "Plateful Admin", role: "admin", passwordHash },
  });

  console.log(`[admin] Studio login ready for ${email}`);
}

main()
  .catch((error) => {
    console.error("[admin] failed:", error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
