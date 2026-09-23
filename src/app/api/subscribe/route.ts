import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(200),
  source: z.string().trim().max(40).optional(),
});

export async function POST(request: Request) {
  const limit = rateLimit(`subscribe:${clientIp(request)}`, { limit: 6, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your email address." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();

  try {
    await db.subscriber.create({
      data: { email, source: parsed.data.source ?? "footer" },
    });
  } catch (err: unknown) {
    // Already subscribed. Confirm rather than leak that the address is known —
    // and so a returning visitor is not told they "failed".
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json({ ok: true, message: "You're already on the list." });
    }
    console.error("[subscribe] failed", err);
    return NextResponse.json({ error: "Could not subscribe right now." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "You're on the list." });
}
