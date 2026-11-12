import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { services, contact as contactInfo, site } from "@/lib/site";
import {
  AUDIT_OUTLET_BANDS,
  AUDIT_PLATFORMS,
  AUDIT_SOURCE,
  auditOutletLabel,
  auditPlatformLabel,
} from "@/lib/growth-audit";

export const runtime = "nodejs";

const optionalEnum = (values: readonly { id: string }[]) =>
  z.enum(values.map((v) => v.id) as [string, ...string[]]).optional().or(z.literal(""));

const schema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(120),
    email: z.string().trim().email("Please enter a valid email address").max(200),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    restaurant: z.string().trim().max(160).optional().or(z.literal("")),
    city: z.string().trim().max(120).optional().or(z.literal("")),
    service: z.string().trim().max(80).optional().or(z.literal("")),
    // Required (10+ characters) on the contact form; optional on the free growth
    // audit form, which asks for outlets and platforms instead. See superRefine.
    message: z.string().trim().max(4000).optional().or(z.literal("")),
    // Free growth audit fields (/free-growth-audit).
    outlets: optionalEnum(AUDIT_OUTLET_BANDS),
    platforms: optionalEnum(AUDIT_PLATFORMS),
    source: z.enum(["contact-form", AUDIT_SOURCE]).optional(),
    // Honeypot. Accepted by the schema on purpose: a validation error here would
    // tell a bot exactly which field gave it away. It is checked after parsing
    // and answered with a plain success instead.
    companyWebsite: z.string().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.source === AUDIT_SOURCE) {
      if (!data.outlets) ctx.addIssue({ code: "custom", path: ["outlets"], message: "Please pick your number of outlets" });
      if (!data.platforms) ctx.addIssue({ code: "custom", path: ["platforms"], message: "Please pick your platforms" });
    } else if ((data.message ?? "").length < 10) {
      ctx.addIssue({ code: "custom", path: ["message"], message: "Please tell us a little more" });
    }
  });

export async function POST(request: Request) {
  // --- Throttle -----------------------------------------------------------
  const limit = rateLimit(`contact:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly, or call us directly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  // --- Validate -----------------------------------------------------------
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const isAudit = data.source === AUDIT_SOURCE;

  // A filled honeypot is a bot. Return success so it does not retry.
  if (data.companyWebsite) {
    return NextResponse.json({ ok: true });
  }

  // --- Persist ------------------------------------------------------------
  const serviceName = isAudit
    ? "Free growth audit"
    : (services.find((s) => s.slug === data.service)?.name ?? data.service ?? "");
  const message = isAudit
    ? [
        "Free growth audit request",
        `Outlets: ${auditOutletLabel(data.outlets)}`,
        `Platforms: ${auditPlatformLabel(data.platforms)}`,
        "",
        data.message || "No message left.",
      ].join("\n")
    : (data.message ?? "");

  try {
    await db.enquiry.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        restaurant: data.restaurant || null,
        city: data.city || null,
        service: serviceName || null,
        message,
        source: isAudit ? AUDIT_SOURCE : "contact-form",
      },
    });
  } catch (err) {
    console.error("[contact] failed to save enquiry", err);
    return NextResponse.json(
      { error: "We could not save your message. Please email or call us instead." },
      { status: 500 },
    );
  }

  // --- Notify -------------------------------------------------------------
  // The enquiry is already stored, so a failure here must not fail the request.
  await notify(data, serviceName, message, isAudit).catch((err) =>
    console.error("[contact] notification failed", err),
  );

  return NextResponse.json({ ok: true });
}

async function notify(data: z.infer<typeof schema>, serviceName: string, message: string, isAudit: boolean) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // Email is optional; the Studio inbox always has the lead.

  const to = process.env.ENQUIRY_TO_EMAIL ?? contactInfo.primaryEmail.label;

  const rows = [
    ["Name", data.name],
    ["Email", data.email],
    ["Phone", data.phone || "—"],
    ["Restaurant", data.restaurant || "—"],
    ["City", data.city || "—"],
    ["Service", serviceName || "Not specified"],
  ]
    .map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#8d836c">${k}</td><td style="padding:6px 0"><strong>${escapeHtml(v)}</strong></td></tr>`)
    .join("");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${site.name} <noreply@${new URL(site.url).hostname}>`,
      to: [to],
      reply_to: data.email,
      subject: `${isAudit ? "Free growth audit" : "New enquiry"} — ${data.restaurant || data.name}${data.city ? ` (${data.city})` : ""}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:640px">
          <h2 style="margin:0 0 4px">New growth-audit request</h2>
          <table style="border-collapse:collapse;font-size:14px">${rows}</table>
          <h3 style="margin:24px 0 6px;font-size:14px">Message</h3>
          <p style="white-space:pre-wrap;line-height:1.6;font-size:14px">${escapeHtml(message)}</p>
        </div>
      `,
    }),
  });

  if (!res.ok) throw new Error(`Resend responded ${res.status}`);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
