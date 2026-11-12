import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { CommissionCalculator } from "@/components/tools/CommissionCalculator";
import { CTABand } from "@/components/site/CTABand";
import { jsonLd, breadcrumbSchema, faqSchema, webApplicationSchema } from "@/lib/seo";
import { ogImageUrl } from "@/lib/utils";

const PATH = "/tools/commission-calculator";
const DESCRIPTION =
  "Free Swiggy and Zomato commission calculator: see your payout per order after commission, fees and GST, and what each 1% of commission costs you a month.";

export const metadata: Metadata = {
  title: { absolute: "Swiggy & Zomato Commission Calculator | PFC" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: "Swiggy & Zomato Commission Calculator",
    description: "What does each order really pay you after commission, fees and GST? Find out in 30 seconds.",
    url: PATH,
    images: [{ url: ogImageUrl("Swiggy & Zomato Commission Calculator", "Free tool"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiggy & Zomato Commission Calculator",
    description: "What does each order really pay you after commission, fees and GST? Find out in 30 seconds.",
    images: [ogImageUrl("Swiggy & Zomato Commission Calculator", "Free tool")],
  },
};

const faqs = [
  {
    q: "How is Swiggy and Zomato commission calculated?",
    a: "Commission is a percentage of the order value, usually after any discount you fund, and 18% GST is added on top of it. Most restaurants also pay a payment or collection fee on the same base, with GST. What remains is your payout, before food and packaging costs. The exact rates and base are set in your partner agreement.",
  },
  {
    q: "What commission do Swiggy and Zomato charge restaurants?",
    a: "There is no single published rate. It depends on your contract, city, outlet type and the services you take, such as delivery. Recent industry reporting puts most restaurant commissions somewhere between the high teens and around 30% of order value. Use the rate in your own agreement or payout statement in this calculator.",
  },
  {
    q: "What is a good effective take-rate on Swiggy and Zomato?",
    a: "Add commission, fees, GST on both, ads and the discounts you fund, then divide by your sales. Many well-run listings we work with keep that effective take-rate under about 25 to 30%. Above 35%, profit per order is usually thin, so check discounts and ad returns first.",
  },
  {
    q: "Does the calculator include GST on food?",
    a: "No. Since January 2022 the platforms collect and pay the 5% GST on food ordered through them, so it does not come out of your payout. The calculator does include the 18% GST on commission and fees, which is a real cost unless you can claim it as input tax credit.",
  },
  {
    q: "How can I reduce what I pay in commission?",
    a: "Start with what you control: deep discounts, ads that do not pay back, and order rejections. Then renegotiate from data, with your order volume, rating and cancellation record in hand. Steer clear of anyone offering hidden or off-agreement commission deals.",
  },
];

const related = [
  { href: "/swiggy-vs-zomato-commission-side-by-side-comparison-for-2026", label: "Swiggy vs Zomato commission, side by side" },
  { href: "/zomato-commission-structure-2026-what-restaurants-actually-pay", label: "Zomato commission structure 2026" },
  { href: "/how-to-read-your-swiggy-and-zomato-payout-statement", label: "How to read your payout statement" },
  { href: "/tools/discount-calculator", label: "Discount calculator: will an offer pay for itself?" },
  { href: "/commission-reduction", label: "Commission Reduction Program" },
];

export default function CommissionCalculatorPage() {
  const schema = jsonLd(
    webApplicationSchema({ name: "Swiggy & Zomato Commission Calculator", description: DESCRIPTION, path: PATH }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Commission Calculator", path: PATH },
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
              <li className="text-cream-300">Commission Calculator</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">Free tool</p>
          <h1 className="mt-5 max-w-3xl text-[length:var(--text-display-lg)] font-bold leading-[1.05] tracking-[-0.03em]">
            Swiggy &amp; Zomato commission calculator
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-300">
            Enter your order value, commission and fees for each app. See what every order actually pays you after
            commission, fees and GST, what is left after food and packaging, and what each 1% of commission costs
            you a month.
          </p>
        </div>
      </header>

      <section className="container-x py-12 lg:py-16" aria-label="Calculator">
        <CommissionCalculator />
      </section>

      <section className="container-x pb-16 lg:pb-24" aria-labelledby="how-it-works">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <h2 id="how-it-works" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
              How the calculator works
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-cream-300">
              <p>
                Any discount you fund comes off the order value first. Commission and the payment or collection fee
                are charged on what remains, and 18% GST is added to both. The rest is your payout.
              </p>
              <p>
                Food and packaging costs are then taken from the payout to show what each order really leaves you.
                The take-rate shows how much of the menu value is gone before money reaches your account.
              </p>
              <p>
                Rates differ by contract, so the calculator keeps Swiggy and Zomato separate. Take your numbers from
                the latest weekly payout statement, not from memory.
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
        eyebrow="Paying too much per order?"
        title="We check every deduction in your payouts."
        body="A growth audit reads your Swiggy and Zomato payout statements line by line, finds where margin is leaking, and shows what to fix first."
      />
    </>
  );
}
