import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { CTABand } from "@/components/site/CTABand";
import { caseStudies, resultsPage, topicHubs, type CaseStudy } from "@/lib/site";
import { jsonLd, breadcrumbSchema, collectionPageSchema } from "@/lib/seo";
import { metaDescription, ogImageUrl, seoTitle } from "@/lib/utils";

/**
 * /results: named client case studies with before-and-after tables.
 *
 * Deliberately no Review / AggregateRating markup: Google treats reviews a
 * business publishes about itself as self-serving and ignores or penalises
 * them. The page is a CollectionPage of case studies plus a breadcrumb.
 */

const { path } = resultsPage;
const description = metaDescription(resultsPage.metaDescription);
const image = ogImageUrl(resultsPage.metaTitle, "Client results");

export const metadata: Metadata = {
  title: { absolute: seoTitle(resultsPage.metaTitle) },
  description,
  alternates: { canonical: path },
  openGraph: {
    type: "website",
    title: resultsPage.title,
    description,
    url: path,
    images: [{ url: image, width: 1200, height: 630, alt: resultsPage.metaTitle }],
  },
  twitter: { card: "summary_large_image", title: resultsPage.title, description, images: [image] },
};

// The larger outlets lead (Drama, then Balaji Dhaba, Ivoryy), then the smaller
// delivery brands.
const groups = [
  {
    id: "dine-in",
    name: "Dine-in, premium and high-volume outlets",
    description:
      "Restaurants doing lakhs a month on Swiggy and Zomato, from busy dining rooms with a high average order value to a high-volume delivery dhaba.",
    slugs: ["drama", "balaji-dhaba", "ivoryy-fusion-bar", "limitless"],
  },
  {
    id: "delivery",
    name: "Delivery brands",
    description: "Smaller delivery-led outlets, compared month on month from onboarding.",
    slugs: ["pasta-express", "regenta-inn", "tsoyum", "good-gaon"],
  },
].map((g) => ({
  ...g,
  items: g.slugs
    .map((s) => caseStudies.find((c) => c.slug === s))
    .filter((c): c is CaseStudy => Boolean(c)),
}));

const ordered = groups.flatMap((g) => g.items);

