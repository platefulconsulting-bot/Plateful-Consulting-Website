import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Phone } from "lucide-react";

import { ScrollStage } from "@/components/three/ScrollStage";
import { StageSection } from "@/components/scroll/StageSection";
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { PostCard } from "@/components/site/PostCard";
import { ServiceCarousel } from "@/components/site/ServiceCarousel";
import { CTABand } from "@/components/site/CTABand";
import { PlatformBand, PlatformChips } from "@/components/site/PlatformBand";
import { ClientMarquee, ClientGrid } from "@/components/site/ClientWall";
import { getFeaturedPosts, getPostCount } from "@/lib/posts";
import { stats, processSteps, testimonials, contact, site } from "@/lib/site";

export const revalidate = 3600;

export default async function HomePage() {
  const [posts, postCount] = await Promise.all([getFeaturedPosts(3), getPostCount()]);

  return (
    <>
      {/* The 3D world sits behind the entire page and is driven by scroll.
          Everything below is ordinary DOM at z-10, so the copy stays readable,
          selectable and crawlable with the canvas removed. */}
      <ScrollStage />

      <div className="relative z-10">
        {/* =====================================================================
            HERO
            ===================================================================== */}
        <StageSection id="hero" chapter="chart" className="relative" ariaLabelledby="hero-title">
          <div className="container-x relative flex min-h-[calc(100svh-6rem)] flex-col justify-center py-16 lg:py-20">
            <div className="max-w-3xl">
            <Reveal immediate>
              <PlatformChips />
            </Reveal>

            <Reveal immediate delay={0.05}>
              {/* One step down from the display-2xl scale: the full keyword
                  phrase is six words, and at the largest size it ran to five
                  lines and pushed the buttons under the fold. */}
              <h1
                id="hero-title"
                className="mt-6 text-[length:var(--text-display-xl)] font-bold leading-[0.98] tracking-[-0.03em]"
              >
                Swiggy and Zomato{" "}
                <span className="text-gradient-gold">Restaurant Sales Consultant</span>{" "}
                in India
              </h1>
            </Reveal>

            <Reveal immediate delay={0.1}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-cream-300 md:text-xl">
                Listing, onboarding, menu optimisation, aggregator ads management and
                structured sales growth systems for restaurants across India — built on the
                signals the algorithms actually reward.
              </p>
            </Reveal>

            <Reveal immediate delay={0.15}>
              <p className="accent-serif mt-5 text-xl text-gold-300 md:text-2xl">
                &ldquo;{site.tagline}&rdquo;
              </p>
            </Reveal>

            <Reveal immediate delay={0.2}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/contact-us" className="btn btn-primary btn-lg">
                  Book a growth audit
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <a href={contact.primaryPhone.href} className="btn btn-outline btn-lg">
                  <Phone className="h-4 w-4" aria-hidden />
                  Talk to us
                </a>
              </div>
            </Reveal>

            <Reveal immediate delay={0.26}>
              <ul className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-cream-400">
                {[
                  "650+ restaurants scaled",
                  "PAN India",
                  "7+ years on the platforms",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              </Reveal>
            </div>

            {/* Scroll cue: the page is a journey, so say so. */}
            <Reveal immediate delay={0.5} direction="none" className="mt-16 lg:mt-20">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-cream-500">
                <span
                  aria-hidden
                  className="relative flex h-9 w-5 items-start justify-center rounded-full border border-cream-100/25 pt-1.5"
                >
                  <span className="h-1.5 w-1 animate-bounce rounded-full bg-gold-400" />
                </span>
                Scroll — watch the line climb
              </div>
            </Reveal>
          </div>
        </StageSection>

        {/* Client logo strip */}
        <div className="relative border-y border-cream-100/8 bg-ink-850/70 py-7">
          <div className="container-x mb-5">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-cream-500">
              Trusted by restaurants, cafés and bars across India
            </p>
          </div>
          <ClientMarquee />
        </div>

      {/* =====================================================================
          STATS
          ===================================================================== */}
      <StageSection id="stats" chapter="chart" className="section-tight" ariaLabel="Key figures">
        <div className="container-x">
          <dl className="grid gap-px overflow-hidden rounded-3xl border border-cream-100/8 bg-cream-100/8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 0.08}
                className="bg-ink-850/80 p-7 transition-colors duration-500 hover:bg-ink-800/90"
              >
                <dd className="font-display text-[length:var(--text-display-md)] font-bold leading-none text-gradient-gold">
                  {stat.display ?? (
                    <Counter value={stat.value ?? 0} suffix={stat.suffix} decimals={stat.decimals} />
                  )}
                </dd>
                <dt className="mt-4 font-display text-base font-semibold text-cream-50">
                  {stat.label}
                </dt>
                <p className="mt-1.5 text-sm leading-relaxed text-cream-500">{stat.detail}</p>
              </Reveal>
            ))}
          </dl>
        </div>
      </StageSection>

      {/* =====================================================================
          PLATFORMS — establishes the specialism before anything else
          ===================================================================== */}
      <StageSection id="platforms" chapter="engines" as="div">
        <PlatformBand className="border-y border-cream-100/8" />
      </StageSection>

      {/* =====================================================================
          THE PROBLEM — gives the visitor a reason to keep reading
          ===================================================================== */}
      <StageSection id="problem" chapter="engines" className="section" ariaLabelledby="problem-title">
        <div className="container-x">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">The real problem</p>
              <h2
                id="problem-title"
                className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
              >
                Most restaurants don&rsquo;t have a demand problem. They have a{" "}
                <span className="text-gradient-gold">visibility problem.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-cream-300">
                The orders are being placed. They are just going to the listing three
                positions above yours — the one with a faster prep time, a cleaner menu and
                a rating that crossed the threshold where the algorithm starts trusting it.
              </p>
              <Link
                href="/why-most-restaurants-fail-on-swiggy-and-zomato-and-how-to-fix-it"
                className="mt-7 inline-flex items-center gap-2 font-semibold text-gold-400 transition-colors hover:text-gold-300"
              >
                Read why most restaurants stall
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>

            <div className="space-y-4">
              {[
                {
                  n: "01",
                  title: "The listing is working against you",
                  body: "Incomplete menus, missing photography, a serviceability radius set too wide, prep times nobody has revisited since launch. Each one is a ranking signal quietly marking you down.",
                  link: {
                    href: "/swiggy-listing-optimization-the-complete-guide-for-restaurant-owners",
                    label: "Listing optimisation guide",
                  },
                },
                {
                  n: "02",
                  title: "Ad spend is buying the same problem, louder",
                  body: "Advertising amplifies whatever your listing already does. Push budget at a page that converts poorly and you pay a premium for the same disappointing result.",
                  link: {
                    href: "/swiggy-ads-strategy-how-to-get-5x-roas-without-wasting-budget",
                    label: "Ads strategy without the waste",
                  },
                },
                {
                  n: "03",
                  title: "Growth in orders isn’t growth in profit",
                  body: "Commission, discounts, packaging and ad spend stack up. Plenty of restaurants scale their order count and shrink their margin at the same time without noticing.",
                  link: {
                    href: "/zomato-commission-structure-2026-what-restaurants-actually-pay",
                    label: "What restaurants actually pay",
                  },
                },
              ].map((item, i) => (
                <Reveal key={item.n} delay={i * 0.1}>
                  <div className="card card-hover group p-7">
                    <div className="flex items-start gap-5">
                      <span className="font-display text-sm font-bold text-gold-500">
                        {item.n}
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-cream-50">
                          {item.title}
                        </h3>
                        <p className="mt-2.5 leading-relaxed text-cream-400">{item.body}</p>
                        <Link
                          href={item.link.href}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 transition-colors hover:text-gold-300"
                        >
                          {item.link.label}
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </StageSection>

      {/* =====================================================================
          SERVICES — pinned; the ring turns once, then the page moves on.
          No stage chapter: the ring is the set piece here, so the 3D
          backdrop steps aside instead of competing with it.
          ===================================================================== */}
      <ServiceCarousel />

      {/* =====================================================================
          PROCESS
          ===================================================================== */}
      <StageSection id="process" chapter="bars" className="section border-y border-cream-100/8 bg-ink-850/70" ariaLabelledby="process-title">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">How we work</p>
            <h2
              id="process-title"
              className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
            >
              Diagnose. Plan. Execute. Report.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream-300">
              No twelve-week discovery phase. The audit runs in week one because the data is
              already sitting in your dashboards.
            </p>
          </Reveal>

          <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.1} as="li" className="relative">
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

                {/* Connector between steps on wide screens */}
                {i < processSteps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-3 top-1/2 hidden h-px w-6 bg-gradient-to-r from-gold-500/50 to-transparent lg:block"
                  />
                )}
              </Reveal>
            ))}
          </ol>
        </div>
      </StageSection>

      {/* =====================================================================
          CLIENTS — the logo wall, given real weight
          ===================================================================== */}
      <StageSection id="clients" chapter="bars" className="section border-t border-cream-100/8" ariaLabelledby="clients-title">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Brands we have scaled</p>
            <h2
              id="clients-title"
              className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
            >
              Kitchens, cafés and bars that already run on this playbook.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream-300">
              From a single dessert counter to multi-outlet chains — across QSR, casual
              dining, cloud kitchens and premium bars.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ClientGrid className="mt-14" />
          </Reveal>
        </div>
      </StageSection>

      {/* =====================================================================
          RESULTS
          ===================================================================== */}
      <StageSection id="results" chapter="bars" className="section" ariaLabelledby="results-title">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">In their words</p>
            <h2
              id="results-title"
              className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
            >
              Results our clients reported.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {testimonials.map((t, i) => (
              <Reveal key={t.author} delay={i * 0.08}>
                <figure className="card card-hover card-sheen flex h-full flex-col p-8">
                  <span className="chip self-start">{t.highlight}</span>

                  <blockquote className="mt-6 flex-1">
                    <p className="accent-serif text-xl leading-relaxed text-cream-100 md:text-2xl">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </blockquote>

                  <figcaption className="mt-7 flex items-center gap-3.5 border-t border-cream-100/8 pt-6">
                    <span
                      aria-hidden
                      className="grid h-11 w-11 place-items-center rounded-full bg-gold-500/15 font-display text-sm font-bold text-gold-300"
                    >
                      {t.author
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </span>
                    <span>
                      <span className="block font-display font-semibold text-cream-50">
                        {t.author}
                      </span>
                      <span className="block text-sm text-cream-500">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8">
            <p className="text-sm text-cream-500">
              Figures are as reported by the businesses themselves. Results vary by city,
              cuisine, price point and starting position.
            </p>
          </Reveal>
        </div>
      </StageSection>

      {/* =====================================================================
          INSIGHTS — pushes visitors into the blog
          ===================================================================== */}
      <StageSection id="insights" className="section border-t border-cream-100/8" ariaLabelledby="insights-title">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal className="max-w-2xl">
              <p className="eyebrow">Insights</p>
              <h2
                id="insights-title"
                className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
              >
                The playbook, published.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-cream-300">
                {postCount} in-depth guides on how the platforms actually rank, price and
                charge you — written from inside real partner dashboards, on live
                accounts.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <Link href="/blogs" className="btn btn-outline">
                All articles
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.08} className="h-full">
                <PostCard post={post} className="h-full" priority={i === 0} />
              </Reveal>
            ))}
          </div>
        </div>
      </StageSection>

        <StageSection id="cta" chapter="orbit" as="div">
          <CTABand className="border-t border-cream-100/8" />
        </StageSection>
      </div>
    </>
  );
}
