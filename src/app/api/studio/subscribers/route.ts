import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** CSV export of the mailing list, for import into an email platform. */
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Not authenticated.", { status: 401 });

  const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: "desc" } });

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    ["email", "source", "subscribed_at"].join(","),
    ...subscribers.map((s) =>
      [escape(s.email), escape(s.source), escape(s.createdAt.toISOString())].join(","),
    ),
  ].join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="plateful-subscribers-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
