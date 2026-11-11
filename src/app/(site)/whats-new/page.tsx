import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";

import { whatsNew } from "@/lib/whats-new";
import { jsonLd, breadcrumbSchema } from "@/lib/seo";
import { formatDate, ogImageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "What's New: Restaurant Growth Tools & Guides | PFC" },
  description:
    "The latest free tools, guides and features from Plateful Consulting for restaurants growing on Swiggy and Zomato.",
  alternates: { canonical: "/whats-new" },
  openGraph: {
    title: "What's new at Plateful Consulting",
    description: "New free tools and guides for restaurants growing on Swiggy and Zomato.",
    url: "/whats-new",
    images: [{ url: ogImageUrl("What's New at Plateful Consulting"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "What's new at Plateful Consulting",
    description: "New free tools and guides for restaurants growing on Swiggy and Zomato.",
    images: [ogImageUrl("What's New at Plateful Consulting")],
  },
};

export default function WhatsNewPage() {
  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "What's New", path: "/whats-new" },
    ]),
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <header className="relative overflow-hidden border-b border-cream-100/8">
        <div className="grid-lines absolute inset-0 mask-fade-b opacity-30" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(180,122,23,0.14),transparent_55%)]"
          aria-hidden
        />
        <div className="container-x relative py-12 lg:py-16">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-cream-500">
              <li>
                <Link href="/" className="transition-colors hover:text-gold-300">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li className="text-cream-300">What&apos;s New</li>
            </ol>
          </nav>
          <h1 className="mt-6 text-[length:var(--text-display-lg)] font-bold leading-[1.05] tracking-[-0.03em]">
            What&apos;s new
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-300">
            New tools, guides and features for restaurants growing on Swiggy and Zomato, newest first.
          </p>
        </div>
      </header>

      <div className="container-x py-12 lg:py-16">
        <ol className="relative max-w-3xl space-y-8 border-l border-cream-100/10 pl-6 md:pl-10">
          {whatsNew.map((entry) => (
            <li key={`${entry.date}-${entry.title}`} className="relative">
              <span
                className="absolute -left-[calc(1.5rem+5px)] top-7 h-2.5 w-2.5 rounded-full bg-gold-400 md:-left-[calc(2.5rem+5px)]"
                aria-hidden
              />
              <article className="card card-sheen p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="chip">{entry.kind}</span>
                  <time dateTime={entry.date} className="text-sm text-cream-500">
                    {formatDate(entry.date)}
                  </time>
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold leading-snug text-cream-50 md:text-2xl">
                  {entry.title}
                </h2>
                <p className="mt-3 leading-relaxed text-cream-300">{entry.summary}</p>
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5">
                  {entry.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-flex items-center gap-1 text-sm font-medium text-gold-300 underline-offset-4 hover:underline"
                      >
                        {l.label}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
