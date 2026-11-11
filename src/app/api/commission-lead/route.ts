import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { contact as contactInfo, site } from "@/lib/site";
import { GMV_BANDS, OUTLET_BANDS, isQualified } from "@/lib/commission-program";

export const runtime = "nodejs";

/**
 * Lead capture for the Commission Reduction Program page.
 *
 * Shorter than the contact form on purpose (no email or message required),
 * because the qualifying questions already tell the team what it needs. Leads
 * land in the same Studio inbox as every other enquiry, tagged by source.
 */

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  phone: z.string().trim().min(10, "Please enter a valid mobile number").max(40),
  email: z.string().trim().email("Please enter a valid email address").max(200).optional().or(z.literal("")),
  restaurant: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Please enter your city").max(120),
  gmv: z.enum(GMV_BANDS.map((b) => b.id) as [string, ...string[]], { message: "Please pick your monthly sales" }),
  outlets: z.enum(OUTLET_BANDS.map((b) => b.id) as [string, ...string[]], { message: "Please pick your outlet count" }),
  commission: z.string().trim().max(10).optional().or(z.literal("")),
  companyWebsite: z.string().max(200).optional(), // honeypot
});

export async function POST(request: Request) {
  const limit = rateLimit(`commission:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly, or call us directly." },
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
      { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const qualified = isQualified(data.gmv, data.outlets);
  if (data.companyWebsite) return NextResponse.json({ ok: true, qualified });

  const gmvLabel = GMV_BANDS.find((b) => b.id === data.gmv)?.label ?? data.gmv;
  const outletLabel = OUTLET_BANDS.find((b) => b.id === data.outlets)?.label ?? data.outlets;
  const message = [
    `Commission Reduction Program enquiry (${qualified ? "QUALIFIED" : "free audit track"})`,
    `Monthly app sales: ${gmvLabel}`,
    `Outlets: ${outletLabel}`,
    `Current commission: ${data.commission ? `${data.commission}%` : "not given"}`,
  ].join("\n");

  try {
    await db.enquiry.create({
      data: {
        name: data.name,
        email: (data.email || "").toLowerCase(),
        phone: data.phone,
        restaurant: data.restaurant || null,
        city: data.city,
        service: "Commission Reduction Program",
        message,
        source: qualified ? "commission-reduction:qualified" : "commission-reduction:audit",
      },
    });
  } catch (err) {
    console.error("[commission-lead] failed to save enquiry", err);
    return NextResponse.json(
      { error: "We could not save your details. Please WhatsApp or call us instead." },
      { status: 500 },
    );
  }

  await notify(data, message, qualified).catch((err) => console.error("[commission-lead] notification failed", err));

  return NextResponse.json({ ok: true, qualified });
}

async function notify(data: z.infer<typeof schema>, message: string, qualified: boolean) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const to = process.env.ENQUIRY_TO_EMAIL ?? contactInfo.primaryEmail.label;
  const rows = [
    ["Name", data.name],
    ["Phone", data.phone],
    ["Email", data.email || "—"],
    ["Restaurant", data.restaurant || "—"],
    ["City", data.city],
  ]
    .map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#8d836c">${k}</td><td style="padding:6px 0"><strong>${escapeHtml(v)}</strong></td></tr>`)
    .join("");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${site.name} <noreply@${new URL(site.url).hostname}>`,
      to: [to],
      ...(data.email ? { reply_to: data.email } : {}),
      subject: `${qualified ? "[QUALIFIED] " : ""}Commission program — ${data.restaurant || data.name} (${data.city})`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:640px">
          <h2 style="margin:0 0 4px">Commission Reduction Program lead</h2>
          <table style="border-collapse:collapse;font-size:14px">${rows}</table>
          <p style="white-space:pre-wrap;line-height:1.6;font-size:14px;margin-top:20px">${escapeHtml(message)}</p>
        </div>
      `,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}`);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