export default function ResultsPage() {
  const schema = jsonLd(
    collectionPageSchema({
      path,
      name: resultsPage.title,
      description: resultsPage.metaDescription,
      items: ordered.map((c) => ({ slug: `results#${c.slug}`, title: `${c.name}: ${c.highlight}` })),
    }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: resultsPage.shortName, path },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ================= HEADER ================= */}
      <header className="relative overflow-hidden border-b border-cream-100/8">
        <div className="grid-lines absolute inset-0 mask-fade-b opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(180,122,23,0.18),transparent_55%)]"
          aria-hidden
        />

        <div className="container-x relative py-12 lg:py-20">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-cream-500">
              <li>
                <Link href="/" className="transition-colors hover:text-gold-300">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li aria-current="page" className="text-cream-300">
                {resultsPage.shortName}
              </li>
            </ol>
          </nav>

          <Reveal immediate className="mt-8 max-w-3xl">
            <p className="eyebrow">Case studies</p>
            <h1 className="mt-6 text-[length:var(--text-display-xl)] font-bold leading-[1.0] tracking-[-0.03em]">
              {resultsPage.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-cream-300">{resultsPage.intro}</p>
            <p className="mt-5 max-w-2xl rounded-2xl border border-gold-400/25 bg-gold-500/8 px-5 py-4 text-sm leading-relaxed text-cream-200">
              {resultsPage.disclaimer}
            </p>
          </Reveal>

          <Reveal immediate delay={0.08}>
            <ul className="mt-9 flex flex-wrap gap-2.5" aria-label="Case studies">
              {ordered.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`#${c.slug}`}
                    className="inline-flex items-center rounded-full border border-cream-100/12 px-4 py-2 text-sm text-cream-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/50 hover:text-gold-300"
                  >
                    {c.name.split(/,| — /)[0]}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </header>

      {/* ================= HOW WE MEASURE ================= */}
      <section className="section-tight bg-ink-850/60" aria-labelledby="method-title">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Method</p>
            <h2 id="method-title" className="mt-5 text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              How we measure
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream-400">{resultsPage.source}</p>
          </Reveal>

          <dl className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {resultsPage.method.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.08} className="card h-full p-7">
                <dt className="font-display text-base font-semibold text-cream-50">{m.title}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-cream-400">{m.body}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ================= CASE STUDIES ================= */}
      <div className="divide-y divide-cream-100/8 border-t border-cream-100/8">
        {groups.map((group) => (
          <section
            key={group.id}
            id={group.id}
            className="section-tight scroll-mt-28"
            aria-labelledby={`${group.id}-title`}
          >
            <div className="container-x">
              <Reveal className="max-w-2xl">
                <h2
                  id={`${group.id}-title`}
                  className="text-[length:var(--text-display-md)] font-bold leading-[1.1]"
                >
                  {group.name}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-cream-400">{group.description}</p>
              </Reveal>

              <div className="mt-10 grid gap-6">
                {group.items.map((c) => (
                  <Reveal key={c.slug}>
                    <CaseStudyCard study={c} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ================= NEXT STEPS ================= */}
      <section className="section-tight border-t border-cream-100/8 bg-ink-850/60" aria-labelledby="next-title">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="card card-sheen h-full p-7 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
                  How the work is done
                </p>
                <h2 id="next-title" className="mt-3 font-display text-xl font-bold text-cream-50">
                  Swiggy &amp; Zomato sales consulting services
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-cream-400">
                  Every engagement starts with a growth audit of your live dashboards. The audit decides
                  which levers are worth pulling first for your outlet.
                </p>
                <Link href="/services" className="btn btn-gold btn-sm mt-6">
                  See our services
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <p className="mt-5 text-sm leading-relaxed text-cream-400">
                  Comparing consultants?{" "}
                  <Link
                    href="/best-restaurant-consultant-in-delhi-ncr-what-to-look-for"
                    className="font-medium text-gold-400 underline-offset-4 hover:text-gold-300 hover:underline"
                  >
                    What to look for in a restaurant consultant
                  </Link>
                  .
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="card h-full p-7 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-500">
                  The levers, explained
                </p>
                <ul className="mt-4 space-y-2">
                  {topicHubs.map((h) => (
                    <li key={h.slug}>
                      <Link
                        href={`/${h.slug}`}
                        className="inline-flex items-center gap-1.5 font-display text-lg font-semibold text-cream-100 transition-colors hover:text-gold-300"
                      >
                        {h.title}
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CTABand className="border-t border-cream-100/8" />
    </>
  );
}

function CaseStudyCard({ study: c }: { study: CaseStudy }) {
  const hasChange = c.rows.some((r) => r.change);
  return (
    <article id={c.slug} className="card card-sheen scroll-mt-28 p-7 md:p-9" aria-labelledby={`${c.slug}-title`}>
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div>
          <span className="chip">{c.highlight}</span>
          <h3 id={`${c.slug}-title`} className="mt-5 font-display text-2xl font-bold leading-tight text-cream-50">
            {c.name}
          </h3>
          <p className="mt-1.5 text-sm font-medium text-gold-400">{c.type}</p>

          <dl className="mt-6 space-y-4 text-sm leading-relaxed">
            <div>
              <dt className="font-semibold text-cream-100">Onboarding</dt>
              <dd className="mt-0.5 text-cream-400">{c.onboarded}</dd>
            </div>
            <div>
              <dt className="font-semibold text-cream-100">Period compared</dt>
              <dd className="mt-0.5 text-cream-400">{c.period}</dd>
            </div>
            <div>
              <dt className="font-semibold text-cream-100">What PFC worked on</dt>
              <dd className="mt-0.5 text-cream-400">{c.work}</dd>
            </div>
          </dl>
        </div>

        <div>
          <div className="prose-pfc">
            <div className="table-wrap">
              <table>
                <caption className="sr-only">
                  {c.name}: {c.beforeLabel} vs {c.afterLabel} ({c.period})
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Metric</th>
                    <th scope="col">{c.beforeLabel}</th>
                    <th scope="col">{c.afterLabel}</th>
                    {hasChange && <th scope="col">Change</th>}
                  </tr>
                </thead>
                <tbody>
                  {c.rows.map((r) => (
                    <tr key={r.metric}>
                      <th scope="row">{r.metric}</th>
                      <td className="tabular-nums text-cream-300">{r.before}</td>
                      <td className="tabular-nums font-semibold text-cream-50">{r.after}</td>
                      {hasChange && <td className="tabular-nums text-gold-300">{r.change ?? "—"}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {c.notes.length > 0 && (
            <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-cream-400">
              {c.notes.map((n) => (
                <li key={n.slice(0, 32)} className="border-l-2 border-gold-400/40 pl-4">
                  {n}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
