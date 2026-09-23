import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Quote } from "lucide-react";

import { ScrollStage } from "@/components/three/ScrollStage";
import { StageSection } from "@/components/scroll/StageSection";
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { CTABand } from "@/components/site/CTABand";
import { founders, stats, cities, site, services, contact } from "@/lib/site";
import { jsonLd, breadcrumbSchema, organizationSchema } from "@/lib/seo";
import { ClientGrid } from "@/components/site/ClientWall";
import { PlatformBand } from "@/components/site/PlatformBand";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Us — Swiggy & Zomato Sales Growth Consultants",
  description:
    "Plateful Consulting is a specialist Swiggy and Zomato restaurant sales consulting firm helping restaurants grow consistent, high-margin revenue. 650+ restaurants, PAN India, 7+ years.",
  alternates: { canonical: "/about-us" },
  openGraph: {
    title: "About Plateful Consulting",
    description: "We don't manage platforms. We drive sales.",
    url: "/about-us",
  },
};

/** The operating beliefs that shape how engagements actually run. */
const principles = [
  {
    title: "Diagnosis before prescription",
    body: "Every proposal starts after we have read your dashboards. Half the restaurants that approach us for ads grow faster from a corrected prep time and forty items trimmed off a bloated menu — so that is what we recommend.",
  },
  {
    title: "Margin is the metric that counts",
    body: "It is trivial to grow order count by discounting into a loss. We report on net realisation after commission, packaging and ad spend, because that is the number that pays salaries.",
  },
  {
    title: "Hands on the execution",
    body: "Menus get restructured, descriptions get rewritten, campaigns get bid-managed weekly. A strategy document that nobody executes is an expensive PDF.",
  },
  {
    title: "Repeatable beats clever",
    body: "Anything that works in one kitchen has to survive being handed to the next twenty. Every play we build is written down, measured, and defensible in a P&L review.",
  },
];

