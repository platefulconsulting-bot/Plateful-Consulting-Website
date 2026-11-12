"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

/**
 * Swiggy & Zomato ads ROAS calculator.
 *
 * ROAS = sales from ads ÷ ad spend. Per ad order, the restaurant keeps the
 * order value minus commission (plus 18% GST on it), food cost, packaging and
 * the ad cost of winning that order (ad spend ÷ ad orders = AOV ÷ ROAS).
 * Break-even ROAS is the ROAS at which that profit is exactly zero.
 * Defaults are examples only.
 */

const GST = 0.18;
const FIELD =
  "w-full rounded-xl border border-cream-100/12 bg-ink-800/70 px-4 py-3 text-sm text-cream-100 transition-colors focus:border-gold-400/60 focus:outline-none focus:ring-2 focus:ring-gold-400/20";
const LABEL = "block text-xs font-semibold uppercase tracking-[0.14em] text-cream-400";

function num(value: string) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** ₹ in Indian units: ₹3.07 L, ₹85,000, ₹1.2 Cr. */
function inr(n: number) {
  const v = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (v >= 1e7) return `${s}₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `${s}₹${(v / 1e5).toFixed(2)} L`;
  return `${s}₹${Math.round(v).toLocaleString("en-IN")}`;
}

function Field({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
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
          className={cn(FIELD, "tabular-nums", prefix && "pl-8", suffix && "pr-9")}
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

export function AdsRoasCalculator() {
  // Example numbers only: ₹30,000 spend bringing ₹1.5 L of ad sales (5x).
  const [spend, setSpend] = useState("30000");
  const [sales, setSales] = useState("150000");
  const [aov, setAov] = useState("400");
  const [commissionPct, setCommissionPct] = useState("22");
  const [foodPct, setFoodPct] = useState("32");
  const [packaging, setPackaging] = useState("20");

  const r = useMemo(() => {
    const S = num(spend);
    const R = num(sales);
    const A = num(aov);
    const roas = S > 0 ? R / S : 0;
    const orders = A > 0 ? R / A : 0;

    const commission = A * (num(commissionPct) / 100) * (1 + GST);
    const food = A * (num(foodPct) / 100);
    const pack = num(packaging);
    const beforeAds = A - commission - food - pack;
    const adCost = orders > 0 ? S / orders : 0;
    const profit = beforeAds - adCost;
    const breakEven = beforeAds > 0 ? A / beforeAds : null;

    return { S, R, A, roas, orders, commission, food, pack, beforeAds, adCost, profit, breakEven, monthly: profit * orders };
  }, [spend, sales, aov, commissionPct, foodPct, packaging]);

  // Count a visitor as a calculator user once, the first time any input
  // differs from the defaults (robust to effects running twice in dev).
  const inputs = [spend, sales, aov, commissionPct, foodPct, packaging].join("|");
  const initial = useRef(inputs);
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current || inputs === initial.current) return;
    tracked.current = true;
    track("calculator_use", { tool: "ads_roas_calculator" });
  }, [inputs]);

  const ready = r.S > 0 && r.R > 0 && r.A > 0;
  const ratio = r.breakEven ? r.roas / r.breakEven : 0;
  const verdict = !ready
    ? null
    : r.breakEven === null
      ? {
          label: "Losing money",
          tone: "text-red-400",
          box: "border-red-400/25 bg-red-500/8",
          body: "Even before ads, commission, food and packaging eat the whole order. No ROAS fixes this; look at prices and costs first.",
        }
      : ratio >= 1.15
        ? {
            label: "Profitable",
            tone: "text-emerald-400",
            box: "border-emerald-400/25 bg-emerald-500/8",
            body: "Each ad order leaves money after every cost. Keep checking that these are new customers, not orders you would have got anyway.",
          }
        : ratio >= 0.95
          ? {
              label: "Near break-even",
              tone: "text-gold-300",
              box: "border-gold-400/30 bg-gold-500/10",
              body: "The ads roughly pay for themselves. Tighten targeting, dayparts and bids before you put more money in.",
            }
          : {
              label: "Losing money",
              tone: "text-red-400",
              box: "border-red-400/25 bg-red-500/8",
              body: "Each ad order costs more than it earns. Pause or cut the weakest campaigns and fix the listing before spending again.",
            };

  const rows: [string, number][] = [
    ["Order value", r.A],
    ["Commission + 18% GST", -r.commission],
    ["Food cost", -r.food],
    ["Packaging", -r.pack],
    ["Ad cost per order", -r.adCost],
  ];

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        {/* ---------------- Inputs ---------------- */}
        <div className="card card-sheen p-6 md:p-8">
          <h2 className="font-display text-lg font-semibold text-cream-50">Your numbers</h2>
          <p className="mt-1.5 text-sm text-cream-400">Example figures are filled in. Type over them with yours.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field id="spend" label="Monthly ad spend" prefix="₹" value={spend} onChange={setSpend} />
            <Field id="sales" label="Sales from ads" prefix="₹" value={sales} onChange={setSales} hint="From your ads dashboard, same month" />
            <Field id="aov" label="Average order value" prefix="₹" value={aov} onChange={setAov} />
            <Field id="comm" label="Commission" suffix="%" value={commissionPct} onChange={setCommissionPct} />
            <Field id="food" label="Food cost" suffix="%" value={foodPct} onChange={setFoodPct} />
            <Field id="pack" label="Packaging per order" prefix="₹" value={packaging} onChange={setPackaging} />
          </div>
        </div>

        {/* ---------------- Results ---------------- */}
        <div className="card p-6 md:p-8" aria-live="polite">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className={LABEL}>Your ROAS</p>
              <p className="mt-2 font-display text-[length:var(--text-display-md)] font-bold leading-none tabular-nums text-cream-50">
                {ready ? `${r.roas.toFixed(1)}x` : "—"}
              </p>
              <p className="mt-2 text-xs text-cream-500">Sales from ads ÷ ad spend</p>
            </div>
            <div>
              <p className={LABEL}>Break-even ROAS</p>
              <p className="mt-2 font-display text-[length:var(--text-display-md)] font-bold leading-none tabular-nums text-gold-300">
                {r.breakEven ? `${r.breakEven.toFixed(1)}x` : "—"}
              </p>
              <p className="mt-2 text-xs text-cream-500">Below this, ads lose money</p>
            </div>
          </div>

          {verdict && (
            <div className={cn("mt-6 rounded-2xl border px-5 py-4", verdict.box)}>
              <p className={cn("font-display text-xl font-bold", verdict.tone)}>{verdict.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-cream-300">{verdict.body}</p>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-cream-100/10 px-5 py-4">
              <p className={LABEL}>Orders from ads</p>
              <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-cream-50">
                {ready ? Math.round(r.orders).toLocaleString("en-IN") : "—"}
                <span className="ml-1.5 text-sm font-semibold text-cream-400">/ month</span>
              </p>
            </div>
            <div className="rounded-2xl border border-cream-100/10 px-5 py-4">
              <p className={LABEL}>Profit per ad order</p>
              <p
                className={cn(
                  "mt-1.5 font-display text-2xl font-bold tabular-nums",
                  r.profit >= 0 ? "text-emerald-400" : "text-red-400",
                )}
              >
                {ready ? inr(r.profit) : "—"}
              </p>
              {ready && <p className="mt-0.5 text-xs text-cream-400">{inr(r.monthly)} a month from ad orders</p>}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[18rem] text-sm">
              <thead>
                <tr className="border-b border-cream-100/10 text-left text-xs uppercase tracking-[0.12em] text-cream-500">
                  <th className="py-2.5 pr-3 font-semibold">Per ad order</th>
                  <th className="py-2.5 text-right font-semibold">₹</th>
                </tr>
              </thead>
              <tbody className="text-cream-300">
                {rows.map(([label, v]) => (
                  <tr key={label} className="border-b border-cream-100/6">
                    <td className="py-2.5 pr-3">{label}</td>
                    <td className="py-2.5 text-right tabular-nums">{ready ? inr(v) : "—"}</td>
                  </tr>
                ))}
                <tr className="font-semibold text-cream-50">
                  <td className="py-3 pr-3">You keep</td>
                  <td className={cn("py-3 text-right tabular-nums", r.profit < 0 && "text-red-400")}>
                    {ready ? inr(r.profit) : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-cream-500">
        Illustrative only. Profit per ad order = order value − commission (with 18% GST) − food cost − packaging − ad
        spend ÷ ad orders. Break-even ROAS = order value ÷ what an order leaves before ads. Payment gateway fees,
        discounts you fund and GST on the ad invoice are not included; if they apply to you, your real break-even is
        higher. The figures shown are examples, not Swiggy&apos;s or Zomato&apos;s rates: your commission is set by your
        agreement with each platform.
      </p>
    </div>
  );
}
