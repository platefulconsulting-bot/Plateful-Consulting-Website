import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Studio gate.
 *
 * Runs before any Studio page or API route renders, so an unauthenticated
 * request never reaches a component that queries the database. Only the JWT
 * signature is checked here — the Edge runtime has no Prisma access, and the
 * pages themselves re-read the session for the user's identity.
 */

const COOKIE = "pfc_studio";

async function isValidSession(token: string | undefined) {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isLogin = pathname === "/studio/login";
  const authed = await isValidSession(request.cookies.get(COOKIE)?.value);

  // Signed in and heading for the login screen — send them to the dashboard.
  if (isLogin && authed) {
    return NextResponse.redirect(new URL("/studio", request.url));
  }

  if (isLogin) return NextResponse.next();

  if (!authed) {
    // API callers get a status code; humans get the login form, with a
    // "next" hop so they land where they were going.
    if (pathname.startsWith("/api/studio")) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    const url = new URL("/studio/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/api/studio/:path*"],
};
