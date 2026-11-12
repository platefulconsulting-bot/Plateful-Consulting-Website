import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { CTABand } from "@/components/site/CTABand";
import { FaqList } from "@/components/site/FaqList";
import { caseStudies, cityPages, resultsPage, services, type CaseStudy, type CityPage } from "@/lib/site";
import { jsonLd, breadcrumbSchema, cityServiceSchema, faqSchema } from "@/lib/seo";
import { metaDescription, ogImageUrl, seoTitle } from "@/lib/utils";

/**
 * City landing page (/swiggy-zomato-consultant-<city>). Answers "who is a
 * Swiggy and Zomato consultant in <city>" up front, then proves it with the
 * named case studies from that city. Same visual language as the topic hubs.
 *
 * Schema: BreadcrumbList, a Service scoped to the city and the visible FAQ.
 * No Review / AggregateRating: self-published reviews are ignored or
 * penalised by Google.
 */

export function cityPageMetadata(page: CityPage): Metadata {
  const path = `/${page.slug}`;
  const description = metaDescription(page.metaDescription);
  const image = ogImageUrl(page.metaTitle, page.shortName);
  return {
    title: { absolute: seoTitle(page.metaTitle) },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: page.title,
      description,
      url: path,
      images: [{ url: image, width: 1200, height: 630, alt: page.metaTitle }],
    },
    twitter: { card: "summary_large_image", title: page.title, description, images: [image] },
  };
}

