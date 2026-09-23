import { Mail, Phone, MapPin, Store, Check, RotateCcw } from "lucide-react";

import { db } from "@/lib/db";
import { toggleEnquiryHandled } from "../actions";
import { formatDate, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiries" };

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const showHandled = filter === "handled";

  const [enquiries, newCount, handledCount] = await Promise.all([
    db.enquiry.findMany({
      where: { handled: showHandled },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.enquiry.count({ where: { handled: false } }),
    db.enquiry.count({ where: { handled: true } }),
  ]);

  return (
    <div className="p-6 lg:p-10">
      <header>
        <h1 className="font-display text-2xl font-bold text-cream-50">Enquiries</h1>
        <p className="mt-1.5 text-sm text-cream-400">
          Every submission from the contact form, newest first.
        </p>
      </header>

      <div className="mt-7 flex gap-2">
        {[
          { key: undefined, label: "New", count: newCount },
          { key: "handled", label: "Handled", count: handledCount },
        ].map((tab) => (
          <a
            key={tab.label}
            href={tab.key ? `/studio/enquiries?filter=${tab.key}` : "/studio/enquiries"}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              (filter ?? undefined) === tab.key
                ? "border-gold-400/50 bg-gold-500/12 text-gold-300"
                : "border-cream-100/12 text-cream-300 hover:border-gold-400/40 hover:text-gold-300",
            )}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-60">{tab.count}</span>
          </a>
        ))}
      </div>

      {enquiries.length === 0 ? (
        <div className="card mt-6 p-12 text-center">
          <p className="font-display text-lg font-semibold text-cream-50">
            {showHandled ? "Nothing marked handled yet." : "No new enquiries."}
          </p>
          <p className="mt-2 text-sm text-cream-400">
            Submissions from the contact form land here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id}>
              <article className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-semibold text-cream-50">
                      {enquiry.name}
                      {enquiry.restaurant && (
                        <span className="ml-2 text-sm font-normal text-cream-400">
                          — {enquiry.restaurant}
                        </span>
                      )}
                    </h2>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-cream-400">
                      <a href={`mailto:${enquiry.email}`} className="flex items-center gap-1.5 hover:text-gold-300">
                        <Mail className="h-3.5 w-3.5" aria-hidden />
                        {enquiry.email}
                      </a>
                      {enquiry.phone && (
                        <a href={`tel:${enquiry.phone}`} className="flex items-center gap-1.5 hover:text-gold-300">
                          <Phone className="h-3.5 w-3.5" aria-hidden />
                          {enquiry.phone}
                        </a>
                      )}
                      {enquiry.city && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {enquiry.city}
                        </span>
                      )}
                      {enquiry.service && (
                        <span className="flex items-center gap-1.5">
                          <Store className="h-3.5 w-3.5" aria-hidden />
                          {enquiry.service}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <time className="text-xs text-cream-500" dateTime={enquiry.createdAt.toISOString()}>
                      {formatDate(enquiry.createdAt)}
                    </time>

                    <form action={toggleEnquiryHandled.bind(null, enquiry.id, !enquiry.handled)}>
                      <button type="submit" className="btn btn-outline btn-sm">
                        {enquiry.handled ? (
                          <>
                            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                            Reopen
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" aria-hidden />
                            Mark handled
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                <p className="mt-5 whitespace-pre-wrap border-l-2 border-gold-500/40 pl-4 text-sm leading-relaxed text-cream-300">
                  {enquiry.message}
                </p>

                <a
                  href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
                    `Re: your enquiry — Plateful Consulting`,
                  )}`}
                  className="btn btn-gold btn-sm mt-5"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  Reply
                </a>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
