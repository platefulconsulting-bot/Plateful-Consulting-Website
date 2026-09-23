import { Download, Mail } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  const subscribers = await db.subscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  return (
    <div className="p-6 lg:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-50">Subscribers</h1>
          <p className="mt-1.5 text-sm text-cream-400">
            {subscribers.length} email{subscribers.length === 1 ? "" : "s"} collected from the site.
          </p>
        </div>

        {subscribers.length > 0 && (
          <a href="/api/studio/subscribers" className="btn btn-outline btn-sm" download>
            <Download className="h-4 w-4" aria-hidden />
            Export CSV
          </a>
        )}
      </header>

      {subscribers.length === 0 ? (
        <div className="card mt-7 p-12 text-center">
          <p className="font-display text-lg font-semibold text-cream-50">No subscribers yet.</p>
          <p className="mt-2 text-sm text-cream-400">
            The footer sign-up form feeds this list.
          </p>
        </div>
      ) : (
        <div className="card mt-7 overflow-hidden">
          <ul className="divide-y divide-cream-100/8">
            {subscribers.map((subscriber) => (
              <li key={subscriber.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <a
                  href={`mailto:${subscriber.email}`}
                  className="flex items-center gap-2.5 text-sm text-cream-100 hover:text-gold-300"
                >
                  <Mail className="h-4 w-4 shrink-0 text-cream-500" aria-hidden />
                  {subscriber.email}
                </a>
                <span className="text-xs text-cream-500">
                  {subscriber.source} · {formatDate(subscriber.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
