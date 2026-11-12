import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Activity,
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  ListChecks,
  PhoneCall,
  Search,
  ShieldCheck,
  Star,
  Target,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/site/ContactForm";
import { FaqList } from "@/components/site/FaqList";
import { contact } from "@/lib/site";
import { jsonLd, breadcrumbSchema, faqSchema, landingServiceSchema } from "@/lib/seo";
import { metaDescription, ogImageUrl, seoTitle } from "@/lib/utils";

/**
 * /free-growth-audit: lead page for the free Swiggy and Zomato growth audit.
 * The form is the shared ContactForm in its "audit" variant, posting to
 * /api/contact with source "free-growth-audit" plus outlets and platforms.
 *
 * Schema: BreadcrumbList, Service (free offer) and the visible FAQ.
 */

const PATH = "/free-growth-audit";
const TITLE = "Free Swiggy & Zomato growth audit";
const META_TITLE = "Free Swiggy & Zomato Growth Audit";
const DESCRIPTION = metaDescription(
  "Free Swiggy and Zomato growth audit for restaurants: listing, menu, pricing vs commission, offers, ads, ratings and ops vs your peers, in a 3-page report.",
);

export const metadata: Metadata = {
  title: { absolute: seoTitle(META_TITLE) },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    images: [{ url: ogImageUrl(META_TITLE, "Free audit"), width: 1200, height: 630, alt: META_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [ogImageUrl(META_TITLE, "Free audit")],
  },
};

const reassurance = [
  { icon: PhoneCall, text: "We call within 24 hours on working days" },
  { icon: FileText, text: "A 3-page report you keep either way" },
  { icon: ShieldCheck, text: "No logins needed to start" },
  { icon: CheckCircle2, text: "No retainer, no obligation" },
];

const checks = [
  {
    icon: Search,
    title: "Listing",
    body: "Name, cuisine tags, cover image, timings and serviceability: whether customers can find you and what they see first.",
  },
  {
    icon: UtensilsCrossed,
    title: "Menu",
    body: "Category order, bestsellers, descriptions, photos, variants and add-ons, and where browsers drop off instead of ordering.",
  },
  {
    icon: Wallet,
    title: "Pricing vs commission",
    body: "Whether your app prices still leave a margin once commission (usually somewhere in the 15–30% range, plus GST), packaging and discounts come off.",
  },
  {
    icon: BadgePercent,
    title: "Offers",
    body: "Which live offers pay for themselves and which need more extra orders than they can bring in.",
  },
  {
    icon: Target,
    title: "Ads",
    body: "How spend is split by platform and time of day, and whether the orders it buys are worth what they cost.",
  },
  {
    icon: Star,
    title: "Ratings",
    body: "Rating level and trend, review replies, and the complaint patterns that keep coming back.",
  },
  {
    icon: Activity,
    title: "Ops",
    body: "Online availability, prep time, item stock-outs and cancellations: the signals the platforms rank on.",
  },
  {
    icon: Users,
    title: "Competitor peers",
    body: "Your listing next to the nearest restaurants in the same cuisine and price band, not a national average.",
  },
];

const reportPages = [
  {
    page: "Page 1",
    title: "Where you stand",
    body: "A scorecard of your Swiggy and Zomato listings against your closest peers, area by area.",
  },
  {
    page: "Page 2",
    title: "What is leaking",
    body: "The issues costing you orders or margin, ranked by how much they matter and how quickly they can be fixed.",
  },
  {
    page: "Page 3",
    title: "What to fix first",
    body: "A short 30-day action list. Do it yourself, hand it to your team, or ask us to run it.",
  },
];

const timeline = [
  { step: "1 minute", body: "Fill in the form below." },
  { step: "Within 24 hours", body: "We call you on working days to confirm your outlet and what worries you most." },
  { step: "On the call", body: "We go through ads, payouts and ops with you, on your own dashboard if you want that covered." },
  { step: "Usually within 2 working days", body: "Your 3-page report, walked through with you so every finding is clear." },
];

/** Illustrative format only. Not a real client and no real figures. */
const sampleFindings = [
  {
    area: "Menu",
    finding: "Bestsellers sit in the fourth category, below a long list of combos.",
    why: "Customers who do not see a familiar dish quickly tend to leave the menu without ordering.",
    fix: "Move the top items into a recommended section and trim the categories above them.",
    priority: "High",
  },
  {
    area: "Offers",
    finding: "A deep percentage discount runs all week, including peak hours.",
    why: "It needs many more orders to break even than it is bringing in, so it costs margin at peak.",
    fix: "Switch to a threshold offer and keep it to the slow day-parts.",
    priority: "High",
  },
  {
    area: "Ops",
    finding: "The outlet goes offline for short spells during dinner on several days.",
    why: "Availability is a ranking signal, and missed dinner slots are lost orders.",
    fix: "Agree a stock and staffing checklist with the kitchen before the dinner rush.",
    priority: "Medium",
  },
];

const faqs = [
  {
    q: "Is the Swiggy and Zomato growth audit really free?",
    a: "Yes. There is no fee and no retainer attached. You keep the 3-page report whether or not you work with us afterwards.",
  },
  {
    q: "What do you need from me for the audit?",
    a: "Your name, mobile number, restaurant name, city, number of outlets and which platforms you are on. Most checks run on your public Swiggy and Zomato listings, so you do not need to share logins to start.",
  },
  {
    q: "How long does the audit take?",
    a: "The form takes about a minute and we call within 24 hours on working days. The report usually follows within two working days of that call, and we walk you through it.",
  },
  {
    q: "Will you change anything on my Swiggy or Zomato account?",
    a: "No. The audit only reads your listings, and your dashboard if you choose to show it. Nothing on your account changes unless you hire us and approve the change in writing.",
  },
  {
    q: "Who qualifies for the free audit?",
    a: "Restaurants, cloud kitchens and chains anywhere in India that are live on Swiggy, Zomato or both, or about to list. If you are not listed yet, we audit your planned menu and pricing against the peers you will compete with. Plateful Consulting is independent and not an official partner of Swiggy or Zomato.",
  },
];

export default function FreeGrowthAuditPage() {
  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Free growth audit", path: PATH },
    ]),
    landingServiceSchema({
      path: PATH,
      name: TITLE,
      description: DESCRIPTION,
      serviceType: "Swiggy and Zomato restaurant growth audit",
      free: true,
    }),
    faqSchema(faqs),
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ================= HERO + FORM ================= */}
      <header className="relative overflow-hidden border-b border-cream-100/8">
        <div className="grid-lines absolute inset-0 mask-fade-b opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(234,85,43,0.15),transparent_55%)]"
          aria-hidden
        />

        <div className="container-x relative grid gap-10 py-12 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-20">
          <div>
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-cream-500">
                <li>
                  <Link href="/" className="transition-colors hover:text-gold-300">
                    Home
                  </Link>
                </li>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                <li aria-current="page" className="text-cream-300">
                  Free growth audit
                </li>
              </ol>
            </nav>

            <Reveal immediate className="mt-8">
              <p className="eyebrow">Free audit</p>
              <h1 className="mt-6 text-[length:var(--text-display-xl)] font-bold leading-[1.0] tracking-[-0.03em]">
                Free Swiggy &amp; Zomato growth audit
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-cream-300">
                We check your Swiggy and Zomato listings against your nearest competitors: listing, menu, pricing
                against commission, offers, ads, ratings and ops. You get a 3-page report on what is costing you
                orders or margin and what to fix first. It is free, and it comes from a team that has worked with
                650+ restaurants and managed ₹8Cr+ in aggregator ad spend.
              </p>
            </Reveal>

            <Reveal immediate delay={0.06}>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {reassurance.map((r) => (
                  <li key={r.text} className="flex items-start gap-3 text-sm text-cream-200">
                    <r.icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                    {r.text}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-cream-500">
                Prefer to talk now?{" "}
                <a href={contact.primaryPhone.href} className="font-medium text-gold-300 hover:text-gold-200">
                  {contact.primaryPhone.label}
                </a>{" "}
                ·{" "}
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gold-300 hover:text-gold-200"
                >
                  WhatsApp
                </a>
              </p>
            </Reveal>
          </div>

          <Reveal immediate delay={0.08}>
            <div id="audit-form" className="card card-sheen scroll-mt-28 p-6 md:p-9">
              <h2 className="font-display text-xl font-bold text-cream-50">Request your free audit</h2>
              <p className="mt-2 text-sm text-cream-400">Takes a minute. No obligation, no retainer.</p>
              <div className="mt-7">
                <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-ink-800/60" />}>
                  <ContactForm variant="audit" />
                </Suspense>
              </div>
            </div>
          </Reveal>
        </div>
      </header>

      {/* ================= WHAT IT CHECKS ================= */}
      <section className="section-tight" aria-labelledby="checks-title">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <h2 id="checks-title" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              What the audit checks
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream-400">
              Eight areas, each compared with the restaurants you actually compete with for the same customers.
            </p>
          </Reveal>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {checks.map((c, i) => (
              <Reveal as="li" key={c.title} delay={(i % 4) * 0.06} className="card h-full p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500/12 text-gold-300">
                  <c.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-cream-50">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-400">{c.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= WHAT YOU GET + HOW LONG ================= */}
      <section className="section-tight border-t border-cream-100/8 bg-ink-850/60" aria-labelledby="report-title">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Reveal>
                <h2 id="report-title" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
                  What you get: a 3-page report
                </h2>
              </Reveal>
              <ol className="mt-8 space-y-4">
                {reportPages.map((p, i) => (
                  <Reveal as="li" key={p.page} delay={i * 0.06} className="card p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">{p.page}</p>
                    <h3 className="mt-2 font-display text-lg font-semibold text-cream-50">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-cream-400">{p.body}</p>
                  </Reveal>
                ))}
              </ol>
            </div>

            <div>
              <Reveal>
                <h2 className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">How long it takes</h2>
              </Reveal>
              <ol className="mt-8 space-y-5">
                {timeline.map((t, i) => (
                  <Reveal as="li" key={t.step} delay={i * 0.06} className="flex items-start gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold-400/40 text-gold-300">
                      <Clock className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <p className="font-display font-semibold text-cream-50">{t.step}</p>
                      <p className="mt-1 text-sm leading-relaxed text-cream-400">{t.body}</p>
                    </div>
                  </Reveal>
                ))}
              </ol>

              <Reveal className="card mt-10 p-6">
                <h3 className="font-display text-lg font-semibold text-cream-50">Who qualifies</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-cream-400">
                  <li className="flex gap-2">
                    <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                    Restaurants, cloud kitchens, QSR brands and chains anywhere in India.
                  </li>
                  <li className="flex gap-2">
                    <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                    Live on Swiggy, Zomato or both, from a single outlet to 20+.
                  </li>
                  <li className="flex gap-2">
                    <ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                    Not listed yet? We audit your planned menu and pricing against the peers you will face.
                  </li>
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SAMPLE FINDINGS ================= */}
      <section className="section-tight border-t border-cream-100/8" aria-labelledby="sample-title">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <h2 id="sample-title" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              What a finding looks like
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream-400">
              Every finding in the report follows the same format. These are illustrative examples of the format,
              not a real client.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {sampleFindings.map((f, i) => (
              <Reveal key={f.area} delay={i * 0.06} className="card h-full p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="chip">{f.area}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-500">
                    Priority: <span className="text-gold-300">{f.priority}</span>
                  </span>
                </div>
                <dl className="mt-5 space-y-3 text-sm leading-relaxed">
                  <div>
                    <dt className="font-semibold text-cream-100">What we found</dt>
                    <dd className="mt-1 text-cream-400">{f.finding}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-cream-100">Why it matters</dt>
                    <dd className="mt-1 text-cream-400">{f.why}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-cream-100">The fix</dt>
                    <dd className="mt-1 text-cream-400">{f.fix}</dd>
                  </div>
                </dl>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="section border-t border-cream-100/8" aria-labelledby="audit-faq">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">Questions</p>
              <h2 id="audit-faq" className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]">
                About the free audit.
              </h2>
              <p className="mt-6 leading-relaxed text-cream-400">
                Looking for someone to run your accounts week to week? See our{" "}
                <Link
                  href="/swiggy-zomato-account-management"
                  className="font-medium text-gold-300 underline-offset-4 hover:underline"
                >
                  Swiggy &amp; Zomato account management services
                </Link>
                .
              </p>
              <a href="#audit-form" className="btn btn-primary mt-8">
                Request your free audit
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </Reveal>

            <FaqList items={faqs} name="audit-faq" />
          </div>
        </div>
      </section>
    </>
  );
}
