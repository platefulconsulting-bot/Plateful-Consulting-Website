import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { MenuPriceCalculator } from "@/components/tools/MenuPriceCalculator";
import { CTABand } from "@/components/site/CTABand";
import { jsonLd, breadcrumbSchema, faqSchema, webApplicationSchema } from "@/lib/seo";
import { ogImageUrl } from "@/lib/utils";

const PATH = "/tools/menu-price-calculator";
const DESCRIPTION =
  "Free menu price after commission calculator for Swiggy and Zomato: enter your dine-in price and rates to see the app price that keeps the same money per item.";

export const metadata: Metadata = {
  title: { absolute: "Menu Price After Commission Calculator | PFC" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: "Menu Price After Commission Calculator",
    description: "What should a dish cost on Swiggy and Zomato so you keep the same as dine-in? Find out in 30 seconds.",
    url: PATH,
    images: [{ url: ogImageUrl("Menu Price After Commission Calculator", "Free tool"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu Price After Commission Calculator",
    description: "What should a dish cost on Swiggy and Zomato so you keep the same as dine-in? Find out in 30 seconds.",
    images: [ogImageUrl("Menu Price After Commission Calculator", "Free tool")],
  },
};

const faqs = [
  {
    q: "Should my Swiggy and Zomato prices be higher than dine-in?",
    a: "Many restaurants price a little higher on the apps, because commission, payment fees, GST on both and packaging come out of every delivery order. Whether you do, and by how much, is a business call: check your partner agreement first, as some limit how far app prices can differ from your dine-in menu.",
  },
  {
    q: "How much should I mark up my menu for delivery?",
    a: "This calculator shows the markup that recovers the full cost, so you keep exactly what you would at dine-in. Many restaurants do not pass all of it on. They take a partial markup and recover the rest through combos, portion sizes for delivery and fewer funded discounts. Watch your conversion rate after any price change.",
  },
  {
    q: "Does the calculator include GST on food?",
    a: "No. Enter prices before the 5% GST on food, which the platforms collect and pay on orders placed through them. The calculator does include the 18% GST on commission and payment gateway fees, which comes out of your payout.",
  },
  {
    q: "Why does a discount push the app price up so much?",
    a: "A discount you fund comes off the price first, and in most agreements commission is then charged on what remains. So a 10% discount does not cost 10% of your margin; it can cost far more of what you keep. If you plan to run offers, price for them or keep them small and time-boxed.",
  },
  {
    q: "What should I enter for packaging?",
    a: "Enter the packaging cost you bear per item: containers, lids, bags and cutlery. If you charge a separate packaging fee to customers on the app, subtract what that recovers. Packaging can be a large share of a low-priced item, which is why sides and desserts often need a bigger markup.",
  },
];

const related = [
  { href: "/restaurant-menu-pricing-strategy-for-online-delivery-in-india", label: "Pricing your menu for online delivery" },
  { href: "/tools/commission-calculator", label: "Commission calculator: what you pay each month" },
  { href: "/tools/discount-calculator", label: "Discount calculator: will an offer pay for itself?" },
  { href: "/tools/ads-roas-calculator", label: "Ads ROAS calculator: are your ads making money?" },
  { href: "/how-to-read-your-swiggy-and-zomato-payout-statement", label: "How to read your payout statement" },
];

export default function MenuPriceCalculatorPage() {
  const schema = jsonLd(
    webApplicationSchema({ name: "Menu Price After Commission Calculator", description: DESCRIPTION, path: PATH }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Menu Price Calculator", path: PATH },
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
              <li className="text-cream-300">Menu Price Calculator</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">Free tool</p>
          <h1 className="mt-5 max-w-3xl text-[length:var(--text-display-lg)] font-bold leading-[1.05] tracking-[-0.03em]">
            Menu price after commission calculator
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-300">
            Type a dish&apos;s dine-in price and your Swiggy or Zomato rates. See the app menu price you need to keep
            the same money per item, and how big a markup that is.
          </p>
        </div>
      </header>

      <section className="container-x py-12 lg:py-16" aria-label="Calculator">
        <MenuPriceCalculator />
      </section>

      <section className="container-x pb-16 lg:pb-24" aria-labelledby="how-it-works">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <h2 id="how-it-works" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              How the calculator works
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-cream-300">
              <p>
                On every app order, any discount you fund comes off the price first. Commission and the payment gateway
                fee are then charged on what remains, with 18% GST on both, and you pay for the packaging.
              </p>
              <p>
                The calculator works backwards: app price = (amount you want to keep + packaging) ÷ ((1 − discount %)
                × (1 − (commission % + gateway %) × 1.18)). The result is rounded up to the next ₹5, the way most
                menus are priced.
              </p>
              <p>
                Take your rates from your agreement or your latest payout statement. Then decide how much of the markup
                to pass on: a full markup protects margin, but a very high app price can cost you orders.
              </p>
            </div>
            <h3 className="mt-10 font-display text-base font-semibold text-cream-50">Related guides and tools</h3>
            <ul className="mt-4 space-y-2.5">
              {related.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gold-300 underline-offset-4 hover:underline"
                  >
                    {l.label}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
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
        eyebrow="Not sure what to charge?"
        title="We price menus for delivery, dish by dish."
        body="A growth audit reads your Swiggy and Zomato menu and payout statements, finds the dishes that lose money after commission, and shows what to change first."
      />
    </>
  );
}
