import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

import { ScrollStage } from "@/components/three/ScrollStage";
import { StageSection } from "@/components/scroll/StageSection";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { CTABand } from "@/components/site/CTABand";
import { PostCard } from "@/components/site/PostCard";
import { getPostsBySlugs } from "@/lib/posts";
import { services, processSteps } from "@/lib/site";
import { jsonLd, breadcrumbSchema, serviceSchema } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Swiggy & Zomato Sales Consulting Services (Pan India)",
  description:
    "Specialised Swiggy and Zomato dine-in and delivery sales consulting: listing, onboarding, menu optimisation, aggregator ads management, food photography, Meta ads, events and licensing.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Swiggy & Zomato Sales Consulting Services (Pan India)",
    description:
      "Driving real, measurable sales growth for restaurants on aggregator platforms.",
    url: "/services",
  },
};

export default async function ServicesPage() {
  // Load every cross-linked article in one query rather than one per service.
  const allSlugs = [...new Set(services.flatMap((s) => s.relatedPosts))];
  const posts = await getPostsBySlugs(allSlugs);
  const bySlug = new Map(posts.map((p) => [p.slug, p]));

  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
    ]),
    ...services.map(serviceSchema),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <ScrollStage />

      <div className="relative z-10">
      {/* ================= HERO ================= */}
      <StageSection id="hero" chapter="menu" className="relative" ariaLabelledby="services-hero">
        <div className="container-x relative flex min-h-[70svh] flex-col justify-center py-16 lg:py-24">
          <div className="max-w-3xl">
            <Reveal immediate>
              <p className="eyebrow">Services</p>
            </Reveal>

            <Reveal immediate delay={0.05}>
              <h1
                id="services-hero"
                className="mt-6 text-[length:var(--text-display-xl)] font-bold leading-[1.0] tracking-[-0.03em]"
              >
                Specialised Swiggy &amp; Zomato{" "}
                <span className="text-gradient-gold">dine-in and delivery</span> sales
                consulting
              </h1>
            </Reveal>

            <Reveal immediate delay={0.1}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-cream-300">
                Driving real, measurable sales growth for restaurants on aggregator
                platforms — pan India. Eight services, sequenced so each one makes the next
                cheaper.
              </p>
            </Reveal>

            <Reveal immediate delay={0.15}>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/contact-us" className="btn btn-primary btn-lg">
                  Book a growth audit
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <a href="#swiggy-zomato-onboarding" className="btn btn-outline btn-lg">
                  Browse services
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </StageSection>

      {/* ================= INDEX ================= */}
      <StageSection id="index" chapter="menu" className="border-y border-cream-100/8 bg-ink-850/70 py-8" ariaLabel="Service index">
        <div className="container-x">
          <ul className="flex flex-wrap gap-2.5">
            {services.map((s) => (
              <li key={s.slug}>
                <a
                  href={`#${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-cream-100/12 px-4 py-2 text-sm text-cream-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/50 hover:text-gold-300"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: s.accent }}
                  />
                  {s.shortName}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </StageSection>

      {/* ================= SERVICE DETAIL ================= */}
      <StageSection id="details" as="div" className="divide-y divide-cream-100/8">
        {services.map((service, index) => {
          const related = service.relatedPosts
            .map((slug) => bySlug.get(slug))
            .filter((p): p is NonNullable<typeof p> => Boolean(p));

          return (
            <section
              key={service.slug}
              id={service.slug}
              className="section-tight scroll-mt-28"
              aria-labelledby={`${service.slug}-title`}
            >
              <div className="container-x">
                <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                  {/* Left: identity */}
                  <Reveal>
                    <div className="lg:sticky lg:top-28">
                      <div className="flex items-center gap-4">
                        <ServiceIcon icon={service.icon} accent={service.accent} size="lg" />
                        <span className="font-display text-sm font-bold text-cream-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <h2
                        id={`${service.slug}-title`}
                        className="mt-6 text-[length:var(--text-display-md)] font-bold leading-[1.1]"
                      >
                        {service.name}
                      </h2>

                      <p className="mt-4 text-base leading-relaxed text-cream-300">
                        {service.summary}
                      </p>

                      <div
                        className="mt-6 rounded-xl border-l-2 py-2 pl-4"
                        style={{ borderColor: service.accent }}
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream-500">
                          Outcome
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-cream-100">
                          {service.outcome}
                        </p>
                      </div>
                    </div>
                  </Reveal>

                  {/* Right: substance */}
                  <div>
                    <Reveal delay={0.08}>
                      <p className="text-lg leading-relaxed text-cream-200">
                        {service.description}
                      </p>
                    </Reveal>

                    <Reveal delay={0.14}>
                      <h3 className="mt-9 font-display text-sm font-semibold uppercase tracking-[0.16em] text-gold-400">
                        What you get
                      </h3>
                      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                        {service.deliverables.map((d) => (
                          <li
                            key={d}
                            className="flex items-start gap-3 rounded-xl border border-cream-100/7 bg-ink-850/60 p-4 text-sm leading-relaxed text-cream-300"
                          >
                            <Check
                              className="mt-0.5 h-4 w-4 shrink-0"
                              style={{ color: service.accent }}
                              aria-hidden
                            />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </Reveal>

                    {related.length > 0 && (
                      <Reveal delay={0.2}>
                        <h3 className="mt-10 font-display text-sm font-semibold uppercase tracking-[0.16em] text-gold-400">
                          Read more on this
                        </h3>
                        <ul className="mt-4 space-y-1">
                          {related.map((post) => (
                            <li key={post.slug}>
                              <Link
                                href={`/${post.slug}`}
                                className="group flex items-start justify-between gap-4 rounded-xl border border-transparent p-3.5 transition-colors hover:border-cream-100/10 hover:bg-cream-100/4"
                              >
                                <span className="text-sm font-medium leading-snug text-cream-200 transition-colors group-hover:text-gold-300">
                                  {post.title}
                                </span>
                                <ArrowUpRight
                                  className="mt-0.5 h-4 w-4 shrink-0 text-cream-500 transition-colors group-hover:text-gold-400"
                                  aria-hidden
                                />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </Reveal>
                    )}

                    <Reveal delay={0.26}>
                      <Link
                        href={`/contact-us?service=${service.slug}`}
                        className="btn btn-outline mt-8"
                      >
                        Discuss {service.shortName.toLowerCase()}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </Reveal>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </StageSection>

      {/* ================= PROCESS ================= */}
      <StageSection id="results" chapter="bars" className="section border-t border-cream-100/8 bg-ink-850/60" ariaLabelledby="svc-process">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">The engagement</p>
            <h2 id="svc-process" className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]">
              What working together looks like.
            </h2>
          </Reveal>

          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.1} as="li">
                <div className="card h-full p-7">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-4xl font-bold leading-none text-gold-500/35">
                      {step.step}
                    </span>
                    <span className="chip">{step.duration}</span>
                  </div>
                  <h3 className="mt-6 font-display text-lg font-semibold text-cream-50">
                    {step.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-gold-400">{step.headline}</p>
                  <p className="mt-3.5 text-sm leading-relaxed text-cream-400">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </StageSection>

      {/* ================= RELATED READING ================= */}
      {posts.length > 0 && (
        <section className="section border-t border-cream-100/8" aria-labelledby="svc-reading">
          <div className="container-x">
            <Reveal className="max-w-2xl">
              <p className="eyebrow">Before you decide</p>
              <h2 id="svc-reading" className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]">
                See how we think, first.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-cream-300">
                Every one of these is the same analysis we would run on your outlet. Read a
                few before you call us.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((post, i) => (
                <Reveal key={post.id} delay={i * 0.08} className="h-full">
                  <PostCard post={post} className="h-full" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABand className="border-t border-cream-100/8" />
      </div>
    </>
  );
}
