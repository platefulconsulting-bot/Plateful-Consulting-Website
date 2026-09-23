import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "./db";

/**
 * Studio authentication.
 *
 * A signed, httpOnly JWT in a cookie. No third-party auth service, no session
 * table to prune — appropriate for a handful of editors on a marketing site.
 */

const COOKIE = "pfc_studio";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Generate one with:\n" +
        '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }
  return new TextEncoder().encode(value);
}

export type Session = { userId: string; email: string; name: string; role: string };

export async function createSession(user: Session) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role),
    };
  } catch {
    // Expired or tampered token — treat as signed out.
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/**
 * Verifies credentials in constant-ish time. When the email is unknown we still
 * run a bcrypt comparison against a dummy hash so that response timing does not
 * reveal which accounts exist.
 */
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEe.ORQXcQxpVJMEz3rWQZm7uKQ3cHNJ7Iy";

export async function verifyCredentials(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return null;
  return { userId: user.id, email: user.email, name: user.name, role: user.role } satisfies Session;
}
