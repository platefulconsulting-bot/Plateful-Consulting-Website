import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { DiscountCalculator } from "@/components/tools/DiscountCalculator";
import { CTABand } from "@/components/site/CTABand";
import { jsonLd, breadcrumbSchema, faqSchema, webApplicationSchema } from "@/lib/seo";

const PATH = "/tools/discount-calculator";
const DESCRIPTION =
  "Free calculator for restaurants: see what a Swiggy or Zomato offer does to your earnings per order, and how many extra orders it needs to break even.";

export const metadata: Metadata = {
  title: "Swiggy & Zomato Discount Calculator for Restaurants",
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: "Swiggy & Zomato Discount Calculator",
    description: "Will that offer make money or burn margin? Find out in 30 seconds.",
    url: PATH,
  },
};

const faqs = [
  {
    q: "How do I know if a Swiggy or Zomato discount is profitable?",
    a: "Compare what each order earns after commission, GST on commission, food and packaging, with and without the offer. Divide the first by the second and subtract one: that is the extra share of orders the offer needs just to break even. If the offer cannot realistically bring in that many more orders, it loses money.",
  },
  {
    q: "Which offers are safest for restaurant margins?",
    a: "Threshold offers, such as a flat amount off above a minimum order, and free items above a minimum usually need fewer than 10% more orders to break even, because customers raise their basket to qualify and a free item costs only its food cost. Deep percentage discounts with high caps usually need 50–110% more orders.",
  },
  {
    q: "Is commission charged before or after the discount?",
    a: "On most restaurant-funded offers it is charged on the order value after the discount, which is what this calculator assumes. The exact base is set in your agreement, so confirm it against a real payout statement.",
  },
];

export default function DiscountCalculatorPage() {
  const schema = jsonLd(
    webApplicationSchema({ name: "Swiggy & Zomato Discount Calculator", description: DESCRIPTION, path: PATH }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Discount Calculator", path: PATH },
    ]),
    faqSchema(faqs),
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
              <li className="text-cream-300">Discount Calculator</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">Free tool</p>
          <h1 className="mt-5 max-w-3xl text-[length:var(--text-display-lg)] font-bold leading-[1.05] tracking-[-0.03em]">
            Swiggy &amp; Zomato discount calculator
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-300">
            Will that offer make money or burn margin? Enter your numbers and see what each order really earns,
            and how many more orders the offer needs before it pays for itself.
          </p>
        </div>
      </header>

      <section className="container-x py-12 lg:py-16" aria-label="Calculator">
        <DiscountCalculator />
      </section>

      <section className="container-x pb-16 lg:pb-24" aria-labelledby="how-it-works">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <h2 id="how-it-works" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              How the calculator works
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-cream-300">
              <p>
                A restaurant-funded discount comes off the order value. Commission and its 18% GST are charged on
                what remains, but your food and packaging costs stay the same, so the discount comes almost
                entirely out of what each order earns.
              </p>
              <p>
                The calculator compares the contribution per order with and without the offer, then works out the
                break-even lift: how many more orders you need to earn the same total as before.
              </p>
              <p>
                The full reasoning, with worked examples and a 30-day plan for fixing your offers, is in our guide{" "}
                <Link
                  href="/swiggy-zomato-discounts-which-offers-make-money"
                  className="font-medium text-gold-300 underline-offset-4 hover:underline"
                >
                  Swiggy &amp; Zomato discounts: which offers make money
                </Link>
                .
              </p>
            </div>
            <Link href="/how-to-read-your-swiggy-and-zomato-payout-statement" className="btn btn-outline btn-sm mt-8">
              Find your real numbers in your payout statement
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div>
            <h2 className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">Frequently asked questions</h2>
            <dl className="mt-6 space-y-6">
              {faqs.map((f) => (
                <div key={f.q} className="card p-6">
                  <dt className="font-display text-base font-semibold text-cream-50">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-cream-400">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <CTABand
        eyebrow="Want this done on your real data?"
        title="We audit every live offer against your actual payouts."
        body="A growth audit reads your Swiggy and Zomato dashboards, runs the break-even test on every offer you have live, and rebuilds the ones that are costing you margin."
      />
    </>
  );
}
