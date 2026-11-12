"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

/**
 * Swiggy & Zomato commission calculator.
 *
 * Per order: commission and the payment / collection fee are charged on the
 * order value after any restaurant-funded discount, with 18% GST on both.
 * What is left is the payout; food and packaging then come out of that.
 * Swiggy and Zomato sit side by side because most outlets have different
 * terms on each. Defaults are example values, not either platform's rates.
 */

const FIELD =
  "w-full rounded-xl border border-cream-100/12 bg-ink-800/70 px-4 py-3 text-sm text-cream-100 placeholder:text-cream-500 transition-colors focus:border-gold-400/60 focus:outline-none focus:ring-2 focus:ring-gold-400/20";
const LABEL = "block text-xs font-semibold uppercase tracking-[0.14em] text-cream-400";

const GST = 0.18;

const inr = (n: number) =>
  `${n < 0 ? "−" : ""}₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: Math.abs(n) >= 100 ? 0 : 1 })}`;

/** ₹ in Indian units for monthly totals: ₹4.2 L, ₹85,000. */
function inrShort(n: number) {
  const v = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (v >= 1e7) return `${sign}₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `${sign}₹${(v / 1e5).toFixed(2)} L`;
  return `${sign}₹${Math.round(v).toLocaleString("en-IN")}`;
}

function num(value: string) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

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

type PlatformInput = { commission: string; fee: string; orders: string };

function compute(
  p: PlatformInput,
  shared: { aov: number; discount: number; foodPct: number; packaging: number },
) {
  const net = Math.max(0, shared.aov - shared.discount);
  const commission = net * (num(p.commission) / 100);
  const fee = net * (num(p.fee) / 100);
  const gst = (commission + fee) * GST;
  const payout = net - commission - fee - gst;
  const food = shared.aov * (shared.foodPct / 100);
  const profit = payout - food - shared.packaging;
  const orders = num(p.orders);
  const platformCut = commission + fee + gst;
  // Take-rate: everything the order loses before it reaches you, as a share of menu value.
  const takeRate = shared.aov > 0 ? ((platformCut + shared.discount) / shared.aov) * 100 : 0;
  const perPoint = net * 0.01 * (1 + GST) * orders;
  return { net, commission, fee, gst, payout, food, profit, orders, platformCut, takeRate, perPoint };
}

export function CommissionCalculator() {
  const [aov, setAov] = useState("400");
  const [discount, setDiscount] = useState("30");
  const [foodPct, setFoodPct] = useState("32");
  const [packaging, setPackaging] = useState("20");
  const [swiggy, setSwiggy] = useState<PlatformInput>({ commission: "22", fee: "2", orders: "600" });
  const [zomato, setZomato] = useState<PlatformInput>({ commission: "22", fee: "2", orders: "600" });

  const r = useMemo(() => {
    const shared = { aov: num(aov), discount: num(discount), foodPct: num(foodPct), packaging: num(packaging) };
    const s = compute(swiggy, shared);
    const z = compute(zomato, shared);
    return { s, z, shared };
  }, [aov, discount, foodPct, packaging, swiggy, zomato]);

  const inputs = [aov, discount, foodPct, packaging, JSON.stringify(swiggy), JSON.stringify(zomato)].join("|");
  const initial = useRef(inputs);
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current || inputs === initial.current) return;
    tracked.current = true;
    track("calculator_use", { tool: "commission_calculator" });
  }, [inputs]);

  const rows: [string, number, number][] = [
    ["Order value (menu prices)", r.shared.aov, r.shared.aov],
    ["Discount you fund", -r.shared.discount, -r.shared.discount],
    ["Commission", -r.s.commission, -r.z.commission],
    ["Payment / collection fee", -r.s.fee, -r.z.fee],
    ["18% GST on commission and fee", -r.s.gst, -r.z.gst],
  ];

  const monthlyCut = r.s.platformCut * r.s.orders + r.z.platformCut * r.z.orders;
  const monthlyProfit = r.s.profit * r.s.orders + r.z.profit * r.z.orders;

  const platformFields = (
    key: "s" | "z",
    name: string,
    value: PlatformInput,
    set: (v: PlatformInput) => void,
  ) => (
    <div className="rounded-2xl border border-cream-100/10 p-5">
      <p className="font-display text-base font-semibold text-cream-50">{name}</p>
      <div className="mt-4 grid gap-4">
        <Field
          id={`${key}-comm`}
          label="Commission"
          suffix="%"
          value={value.commission}
          onChange={(v) => set({ ...value, commission: v })}
        />
        <Field
          id={`${key}-fee`}
          label="Payment / collection fee"
          suffix="%"
          value={value.fee}
          onChange={(v) => set({ ...value, fee: v })}
        />
        <Field
          id={`${key}-orders`}
          label="Orders per month"
          value={value.orders}
          onChange={(v) => set({ ...value, orders: v })}
        />
      </div>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
      {/* ---------------- Inputs ---------------- */}
      <div className="card card-sheen p-6 md:p-8">
        <h2 className="font-display text-lg font-semibold text-cream-50">Your numbers</h2>
        <p className="mt-1.5 text-sm text-cream-400">
          The figures below are examples. Replace them with the rates in your own agreement and payout statement.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field id="cc-aov" label="Average order value" prefix="₹" value={aov} onChange={setAov} />
          <Field
            id="cc-disc"
            label="Discount you fund per order"
            prefix="₹"
            hint="Average across all orders"
            value={discount}
            onChange={setDiscount}
          />
          <Field id="cc-food" label="Food cost" suffix="%" value={foodPct} onChange={setFoodPct} />
          <Field id="cc-pack" label="Packaging per order" prefix="₹" value={packaging} onChange={setPackaging} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {platformFields("s", "Swiggy", swiggy, setSwiggy)}
          {platformFields("z", "Zomato", zomato, setZomato)}
        </div>
      </div>

      {/* ---------------- Results ---------------- */}
      <div className="card p-6 md:p-8" aria-live="polite">
        <div className="grid gap-6 sm:grid-cols-2">
          {(
            [
              ["Swiggy", r.s],
              ["Zomato", r.z],
            ] as const
          ).map(([name, x]) => (
            <div key={name}>
              <p className={LABEL}>{name} payout per order</p>
              <p className="mt-3 font-display text-[length:var(--text-display-md)] font-bold leading-none tabular-nums text-cream-50">
                {inr(x.payout)}
              </p>
              <p
                className={cn(
                  "mt-2 text-sm font-semibold tabular-nums",
                  x.takeRate > 35 ? "text-red-400" : x.takeRate > 28 ? "text-gold-300" : "text-emerald-400",
                )}
              >
                {x.takeRate.toFixed(1)}% of the order goes before it reaches you
              </p>
            </div>
          ))}
        </div>

        <div className="mt-7 overflow-x-auto">
          <table className="w-full min-w-[22rem] text-sm">
            <thead>
              <tr className="border-b border-cream-100/10 text-left text-xs uppercase tracking-[0.12em] text-cream-500">
                <th className="py-2.5 pr-3 font-semibold">Per order</th>
                <th className="py-2.5 pr-3 text-right font-semibold">Swiggy</th>
                <th className="py-2.5 text-right font-semibold">Zomato</th>
              </tr>
            </thead>
            <tbody className="text-cream-300">
              {rows.map(([label, a, b]) => (
                <tr key={label} className="border-b border-cream-100/6">
                  <td className="py-2.5 pr-3">{label}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{inr(a)}</td>
                  <td className="py-2.5 text-right tabular-nums">{inr(b)}</td>
                </tr>
              ))}
              <tr className="border-b border-cream-100/10 font-semibold text-cream-50">
                <td className="py-3 pr-3">Payout to you</td>
                <td className="py-3 pr-3 text-right tabular-nums">{inr(r.s.payout)}</td>
                <td className="py-3 text-right tabular-nums">{inr(r.z.payout)}</td>
              </tr>
              <tr className="border-b border-cream-100/6">
                <td className="py-2.5 pr-3">Food and packaging</td>
                <td className="py-2.5 pr-3 text-right tabular-nums">{inr(-(r.s.food + r.shared.packaging))}</td>
                <td className="py-2.5 text-right tabular-nums">{inr(-(r.z.food + r.shared.packaging))}</td>
              </tr>
              <tr className="font-semibold text-cream-50">
                <td className="py-3 pr-3">Left per order</td>
                <td className={cn("py-3 pr-3 text-right tabular-nums", r.s.profit < 0 && "text-red-400")}>
                  {inr(r.s.profit)}
                </td>
                <td className={cn("py-3 text-right tabular-nums", r.z.profit < 0 && "text-red-400")}>
                  {inr(r.z.profit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-7 grid gap-4 rounded-2xl border border-gold-400/25 bg-gold-500/8 p-5 sm:grid-cols-2">
          <div>
            <p className={LABEL}>Commission, fees and GST a month</p>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums text-gold-300">{inrShort(monthlyCut)}</p>
            <p className="mt-1 text-xs text-cream-400">Both apps, at your monthly orders</p>
          </div>
          <div>
            <p className={LABEL}>Each 1% of commission costs</p>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums text-gold-300">
              {inrShort(r.s.perPoint + r.z.perPoint)}
              <span className="ml-1 text-sm font-semibold text-cream-400">/month</span>
            </p>
            <p className="mt-1 text-xs text-cream-400">
              Left after food and packaging: {inrShort(monthlyProfit)} a month
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-cream-500">
          Assumes commission and the payment fee are charged on the order value after a discount you fund, with 18%
          GST on both. Excludes the 5% GST on food (collected by the platform), ads, long-distance or other per-order
          fees, and TDS (which you can claim back). Your actual rates and their base are set in your agreement, so
          check them against a real payout statement.
        </p>
      </div>
    </div>
  );
}