export default function AboutPage() {
  const schema = jsonLd(
    organizationSchema(),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about-us" },
    ]),
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
      <StageSection id="hero" chapter="orbit" className="relative" ariaLabelledby="about-hero">
        <div className="container-x relative flex min-h-[70svh] flex-col justify-center py-16 lg:py-24">
          <div className="max-w-3xl">
            <Reveal immediate>
              <p className="eyebrow">About us</p>
            </Reveal>

            <Reveal immediate delay={0.05}>
              <h1
                id="about-hero"
                className="mt-6 text-[length:var(--text-display-xl)] font-bold leading-[1.0] tracking-[-0.03em]"
              >
                Swiggy &amp; Zomato sales growth consultants for{" "}
                <span className="text-gradient-gold">delivery &amp; dine-in</span>
              </h1>
            </Reveal>

            <Reveal immediate delay={0.1}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-cream-300">
                {site.name} is a specialised Swiggy and Zomato online sales consulting firm
                dedicated to helping restaurants grow consistent, high-margin revenue on
                food aggregator platforms.
              </p>
            </Reveal>

            <Reveal immediate delay={0.15}>
              <p className="accent-serif mt-6 text-2xl text-gold-300 md:text-3xl">
                &ldquo;{site.tagline}&rdquo;
              </p>
            </Reveal>
          </div>
        </div>
      </StageSection>

      {/* ================= STATS ================= */}
      <section className="border-y border-cream-100/8 bg-ink-850/50" aria-label="Track record">
        <div className="container-x">
          <dl className="grid divide-y divide-cream-100/8 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-cream-100/8">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08} className="py-9 lg:px-8 lg:first:pl-0">
                <dd className="font-display text-[length:var(--text-display-md)] font-bold leading-none text-gradient-gold">
                  {stat.display ?? (
                    <Counter value={stat.value ?? 0} suffix={stat.suffix} decimals={stat.decimals} />
                  )}
                </dd>
                <dt className="mt-3.5 font-display text-base font-semibold text-cream-50">
                  {stat.label}
                </dt>
                <p className="mt-1.5 text-sm text-cream-500">{stat.detail}</p>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="section" aria-labelledby="story-title">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">Our position</p>
              <h2
                id="story-title"
                className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
              >
                A specialist practice, focused on one thing.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-6 text-lg leading-relaxed text-cream-300">
                <p>
                  Most restaurants in India now earn a decisive share of their revenue
                  through Swiggy and Zomato — and almost none of them have anyone whose job
                  it is to understand how those platforms decide who gets seen.
                </p>
                <p>
                  That gap is the entire reason this firm exists. We work inside partner
                  dashboards every day, across{" "}
                  <span className="text-cream-100">
                    QSRs, cloud kitchens, casual dining and premium dine-in brands
                  </span>
                  , which means we recognise the patterns: the prep time that quietly
                  throttles visibility, the menu that converts at half the rate it should,
                  the ad budget spending itself against an already-saturated slot.
                </p>
                <p>
                  Aggregator growth is the whole practice — the only thing we sell, and
                  the only thing we are measured on. It is also why every restaurant gets a
                  straight read on what it actually needs: candour there costs us a retainer
                  and earns the referral.
                </p>
                <p className="border-l-2 border-gold-500 pl-6 text-cream-100">
                  Over seven years we have worked with{" "}
                  <strong className="text-gold-300">650+ restaurants PAN India</strong>, from
                  single-outlet kitchens to multi-city brands.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= FOUNDERS ================= */}
      <section className="section border-y border-cream-100/8 bg-ink-850/40" aria-labelledby="founders-title">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Leadership</p>
            <h2
              id="founders-title"
              className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
            >
              The people doing the work.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream-300">
              Plateful is led by <strong className="text-cream-50">Deepak Desh Bandhu</strong>.
              He runs the engagements, reads the dashboards and owns the numbers — when you
              work with Plateful, you work with Deepak.
            </p>
          </Reveal>

          {/* Deepak leads, so his card gets the weight — two columns to Saurav's one. */}
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {founders.map((person, i) => (
              <Reveal
                key={person.slug}
                delay={i * 0.1}
                className={person.lead ? "lg:col-span-2" : ""}
              >
                <article
                  className={cn(
                    "card h-full p-8 md:p-10",
                    person.lead ? "card-hover card-sheen" : "bg-ink-850/60",
                  )}
                >
                  <div className="flex items-start gap-5">
                    <span
                      aria-hidden
                      className={cn(
                        "grid shrink-0 place-items-center rounded-2xl font-display font-bold",
                        person.lead
                          ? "h-20 w-20 bg-gradient-to-br from-gold-300/30 to-ember-500/20 text-2xl text-gold-300"
                          : "h-14 w-14 bg-cream-100/8 text-lg text-cream-300",
                      )}
                    >
                      {person.name
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </span>
                    <div>
                      {person.lead && (
                        <span className="chip mb-2.5">Leads every engagement</span>
                      )}
                      <h3
                        className={cn(
                          "font-display font-bold text-cream-50",
                          person.lead ? "text-2xl md:text-3xl" : "text-lg",
                        )}
                      >
                        {person.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-gold-400">{person.role}</p>
                    </div>
                  </div>

                  <p
                    className={cn(
                      "mt-6 leading-relaxed",
                      person.lead ? "text-lg text-cream-200" : "text-cream-400",
                    )}
                  >
                    {person.bio}
                  </p>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {person.focus.map((f) => (
                      <li key={f} className="chip">
                        {f}
                      </li>
                    ))}
                  </ul>

                  {person.lead && (
                    <div className="mt-8 flex flex-wrap gap-3">
                      <a href={contact.primaryPhone.href} className="btn btn-gold btn-sm">
                        <Phone className="h-4 w-4" aria-hidden />
                        Talk to Deepak — {contact.primaryPhone.label}
                      </a>
                    </div>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRINCIPLES ================= */}
      <StageSection id="results" chapter="bars" className="section" ariaLabelledby="principles-title">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">How we operate</p>
            <h2
              id="principles-title"
              className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
            >
              Four things we refuse to compromise on.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={(i % 2) * 0.08}>
                <div className="card h-full p-8">
                  <Quote className="h-6 w-6 text-gold-500/60" aria-hidden />
                  <h3 className="mt-5 font-display text-lg font-semibold text-cream-50">
                    {p.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-cream-400">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </StageSection>

      {/* ================= CLIENTS ================= */}
      <section className="section border-t border-cream-100/8" aria-labelledby="about-clients">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Who we work with</p>
            <h2
              id="about-clients"
              className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
            >
              The brands behind the numbers.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <ClientGrid className="mt-14" />
          </Reveal>
        </div>
      </section>

      {/* ================= PLATFORMS ================= */}
      <StageSection id="platforms" chapter="engines" as="div">
        <PlatformBand className="border-t border-cream-100/8" />
      </StageSection>

      {/* ================= REACH ================= */}
      <section className="section border-t border-cream-100/8 bg-ink-850/40" aria-labelledby="reach-title">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <Reveal>
              <p className="eyebrow">Where we work</p>
              <h2
                id="reach-title"
                className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
              >
                PAN India, one operating model.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-cream-300">
                Aggregator work is largely remote — the dashboards are the same wherever the
                kitchen is. Photography, events and on-ground operational work are scheduled
                on site.
              </p>

              <ul className="mt-8 flex flex-wrap gap-2.5">
                {cities.map((city) => (
                  <li
                    key={city}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cream-100/12 px-3.5 py-1.5 text-sm text-cream-300"
                  >
                    <MapPin className="h-3.5 w-3.5 text-gold-500" aria-hidden />
                    {city}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/services" className="btn btn-gold">
                  See our services
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/blogs" className="btn btn-outline">
                  Read the playbook
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="card card-sheen p-8">
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-gold-400">
                  What we cover
                </h3>
                <ul className="mt-6 divide-y divide-cream-100/8">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services#${s.slug}`}
                        className="group flex items-center justify-between gap-4 py-3.5 text-sm transition-colors"
                      >
                        <span className="text-cream-200 transition-colors group-hover:text-gold-300">
                          {s.name}
                        </span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-cream-500 transition-all group-hover:translate-x-0.5 group-hover:text-gold-400"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CTABand
        className="border-t border-cream-100/8"
        eyebrow="Work with us"
        title="Tell us what your dashboards are showing you."
        body="Send us your city, cuisine and current monthly orders. We will tell you honestly whether there is room to grow and where it is hiding."
      />
      </div>
    </>
  );
}
