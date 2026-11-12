import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  Camera,
  ChefHat,
  ChevronRight,
  ListChecks,
  Star,
  Store,
  Target,
  Wallet,
  Wine,
} from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { CTABand } from "@/components/site/CTABand";
import { FaqList } from "@/components/site/FaqList";
import { LocalCaseCard } from "@/components/site/CityPage";
import { caseStudies, resultsPage, type CaseStudy } from "@/lib/site";
import { jsonLd, breadcrumbSchema, faqSchema, landingServiceSchema } from "@/lib/seo";
import { metaDescription, ogImageUrl, seoTitle } from "@/lib/utils";

/**
 * /swiggy-zomato-account-management: service landing page for restaurants
 * looking for someone to run their Swiggy and Zomato accounts week to week.
 * Proof comes only from the named case studies in site.ts.
 *
 * Schema: BreadcrumbList, Service and the visible FAQ.
 */

const PATH = "/swiggy-zomato-account-management";
const TITLE = "Swiggy & Zomato account management services";
const META_TITLE = "Swiggy & Zomato Account Management Services";
const DESCRIPTION = metaDescription(
  "Swiggy and Zomato account management for restaurants: listing, menu, offers, ads, reviews, ops monitoring, payout checks and weekly reports.",
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
    images: [{ url: ogImageUrl(META_TITLE, "Account management"), width: 1200, height: 630, alt: META_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [ogImageUrl(META_TITLE, "Account management")],
  },
};

const included = [
  {
    icon: ListChecks,
    title: "Listing and menu",
    body: "Categories, item names, descriptions, variants and add-ons kept clean on both apps. Prices are checked against commission, GST and packaging so a bestseller is not quietly losing money on every order.",
  },
  {
    icon: Camera,
    title: "Photos",
    body: "Item and cover images that follow each platform's guidelines, with gaps flagged as menus change. Shoots can be arranged through our food photography service.",
  },
  {
    icon: CalendarDays,
    title: "Offers and discount calendar",
    body: "A monthly offer calendar planned against break-even, not habit. Every offer is checked before it goes live, and nothing on pricing or offers changes without your approval.",
  },
  {
    icon: Target,
    title: "Ads management",
    body: "Swiggy and Zomato ads budgeted by day-part and reviewed every week against orders and what reaches your bank, not only the return the ad dashboard reports.",
  },
  {
    icon: Star,
    title: "Ratings and reviews",
    body: "Replies to reviews, complaint patterns sent back to the kitchen, and legitimate rating drives such as packaging inserts. No fake reviews, no paid ratings, no shortcuts that put the listing at risk.",
  },
  {
    icon: Activity,
    title: "Availability and ops monitoring",
    body: "Online time, item stock-outs, prep time, acceptance and cancellations checked daily, with alerts to your manager when something slips. These are the signals the platforms rank on.",
  },
  {
    icon: Wallet,
    title: "Payout reconciliation",
    body: "Payout statements checked against orders: commission, GST, ad deductions, discounts and penalties. Where a deduction does not match, we raise it with the platform.",
  },
  {
    icon: BarChart3,
    title: "Weekly reports",
    body: "One page every week: sales, orders, order value, ad and discount spend, ratings, lost sales, and what we are changing next week and why.",
  },
];

const plan = [
  {
    when: "Week 1",
    title: "Onboarding",
    body: "Restricted dashboard access, a full audit of both listings, and a baseline of sales, orders, ad spend, discounts and ops signals so every later change can be measured.",
  },
  {
    when: "Days 1–30",
    title: "Fix the foundation",
    body: "Listing and menu cleanup, prices checked against commission, loss-making offers paused, availability and prep-time issues fixed, and review replies brought up to date.",
  },
  {
    when: "Days 31–60",
    title: "Build demand",
    body: "Ads restructured by day-part, an offer calendar built on break-even, and new-customer acquisition switched on once the listing converts the traffic it already gets.",
  },
  {
    when: "Days 61–90",
    title: "Scale what pays back",
    body: "Budget moved to what returns, cut from what does not, a margin review against payouts, and a plan for the next quarter that you sign off before it starts.",
  },
];

const audiences = [
  {
    icon: ChefHat,
    title: "Cloud kitchens",
    body: "Delivery is the whole business, so listing, ads and ops signals decide whether the kitchen is busy. Includes multiple brands run from one kitchen.",
  },
  {
    icon: Store,
    title: "QSR brands",
    body: "High order volumes and thin margins per order, where offer structure, prep time and availability matter more than anything else.",
  },
  {
    icon: Building2,
    title: "Multi-outlet chains",
    body: "One standard across every outlet, with outlet-level reporting so you can see which locations are leaking orders or margin.",
  },
  {
    icon: Wine,
    title: "Fine dine on delivery",
    body: "A delivery menu and price point that protect the brand, with ads and offers aimed at the customers who order high-value baskets.",
  },
];

const comparison = [
  { row: "Works for", pfc: "You, the restaurant", platform: "The platform, where one is assigned", diy: "You" },
  {
    row: "Main focus",
    pfc: "Your net payout after commission, ads and discounts",
    platform: "Adoption of platform programmes, ads and offers",
    diy: "Whatever gets time after the kitchen",
  },
  {
    row: "Time on your outlet",
    pfc: "Daily checks and a weekly review",
    platform: "Usually shared across many restaurants",
    diy: "The owner's spare time",
  },
  {
    row: "Ads and offers",
    pfc: "Planned against your margin, changed only with your approval",
    platform: "Recommendations; you decide and set them up",
    diy: "Trial and error",
  },
  {
    row: "Listing and menu",
    pfc: "Rebuilt and maintained for you",
    platform: "Guidance; you make the changes",
    diy: "You make the changes",
  },
  {
    row: "Payout checks",
    pfc: "Every statement reconciled, disputes raised",
    platform: "Not usually part of the role",
    diy: "Rarely done in detail",
  },
  {
    row: "Reporting",
    pfc: "Weekly one-page report and monthly review",
    platform: "Platform dashboards",
    diy: "Dashboards, when there is time",
  },
  {
    row: "Cost",
    pfc: "Monthly fee, scoped to outlets and platforms",
    platform: "No separate fee",
    diy: "Your time, plus mistakes that cost margin",
  },
];

const faqs = [
  {
    q: "What do Swiggy and Zomato account management services include?",
    a: "Running the partner dashboards for you every week: listing and menu upkeep, photos, the offer and discount calendar, ads management, review replies and legitimate rating drives, daily availability and ops checks, payout reconciliation and a weekly report. The exact scope is agreed after a free growth audit.",
  },
  {
    q: "Do I have to share my Swiggy and Zomato logins?",
    a: "We work with restricted dashboard access wherever the platform allows it. You stay the owner of the account, nothing on pricing or offers changes without your written approval, and at the end of an engagement we hand back every login, ID and the full offer list.",
  },
  {
    q: "How is this different from the account manager Swiggy or Zomato assigns?",
    a: "Plateful Consulting is an independent consultancy, not part of Swiggy or Zomato and not an official partner of either. A platform account manager, where one is assigned, works for the platform. We work for the restaurant and judge every change by what reaches your bank after commission, ads and discounts.",
  },
  {
    q: "How much does Swiggy and Zomato account management cost?",
    a: "It depends on the number of outlets, whether you are on one platform or both, and how much of the execution we take on. We quote after the free growth audit, against your current numbers, rather than give a blind price.",
  },
  {
    q: "How soon will we see results?",
    a: "Ops fixes such as availability, prep time and acceptance usually show in ranking within two to four weeks, and menu changes show in conversion almost straight away. Ratings are the slowest lever. Results vary by city, cuisine, price point and starting position, so we do not guarantee numbers.",
  },
];

const PROOF_SLUGS = ["drama", "balaji-dhaba", "punjabi-rasoi", "olantic-8"];

export default function AccountManagementPage() {
  const cases = PROOF_SLUGS.map((s) => caseStudies.find((c) => c.slug === s)).filter((c): c is CaseStudy =>
    Boolean(c),
  );

  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: "Account management", path: PATH },
    ]),
    landingServiceSchema({
      path: PATH,
      name: TITLE,
      description: DESCRIPTION,
      serviceType: "Swiggy and Zomato restaurant account management",
    }),
    faqSchema(faqs),
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

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
                Account management
              </li>
            </ol>
          </nav>

          <Reveal immediate className="mt-8 max-w-3xl">
            <p className="eyebrow">Account management</p>
            <h1 className="mt-6 text-[length:var(--text-display-xl)] font-bold leading-[1.0] tracking-[-0.03em]">
              Swiggy &amp; Zomato account management services
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-cream-300">
              Swiggy and Zomato account management means someone runs your restaurant&rsquo;s partner dashboards
              for you, every week: listing and menu, photos, the offer calendar, ads, ratings and reviews,
              availability, payout checks and a weekly report. Plateful Consulting does this for cloud kitchens,
              QSR brands, multi-outlet chains and fine dine restaurants on delivery. We have worked with 650+
              restaurants and managed ₹8Cr+ in aggregator ad spend, as an independent consultancy, not part of
              Swiggy or Zomato.
            </p>
          </Reveal>

          <Reveal immediate delay={0.06}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/free-growth-audit" className="btn btn-primary btn-lg">
                Get a free growth audit
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/contact-us" className="btn btn-outline btn-lg">
                Talk to us
              </Link>
            </div>
          </Reveal>

          <Reveal immediate delay={0.1}>
            <ul className="mt-9 flex flex-wrap gap-2.5" aria-label="Sections">
              {[
                { id: "included", label: "What's included" },
                { id: "how-it-works", label: "How it works" },
                { id: "who-its-for", label: "Who it's for" },
                { id: "results", label: "Results" },
                { id: "compare", label: "Compare" },
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

      {/* ================= WHAT'S INCLUDED ================= */}
      <section id="included" className="section-tight scroll-mt-28" aria-labelledby="included-title">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <h2 id="included-title" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              What&rsquo;s included
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream-400">
              Everything a well-run Swiggy and Zomato account needs week to week, on one or both platforms.
            </p>
          </Reveal>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {included.map((item, i) => (
              <Reveal as="li" key={item.title} delay={(i % 4) * 0.06} className="card h-full p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500/12 text-gold-300">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-cream-50">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-400">{item.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        id="how-it-works"
        className="section-tight scroll-mt-28 border-t border-cream-100/8 bg-ink-850/60"
        aria-labelledby="how-title"
      >
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <h2 id="how-title" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              How it works: onboarding, then a 30/60/90-day plan
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream-400">
              Fix first, then buy visibility. Ads on a broken listing only buy the same problem at a higher price.
            </p>
          </Reveal>

          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {plan.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.06} className="card h-full p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">{step.when}</p>
                <h3 className="mt-3 font-display text-lg font-semibold text-cream-50">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-400">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= WHO IT'S FOR ================= */}
      <section id="who-its-for" className="section-tight scroll-mt-28 border-t border-cream-100/8" aria-labelledby="who-title">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <h2 id="who-title" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              Who it&rsquo;s for
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream-400">
              Single outlets and chains alike. The diagnosis is the same; what changes is how much of the
              execution we take on.
            </p>
          </Reveal>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((a, i) => (
              <Reveal as="li" key={a.title} delay={i * 0.06} className="card h-full p-6">
                <a.icon className="h-6 w-6 text-gold-300" aria-hidden />
                <h3 className="mt-4 font-display text-base font-semibold text-cream-50">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-400">{a.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= PROOF ================= */}
      <section
        id="results"
        className="section-tight scroll-mt-28 border-t border-cream-100/8 bg-ink-850/60"
        aria-labelledby="results-title"
      >
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <h2 id="results-title" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              Results from accounts we manage
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream-400">
              Named clients, from their own Swiggy and Zomato partner dashboards. {resultsPage.disclaimer}
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {cases.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 2) * 0.08} className="h-full">
                <LocalCaseCard study={c} />
              </Reveal>
            ))}
          </div>

          <Link href={resultsPage.path} className="btn btn-outline mt-10">
            See all client results
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* ================= COMPARISON ================= */}
      <section id="compare" className="section-tight scroll-mt-28 border-t border-cream-100/8" aria-labelledby="compare-title">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <h2 id="compare-title" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              PFC vs a platform account manager vs doing it yourself
            </h2>
            <p className="mt-3 text-base leading-relaxed text-cream-400">
              Not every restaurant is assigned a platform account manager, and the role varies by platform and
              city. This is the typical picture.
            </p>
          </Reveal>

          <Reveal className="mt-10">
            <div className="prose-pfc max-w-none">
              <div className="table-wrap">
                <table>
                  <caption className="sr-only">
                    Comparison of Plateful Consulting, a platform account manager and managing the account yourself
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">
                        <span className="sr-only">Area</span>
                      </th>
                      <th scope="col">Plateful Consulting</th>
                      <th scope="col">Platform account manager</th>
                      <th scope="col">Doing it yourself</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((r) => (
                      <tr key={r.row}>
                        <th scope="row">{r.row}</th>
                        <td className="font-medium text-cream-50">{r.pfc}</td>
                        <td className="text-cream-300">{r.platform}</td>
                        <td className="text-cream-300">{r.diy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="section scroll-mt-28 border-t border-cream-100/8" aria-labelledby="am-faq">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">Questions</p>
              <h2 id="am-faq" className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]">
                Account management, answered.
              </h2>
              <p className="mt-6 leading-relaxed text-cream-400">
                Want to see where your account stands first?{" "}
                <Link href="/free-growth-audit" className="font-medium text-gold-300 underline-offset-4 hover:underline">
                  Start with the free growth audit
                </Link>
                .
              </p>
            </Reveal>

            <FaqList items={faqs} name="am-faq" />
          </div>
        </div>
      </section>

      <CTABand
        className="border-t border-cream-100/8"
        eyebrow="Next step"
        title="See what your Swiggy and Zomato accounts are leaving on the table."
        body="The free growth audit compares your listings with your nearest competitors and gives you a 3-page report on listing, menu, offers, ads, ratings and ops. Keep it whether or not you hire us."
        primaryLabel="Get a free growth audit"
        primaryHref="/free-growth-audit"
      />
    </>
  );
}
