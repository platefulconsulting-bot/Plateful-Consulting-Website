import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Handshake,
  BadgePercent,
  Megaphone,
  Tags,
  Store,
  RefreshCcw,
} from "lucide-react";

import { CommissionSavingsCalculator } from "@/components/tools/CommissionSavingsCalculator";
import { CommissionLeadForm } from "@/components/site/CommissionLeadForm";
import { FaqList } from "@/components/site/FaqList";
import { Reveal } from "@/components/ui/Reveal";
import { jsonLd, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { absoluteUrl, ogImageUrl } from "@/lib/utils";
import { PROGRAM_PRICE_FROM } from "@/lib/commission-program";

const PATH = "/commission-reduction";
const TITLE = "Reduce Swiggy & Zomato Commission | Commission Reduction Program";
const DESCRIPTION =
  "Paying 30–40% of every order to Swiggy and Zomato once commission, ads and discounts are added up? Our Commission Reduction Program typically brings the real take-rate under 25%.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: "Cut your real Swiggy & Zomato take-rate",
    description: "Commission, ads and discounts add up to 30–40%. We bring it under 25%, typically.",
    url: PATH,
    images: [{ url: ogImageUrl("Cut your real Swiggy & Zomato take-rate", "Commission Reduction Program"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cut your real Swiggy & Zomato take-rate",
    description: "Commission, ads and discounts add up to 30–40%. We bring it under 25%, typically.",
    images: [ogImageUrl("Cut your real Swiggy & Zomato take-rate", "Commission Reduction Program")],
  },
};

const leaks = [
  { title: "Commission + GST", value: "20–28%", body: "The headline rate, plus 18% GST on it. New outlets onboarded without negotiation usually land at the top of the range." },
  { title: "Aggregator ads", value: "3–6%", body: "CPC and banner spend that keeps running after it stops paying back, often on the wrong dayparts." },
  { title: "Discounts you fund", value: "4–8%", body: "Deep percentage offers with high caps that buy orders at a loss instead of raising the basket." },
  { title: "Menu & packaging", value: "1–3%", body: "App prices that don't account for the platform's cut, and packaging charges left on the table." },
];

const levers = [
  { icon: Handshake, title: "Negotiation at onboarding", body: "For new outlets, we prepare your case and negotiate through the platforms' official partner and BD teams before you sign." },
  { icon: BadgePercent, title: "Exclusivity rate deals", body: "Where it pays, we model and negotiate exclusive-listing terms that come with a lower commission." },
  { icon: Megaphone, title: "Ads clean-up", body: "We cut campaigns that don't pay back and move spend to the slots and dayparts that do." },
  { icon: Tags, title: "Discount rebuild", body: "We replace margin-burning offers with threshold and free-item offers that need fewer extra orders to break even." },
  { icon: Store, title: "Menu pricing & direct orders", body: "We set app-specific pricing, and move repeat customers to ONDC or your own ordering, where there's no 25% cut." },
  { icon: RefreshCcw, title: "Rate review at 3–6 months", body: "Once your numbers improve, we take the case back to the platform for a rate review." },
];

const steps = [
  { n: "01", title: "Free Commission Leak Audit", body: "We read your payout statements and show where every rupee goes, line by line." },
  { n: "02", title: "Savings plan", body: "A written plan with the levers that apply to you and a realistic target take-rate." },
  { n: "03", title: "90-day execution", body: "We run the negotiation, ads, discounts and menu changes inside your dashboards." },
  { n: "04", title: "Review & renegotiate", body: "We track net payout monthly and take the improved numbers back for a rate review." },
];

const faqs = [
  {
    q: "How can a restaurant reduce its Swiggy or Zomato commission?",
    a: "The commission rate itself is set in your agreement, so the best moment to negotiate it is at onboarding, through the platform's official partner team, with a clear case: expected volume, category, average order value and any exclusivity you can offer. After that, the bigger savings usually come from the costs around commission: ads that don't pay back, restaurant-funded discounts, and app menu pricing. Together these often add 10–15% on top of commission.",
  },
  {
    q: "What is an effective take-rate?",
    a: "It is everything the apps keep out of your sales, as a share of those sales: commission plus 18% GST on it, aggregator ad spend plus GST, and the discounts you fund. Most restaurants we audit sit between 30% and 40%. Well-run listings typically sit under 25%.",
  },
  {
    q: "Can you guarantee a specific commission rate?",
    a: "No. Swiggy and Zomato set commission in your agreement, and no honest consultant can promise a fixed rate. What we commit to is a written plan, the work inside your dashboards, and monthly tracking of your net payout, so you can see exactly what changed.",
  },
  {
    q: "Who is the Commission Reduction Program for?",
    a: "Restaurants doing ₹10 lakh or more a month on the apps, multi-outlet brands, and new outlets about to onboard that want to negotiate before signing. Smaller listings start with the free Commission Leak Audit, because the quickest wins there are usually ads and discounts.",
  },
  {
    q: "How much does the program cost?",
    a: `Programs start from ${PROGRAM_PRICE_FROM}, depending on the number of outlets and how much needs to change. The Commission Leak Audit that comes first is free.`,
  },
  {
    q: "Is Plateful Consulting part of Swiggy or Zomato?",
    a: "No. We are an independent restaurant growth consultancy. We work inside your partner dashboards with your permission, and every negotiation goes through the platforms' official channels.",
  },
];

export default function CommissionReductionPage() {
  const schema = jsonLd(
    {
      "@type": "Service",
      "@id": absoluteUrl(`${PATH}#service`),
      name: "Commission Reduction Program",
      serviceType: "Swiggy and Zomato commission and take-rate reduction",
      description: DESCRIPTION,
      url: absoluteUrl(PATH),
      areaServed: { "@type": "Country", name: "India" },
      provider: { "@id": absoluteUrl("/#organization") },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        priceSpecification: { "@type": "PriceSpecification", minPrice: 90000, priceCurrency: "INR" },
      },
    },
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Commission Reduction", path: PATH },
    ]),
    faqSchema(faqs),
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ------------------------------------------------------------ HERO */}
      <header className="relative overflow-hidden border-b border-cream-100/8">
        <div className="grid-lines absolute inset-0 mask-fade-b opacity-30" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(180,122,23,0.16),transparent_55%)]"
          aria-hidden
        />
        <div className="container-x relative py-12 lg:py-20">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-cream-500">
              <li>
                <Link href="/" className="transition-colors hover:text-gold-300">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li className="text-cream-300">Commission Reduction</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">Commission Reduction Program</p>
          <h1 className="mt-5 max-w-4xl text-[length:var(--text-display-lg)] font-bold leading-[1.05] tracking-[-0.03em]">
            Paying 30–40% to Swiggy &amp; Zomato?{" "}
            <span className="text-gradient-gold">We typically bring your real take-rate under 25%.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream-300">
            Commission is only part of the bill. Add GST, ads and the discounts you fund, and most restaurants hand
            over a third of every order. We find every leak and typically save restaurants lakhs a year, on the same
            sales.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#apply" className="btn btn-primary btn-lg">
              Check if you qualify
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a href="#calculator" className="btn btn-outline btn-lg">
              Calculate your savings
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-cream-400">
            {["650+ restaurants scaled", "7+ years inside the dashboards", `Programs from ${PROGRAM_PRICE_FROM}`].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
      </header>

      {/* ------------------------------------------------------------ WHERE IT GOES */}
      <section className="container-x section-tight" aria-labelledby="leaks-title">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Where the money goes</p>
          <h2 id="leaks-title" className="mt-5 text-[length:var(--text-display-md)] font-bold leading-[1.1]">
            Your real cost isn&rsquo;t the commission rate. It&rsquo;s the take-rate.
          </h2>
          <p className="mt-5 leading-relaxed text-cream-300">
            Typical ranges from the payout statements we audit. Together they usually add up to 30–40% of sales.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {leaks.map((l, i) => (
            <Reveal key={l.title} delay={i * 0.05} className="card p-6">
              <p className="font-display text-3xl font-bold text-gold-300">{l.value}</p>
              <h3 className="mt-3 font-display text-base font-semibold text-cream-50">{l.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-400">{l.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ CALCULATOR */}
      <section id="calculator" className="container-x section-tight scroll-mt-24" aria-labelledby="calc-title">
        <div className="max-w-2xl">
          <p className="eyebrow">Savings calculator</p>
          <h2 id="calc-title" className="mt-5 text-[length:var(--text-display-md)] font-bold leading-[1.1]">
            How much are the apps really taking?
          </h2>
        </div>
        <div className="mt-10">
          <CommissionSavingsCalculator />
        </div>
      </section>

      {/* ------------------------------------------------------------ LEVERS */}
      <section className="container-x section-tight" aria-labelledby="levers-title">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">What we do</p>
          <h2 id="levers-title" className="mt-5 text-[length:var(--text-display-md)] font-bold leading-[1.1]">
            Six levers that bring the take-rate down
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {levers.map((l, i) => (
            <Reveal key={l.title} delay={i * 0.04} className="card p-6">
              <l.icon className="h-6 w-6 text-gold-400" aria-hidden />
              <h3 className="mt-4 font-display text-lg font-semibold text-cream-50">{l.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-400">{l.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ PROCESS */}
      <section className="container-x section-tight" aria-labelledby="process-title">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 id="process-title" className="mt-5 text-[length:var(--text-display-md)] font-bold leading-[1.1]">
            From audit to a lower bill, in four steps
          </h2>
        </Reveal>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.05} className="card p-6">
              <p className="font-display text-sm font-semibold tracking-[0.2em] text-gold-400">{s.n}</p>
              <h3 className="mt-3 font-display text-lg font-semibold text-cream-50">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-400">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ PROOF + PRICING */}
      <section className="container-x section-tight" aria-labelledby="pricing-title">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal className="card p-6 md:p-8">
            <p className="eyebrow">Proof</p>
            <p className="mt-5 font-display text-[length:var(--text-display-md)] font-bold leading-[1.1] text-cream-50">
              650+ restaurants scaled
            </p>
            <p className="mt-4 leading-relaxed text-cream-300">
              Our team has worked inside Swiggy and Zomato dashboards for 7+ years, across QSRs, cloud kitchens and
              fine dine. One example: Ivoryy Fusion Bar in Connaught Place grew from ₹12 lakh to ₹70 lakh a month in
              four months.
            </p>
            <Link href="/results" className="btn btn-outline btn-sm mt-7">
              See client results
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>

          <Reveal delay={0.05} className="card card-sheen border-gold-400/30 p-6 md:p-8">
            <p className="eyebrow">Pricing</p>
            <h2 id="pricing-title" className="mt-5 font-display text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              Programs from {PROGRAM_PRICE_FROM}
            </h2>
            <p className="mt-3 text-cream-400">Depends on outlets and scope. The audit that comes first is free.</p>
            <ul className="mt-6 space-y-3 text-sm text-cream-200">
              {[
                "Free Commission Leak Audit of your payout statements",
                "Written savings plan with a target take-rate",
                "Onboarding or rate negotiation through official channels",
                "90 days of ads, discount and menu changes, done for you",
                "Monthly net-payout tracking, and a rate review at 3–6 months",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-cream-500">
              Best fit: ₹10 lakh+ a month on the apps, 2+ outlets, or a new outlet about to onboard.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ APPLY */}
      <section id="apply" className="container-x section-tight scroll-mt-24" aria-labelledby="apply-title">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="eyebrow">Apply</p>
            <h2 id="apply-title" className="mt-5 text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              See if you qualify
            </h2>
            <p className="mt-5 leading-relaxed text-cream-300">
              Answer three questions about your outlet. If you&rsquo;re a fit, you can message our founder on WhatsApp
              straight away. If not yet, we&rsquo;ll start you with a free Commission Leak Audit.
            </p>
            <p className="mt-6 text-sm text-cream-500">
              Plateful Consulting is an independent consultancy and is not affiliated with Swiggy or Zomato.
            </p>
          </div>
          <CommissionLeadForm />
        </div>
      </section>

      {/* ------------------------------------------------------------ FAQ */}
      <section className="section border-t border-cream-100/8" aria-labelledby="crp-faq-title">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 id="crp-faq-title" className="mt-5 text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              Swiggy &amp; Zomato commission questions
            </h2>
            <p className="mt-5 leading-relaxed text-cream-400">
              Want the full breakdown first? Read our guide to{" "}
              <Link href="/restaurant-commission-and-payouts" className="font-medium text-gold-300 underline-offset-4 hover:underline">
                restaurant commission and payouts
              </Link>
              .
            </p>
          </div>
          <FaqList items={faqs} name="crp-faq" />
        </div>
      </section>
    </>
  );
}