export function CityLandingPage({ page }: { page: CityPage }) {
  const path = `/${page.slug}`;
  const cases = page.cases
    .map((s) => caseStudies.find((c) => c.slug === s))
    .filter((c): c is CaseStudy => Boolean(c));
  const otherCities = cityPages.filter((c) => c.slug !== page.slug);

  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: page.shortName, path },
    ]),
    cityServiceSchema({ path, name: page.title, description: page.metaDescription, city: page.areaServed }),
    faqSchema(page.faqs),
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
              <li>
                <Link href="/services" className="transition-colors hover:text-gold-300">
                  Services
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li aria-current="page" className="text-cream-300">
                {page.shortName}
              </li>
            </ol>
          </nav>

          <Reveal immediate className="mt-8 max-w-3xl">
            <p className="eyebrow">{page.shortName}</p>
            <h1 className="mt-6 text-[length:var(--text-display-xl)] font-bold leading-[1.0] tracking-[-0.03em]">
              {page.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-cream-300">{page.intro}</p>
          </Reveal>

          <Reveal immediate delay={0.08}>
            <ul className="mt-9 flex flex-wrap gap-2.5" aria-label="Sections">
              {[
                { id: "local-results", label: "Local results" },
                { id: "delivery", label: `Delivery in ${page.shortName}` },
                { id: "services", label: "Services" },
                { id: "faq", label: "Questions" },
              ].map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-flex items-center rounded-full border border-cream-100/12 px-4 py-2 text-sm text-cream-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/50 hover:text-gold-300"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </header>

      {/* ================= LOCAL RESULTS ================= */}
      <section id="local-results" className="section-tight scroll-mt-28" aria-labelledby="local-results-title">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <h2 id="local-results-title" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              Local results
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream-400">
              Named {page.shortName} clients, from their own Swiggy and Zomato partner dashboards.{" "}
              {resultsPage.disclaimer}
            </p>
          </Reveal>

          <div className={`mt-10 grid gap-6 ${cases.length > 1 ? "md:grid-cols-2" : "max-w-3xl"}`}>
            {cases.map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.08} className="h-full">
                <LocalCaseCard study={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHAT'S DIFFERENT ================= */}
      <section
        id="delivery"
        className="section-tight scroll-mt-28 border-t border-cream-100/8 bg-ink-850/60"
        aria-labelledby="delivery-title"
      >
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <h2 id="delivery-title" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              What&apos;s different about delivery in {page.shortName}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream-400">
              Observations from our own client work in {page.shortName}, not market-wide statistics.
            </p>
          </Reveal>

          <dl className="mt-10 grid gap-6 md:grid-cols-3">
            {page.differences.map((d, i) => (
              <Reveal key={d.title} delay={i * 0.08} className="card h-full p-7">
                <dt className="font-display text-base font-semibold text-cream-50">{d.title}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-cream-400">{d.body}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ================= SERVICES + GUIDES ================= */}
      <section
        id="services"
        className="section-tight scroll-mt-28 border-t border-cream-100/8"
        aria-labelledby="services-title"
      >
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="card card-sheen h-full p-7 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
                  What we do in {page.shortName}
                </p>
                <h2 id="services-title" className="mt-3 font-display text-xl font-bold text-cream-50">
                  Swiggy &amp; Zomato consulting services
                </h2>
                <ul className="mt-4 space-y-2">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services#${s.slug}`}
                        className="text-sm text-cream-300 transition-colors hover:text-gold-300"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/services" className="btn btn-gold btn-sm mt-6">
                  See all services
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="card h-full p-7 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-500">
                  Guides worth reading
                </p>
                <ul className="mt-4 space-y-2">
                  {page.guides.map((g) => (
                    <li key={g.href}>
                      <Link
                        href={g.href}
                        className="inline-flex items-center gap-1.5 font-display text-lg font-semibold text-cream-100 transition-colors hover:text-gold-300"
                      >
                        {g.label}
                        <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={resultsPage.path}
                      className="inline-flex items-center gap-1.5 font-display text-lg font-semibold text-cream-100 transition-colors hover:text-gold-300"
                    >
                      All client results
                      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
                    </Link>
                  </li>
                </ul>
                <p className="mt-6 text-sm leading-relaxed text-cream-400">
                  Other cities:{" "}
                  {otherCities.map((c, i) => (
                    <span key={c.slug}>
                      <Link href={`/${c.slug}`} className="font-medium text-gold-400 hover:text-gold-300">
                        {c.shortName}
                      </Link>
                      {i < otherCities.length - 1 ? " · " : ""}
                    </span>
                  ))}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="section scroll-mt-28 border-t border-cream-100/8" aria-labelledby="city-faq">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">Questions</p>
              <h2 id="city-faq" className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]">
                Working with us in {page.shortName}.
              </h2>
            </Reveal>

            <FaqList items={page.faqs} name="city-faq" />
          </div>
        </div>
      </section>

      <CTABand
        className="border-t border-cream-100/8"
        title={`Grow your ${page.shortName} restaurant on Swiggy and Zomato.`}
      />
    </>
  );
}

/** Case study summary card: headline chip, first three rows, links to the full numbers. Reused on service landing pages. */
export function LocalCaseCard({ study: c }: { study: CaseStudy }) {
  return (
    <article className="card card-sheen flex h-full flex-col p-7 md:p-8" aria-labelledby={`${c.slug}-title`}>
      <span className="chip self-start">{c.highlight}</span>
      <h3 id={`${c.slug}-title`} className="mt-5 font-display text-xl font-bold leading-tight text-cream-50">
        {c.name}
      </h3>
      <p className="mt-1.5 text-sm font-medium text-gold-400">{c.type}</p>

      <dl className="mt-6 space-y-3 text-sm">
        {c.rows.slice(0, 3).map((r) => (
          <div key={r.metric} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <dt className="text-cream-400">{r.metric}</dt>
            <dd className="tabular-nums text-cream-300">
              {r.before} → <span className="font-semibold text-cream-50">{r.after}</span>
              {r.change && <span className="ml-2 text-gold-300">{r.change}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-6 text-sm">
        <Link
          href={`${resultsPage.path}#${c.slug}`}
          className="inline-flex items-center gap-1.5 font-medium text-gold-400 hover:text-gold-300"
        >
          Full numbers and caveats
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        {c.post && (
          <Link
            href={`/${c.post}`}
            className="inline-flex items-center gap-1.5 font-medium text-gold-400 hover:text-gold-300"
          >
            Read the case study
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </article>
  );
}
