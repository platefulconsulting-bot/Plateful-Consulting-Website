"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

/**
 * Effective take-rate calculator for the Commission Reduction Program page.
 *
 * The headline commission is only part of what a restaurant gives up per
 * order: GST on commission, aggregator ads (plus GST) and restaurant-funded
 * discounts all come out of the same sales. This adds them up, then shows
 * what the year looks like at a lower effective take-rate the owner chooses.
 * It is illustrative on purpose: nothing here promises a specific rate.
 */

const FIELD =
  "w-full rounded-xl border border-cream-100/12 bg-ink-800/70 px-4 py-3 text-sm text-cream-100 placeholder:text-cream-500 transition-colors focus:border-gold-400/60 focus:outline-none focus:ring-2 focus:ring-gold-400/20";
const LABEL = "block text-xs font-semibold uppercase tracking-[0.14em] text-cream-400";

const GST = 0.18;

function num(value: string) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** ₹ in Indian units: ₹4.2L, ₹1.3Cr, ₹85,000. */
function inrShort(n: number) {
  const v = Math.max(0, n);
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(v >= 1e8 ? 0 : 2)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(v >= 1e6 ? 1 : 2)} L`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

const pct = (n: number) => `${n.toFixed(1)}%`;

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="relative mt-2">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-cream-500">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(FIELD, prefix && "pl-8", suffix && "pr-9")}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-cream-500">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-cream-500">{hint}</p>}
    </div>
  );
}

export function CommissionSavingsCalculator() {
  const [sales, setSales] = useState("1000000");
  const [commission, setCommission] = useState("22");
  const [ads, setAds] = useState("40000");
  const [discountPct, setDiscountPct] = useState("6");
  const [target, setTarget] = useState(25);

  const r = useMemo(() => {
    const gmv = num(sales);
    const commissionCost = gmv * (num(commission) / 100) * (1 + GST);
    const adsCost = num(ads) * (1 + GST);
    const discountCost = gmv * (num(discountPct) / 100);
    const total = commissionCost + adsCost + discountCost;
    const rate = gmv > 0 ? (total / gmv) * 100 : 0;
    const monthlySaving = gmv > 0 ? Math.max(0, ((rate - target) / 100) * gmv) : 0;
    return { gmv, commissionCost, adsCost, discountCost, total, rate, monthlySaving, yearlySaving: monthlySaving * 12 };
  }, [sales, commission, ads, discountPct, target]);

  // Count a visitor as a calculator user once, the first time an input moves.
  const inputs = [sales, commission, ads, discountPct, target].join("|");
  const initial = useRef(inputs);
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current || inputs === initial.current) return;
    tracked.current = true;
    track("calculator_use", { tool: "commission_savings_calculator" });
  }, [inputs]);

  const rows: [string, number][] = [
    ["Commission + 18% GST", r.commissionCost],
    ["Aggregator ads + 18% GST", r.adsCost],
    ["Restaurant-funded discounts", r.discountCost],
  ];

  const alreadyLow = r.gmv > 0 && r.rate <= target;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
      {/* ---------------- Inputs ---------------- */}
      <div className="card card-sheen p-6 md:p-8">
        <h3 className="font-display text-lg font-semibold text-cream-50">Your monthly numbers</h3>
        <p className="mt-1.5 text-sm text-cream-400">Swiggy + Zomato combined. Your payout statement has all four.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field id="cs-sales" label="Monthly sales on apps" prefix="₹" value={sales} onChange={setSales} />
          <Field id="cs-comm" label="Commission rate" suffix="%" value={commission} onChange={setCommission} />
          <Field id="cs-ads" label="Monthly ad spend" prefix="₹" value={ads} onChange={setAds} />
          <Field
            id="cs-disc"
            label="Discounts you fund"
            suffix="%"
            hint="As a share of sales"
            value={discountPct}
            onChange={setDiscountPct}
          />
        </div>

        <div className="mt-8">
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="cs-target" className={LABEL}>
              Effective take-rate to compare against
            </label>
            <span className="font-display text-lg font-semibold text-gold-300 tabular-nums">{target}%</span>
          </div>
          <input
            id="cs-target"
            type="range"
            min={18}
            max={32}
            step={1}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--color-gold-400)]"
          />
          <p className="mt-1.5 text-xs text-cream-500">
            Under 25% is the range most of our well-run listings sit in. It is a comparison point, not a promise.
          </p>
        </div>
      </div>

      {/* ---------------- Results ---------------- */}
      <div className="card p-6 md:p-8" aria-live="polite">
        <p className={LABEL}>Your effective take-rate today</p>
        <p
          className={cn(
            "mt-3 font-display text-[length:var(--text-display-md)] font-bold leading-none tabular-nums",
            r.rate > 30 ? "text-red-400" : r.rate > 25 ? "text-gold-300" : "text-emerald-400",
          )}
        >
          {r.gmv > 0 ? pct(r.rate) : "—"}
        </p>
        <p className="mt-2 text-sm text-cream-400">
          That is <strong className="text-cream-100">{inrShort(r.total)}</strong> a month going to the apps, out of{" "}
          {inrShort(r.gmv)} in sales.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[20rem] text-sm">
            <tbody className="text-cream-300">
              {rows.map(([label, value]) => (
                <tr key={label} className="border-b border-cream-100/6">
                  <td className="py-2.5 pr-3">{label}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{inrShort(value)}/mo</td>
                  <td className="py-2.5 text-right tabular-nums text-cream-500">
                    {r.gmv > 0 ? pct((value / r.gmv) * 100) : "—"}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold text-cream-50">
                <td className="py-3 pr-3">Total</td>
                <td className="py-3 pr-3 text-right tabular-nums">{inrShort(r.total)}/mo</td>
                <td className="py-3 text-right tabular-nums">{r.gmv > 0 ? pct(r.rate) : "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-7 rounded-2xl border border-gold-400/25 bg-gold-500/8 p-5">
          {alreadyLow ? (
            <p className="text-sm leading-relaxed text-cream-200">
              You are already at or under {target}%. The bigger win is probably more orders, not a lower rate.{" "}
              <Link href="/contact-us" className="font-medium text-gold-300 underline-offset-4 hover:underline">
                Talk to us about growth
              </Link>
              .
            </p>
          ) : (
            <>
              <p className={LABEL}>At a {target}% effective take-rate you would keep</p>
              <p className="mt-2 font-display text-[length:var(--text-display-md)] font-bold leading-none text-gold-300 tabular-nums">
                {inrShort(r.yearlySaving)}
                <span className="ml-2 text-base font-semibold text-cream-400">a year</span>
              </p>
              <p className="mt-2 text-sm text-cream-400">
                About {inrShort(r.monthlySaving)} a month, on the same sales.
              </p>
              <a href="#apply" className="btn btn-primary btn-sm mt-5">
                Check if you qualify
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </>
          )}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-cream-500">
          Illustrative only. Your commission rate is set in your agreement with Swiggy or Zomato, and actual savings
          depend on your listing, category and city. GST on food is collected by the platform and is not counted here.
        </p>
      </div>
    </div>
  );
}
