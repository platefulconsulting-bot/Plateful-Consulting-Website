import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { AdsRoasCalculator } from "@/components/tools/AdsRoasCalculator";
import { CTABand } from "@/components/site/CTABand";
import { jsonLd, breadcrumbSchema, faqSchema, webApplicationSchema } from "@/lib/seo";
import { ogImageUrl } from "@/lib/utils";

const PATH = "/tools/ads-roas-calculator";
const DESCRIPTION =
  "Free Swiggy and Zomato ads ROAS calculator: enter ad spend, ad sales and costs to see ROAS, profit per ad order and your break-even ROAS.";

export const metadata: Metadata = {
  title: { absolute: "Swiggy & Zomato Ads ROAS Calculator | PFC" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: "Swiggy & Zomato Ads ROAS Calculator",
    description: "Is your 5x ROAS actually making money? See profit per ad order and your break-even ROAS in 30 seconds.",
    url: PATH,
    images: [{ url: ogImageUrl("Swiggy & Zomato Ads ROAS Calculator", "Free tool"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiggy & Zomato Ads ROAS Calculator",
    description: "Is your 5x ROAS actually making money? See profit per ad order and your break-even ROAS in 30 seconds.",
    images: [ogImageUrl("Swiggy & Zomato Ads ROAS Calculator", "Free tool")],
  },
};

const faqs = [
  {
    q: "What is ROAS on Swiggy and Zomato ads?",
    a: "ROAS, or return on ad spend, is the sales your ads brought in divided by what you spent on them. If you spent ₹20,000 and the ads dashboard shows ₹1,00,000 of sales from ads, your ROAS is 5x. It measures sales, not profit, which is why this calculator also works out what each ad order leaves you.",
  },
  {
    q: "What is a good ROAS for restaurant ads?",
    a: "There is no single good number, because it depends on your margin. The useful number is your break-even ROAS: order value divided by what an order leaves after commission, GST, food and packaging. With typical delivery costs that often lands somewhere around 2.5x to 4x. Aim to stay comfortably above your own break-even, not above someone else's benchmark.",
  },
  {
    q: "Why can a high ROAS still lose money?",
    a: "Because commission, GST, food cost and packaging come out of every ad order before the ad cost does. A thin-margin menu can need a high ROAS just to break even. Ad dashboards may also count orders from customers who would have ordered anyway, and discounts you fund on ad orders lower what you keep further.",
  },
  {
    q: "Should I include GST on ad spend?",
    a: "Ad invoices usually carry 18% GST. If you cannot claim it back as input tax credit, it is a real cost: enter your ad spend including GST so the calculator reflects what you actually paid. If you do claim it, use the amount before GST.",
  },
  {
    q: "How do I improve ROAS on Swiggy and Zomato?",
    a: "Fix the listing first, since ads send people to it: photos, ratings, a clear menu and fair prices. Then run ads in the dayparts and areas where you already convert, set sensible bids and budgets, and pause campaigns that stay below break-even for a few weeks. Judge results on net payout, not order count.",
  },
];

const related = [
  { href: "/swiggy-ads-strategy-how-to-get-5x-roas-without-wasting-budget", label: "Swiggy ads strategy without wasting budget" },
  { href: "/tools/commission-calculator", label: "Commission calculator: what you pay each month" },
  { href: "/tools/discount-calculator", label: "Discount calculator: will an offer pay for itself?" },
  { href: "/tools/menu-price-calculator", label: "Menu price after commission calculator" },
  { href: "/how-to-read-your-swiggy-and-zomato-payout-statement", label: "How to read your payout statement" },
];

export default function AdsRoasCalculatorPage() {
  const schema = jsonLd(
    webApplicationSchema({ name: "Swiggy & Zomato Ads ROAS Calculator", description: DESCRIPTION, path: PATH }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Ads ROAS Calculator", path: PATH },
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
              <li className="text-cream-300">Ads ROAS Calculator</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">Free tool</p>
          <h1 className="mt-5 max-w-3xl text-[length:var(--text-display-lg)] font-bold leading-[1.05] tracking-[-0.03em]">
            Swiggy &amp; Zomato ads ROAS calculator
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-300">
            Type your monthly ad spend and the sales your ads brought in. See your ROAS, what each ad order really
            leaves you after commission and costs, and the ROAS you need just to break even.
          </p>
        </div>
      </header>

      <section className="container-x py-12 lg:py-16" aria-label="Calculator">
        <AdsRoasCalculator />
      </section>

      <section className="container-x pb-16 lg:pb-24" aria-labelledby="how-it-works">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <h2 id="how-it-works" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              How the calculator works
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-cream-300">
              <p>
                ROAS = sales from ads ÷ ad spend. Orders from ads = sales from ads ÷ average order value, and the ad
                cost per order is your spend divided by those orders.
              </p>
              <p>
                Profit per ad order = order value − commission (with 18% GST on it) − food cost − packaging − ad cost
                per order. Break-even ROAS is the ROAS at which that profit is exactly zero: order value ÷ what an order
                leaves before ads.
              </p>
              <p>
                Take ad spend and ad sales for the same month from your ads dashboard, and your commission rate from
                your agreement or payout statement. If you fund discounts on these orders, your true break-even is
                higher than shown.
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
        eyebrow="Ads not paying back?"
        title="We check every rupee of your ad spend."
        body="A growth audit reads your Swiggy and Zomato ads and payout data, shows which campaigns earn and which burn margin, and what to fix first."
      />
    </>
  );
}
