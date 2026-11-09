"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

/**
 * Swiggy & Zomato discount break-even calculator.
 *
 * Mirrors the worked maths in the discounts article: a restaurant-funded
 * discount comes off the order value, commission (plus 18% GST) is charged on
 * what remains, and food and packaging costs do not move. The output is how
 * many more orders the offer needs before total contribution is back where it
 * was without it.
 */

const FIELD =
  "w-full rounded-xl border border-cream-100/12 bg-ink-800/70 px-4 py-3 text-sm text-cream-100 placeholder:text-cream-500 transition-colors focus:border-gold-400/60 focus:outline-none focus:ring-2 focus:ring-gold-400/20";
const LABEL = "block text-xs font-semibold uppercase tracking-[0.14em] text-cream-400";

const GST_ON_COMMISSION = 0.18;

type OfferType = "percent" | "flat" | "free";

const OFFER_TYPES: { id: OfferType; label: string; hint: string }[] = [
  { id: "percent", label: "% off with a cap", hint: "e.g. 50% off up to ₹100" },
  { id: "flat", label: "Flat ₹ off above a minimum", hint: "e.g. ₹75 off above ₹499" },
  { id: "free", label: "Free item above a minimum", hint: "e.g. free dessert above ₹449" },
];

const inr = (n: number) =>
  `${n < 0 ? "−" : ""}₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: n % 1 === 0 ? 0 : 1 })}`;

function num(value: string) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function contribution(o: {
  orderValue: number;
  discount: number;
  extraFoodCost: number;
  foodCostPct: number;
  packaging: number;
  commissionPct: number;
}) {
  const net = Math.max(0, o.orderValue - o.discount);
  const commission = net * (o.commissionPct / 100);
  const gst = commission * GST_ON_COMMISSION;
  const food = o.orderValue * (o.foodCostPct / 100) + o.extraFoodCost;
  return { net, commission, gst, food, packaging: o.packaging, value: net - commission - gst - food - o.packaging };
}

function Field({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  id: string;
  label: string;
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
    </div>
  );
}

export function DiscountCalculator() {
  // Defaults reproduce the article's worked example, so the two agree.
  const [aov, setAov] = useState("400");
  const [foodCostPct, setFoodCostPct] = useState("32");
  const [packaging, setPackaging] = useState("20");
  const [commissionPct, setCommissionPct] = useState("25");
  const [ordersPerDay, setOrdersPerDay] = useState("40");

  const [offer, setOffer] = useState<OfferType>("percent");
  const [pct, setPct] = useState("50");
  const [cap, setCap] = useState("100");
  const [flat, setFlat] = useState("75");
  const [freeItemCost, setFreeItemCost] = useState("25");
  const [minOrder, setMinOrder] = useState("499");
  const [offerAov, setOfferAov] = useState("520");

  const result = useMemo(() => {
    const base = {
      foodCostPct: num(foodCostPct),
      packaging: num(packaging),
      commissionPct: num(commissionPct),
    };
    const currentAov = num(aov);
    const baseline = contribution({ ...base, orderValue: currentAov, discount: 0, extraFoodCost: 0 });

    let orderValue = currentAov;
    let discount = 0;
    let extraFoodCost = 0;
    let warning: string | null = null;

    if (offer === "percent") {
      discount = Math.min(currentAov * (num(pct) / 100), num(cap) || Infinity);
    } else {
      orderValue = num(offerAov);
      if (orderValue < num(minOrder)) {
        warning = "Your expected order value with the offer is below the minimum order, so most orders would not qualify.";
      }
      if (offer === "flat") discount = num(flat);
      else extraFoodCost = num(freeItemCost);
    }

    const withOffer = contribution({ ...base, orderValue, discount, extraFoodCost });
    const lift = withOffer.value > 0 ? baseline.value / withOffer.value - 1 : null;
    const daily = num(ordersPerDay);

    return { baseline, withOffer, orderValue, discount, extraFoodCost, lift, warning, daily };
  }, [aov, foodCostPct, packaging, commissionPct, ordersPerDay, offer, pct, cap, flat, freeItemCost, minOrder, offerAov]);

  // Count a visitor as a calculator user once, the first time any input
  // differs from the defaults (robust to effects running twice in dev).
  const inputs = [aov, foodCostPct, packaging, commissionPct, ordersPerDay, offer, pct, cap, flat, freeItemCost, minOrder, offerAov].join("|");
  const initialInputs = useRef(inputs);
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current || inputs === initialInputs.current) return;
    tracked.current = true;
    track("calculator_use", { tool: "discount_calculator" });
  }, [inputs]);

  const { baseline, withOffer, lift } = result;
  const verdict =
    lift === null || baseline.value <= 0
      ? { label: "Loss on every order", tone: "text-red-400", body: "At these numbers each order loses money, so no amount of extra volume makes this offer pay." }
      : lift <= 0.1
        ? { label: "Margin-safe", tone: "text-emerald-400", body: "The offer needs only a small lift in orders to pay for itself. A strong candidate to run." }
        : lift <= 0.4
          ? { label: "Test carefully", tone: "text-gold-300", body: "Run it time-boxed, on slow dayparts or new customers, and measure net payout, not order count." }
          : { label: "Likely burning margin", tone: "text-red-400", body: "Few listings sustain an order lift this large. Consider a threshold offer or a free item instead." };

  const rows: [string, number, number][] = [
    ["Order value", num(aov), result.orderValue],
    ["Restaurant-funded discount", 0, -result.discount],
    ["Commission", -baseline.commission, -withOffer.commission],
    ["GST on commission (18%)", -baseline.gst, -withOffer.gst],
    ["Food cost", -baseline.food, -withOffer.food],
    ["Packaging", -baseline.packaging, -withOffer.packaging],
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
      {/* ---------------- Inputs ---------------- */}
      <div className="card card-sheen p-6 md:p-8">
        <h2 className="font-display text-lg font-semibold text-cream-50">Your numbers</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field id="aov" label="Average order value" prefix="₹" value={aov} onChange={setAov} />
          <Field id="food" label="Food cost" suffix="%" value={foodCostPct} onChange={setFoodCostPct} />
          <Field id="pack" label="Packaging per order" prefix="₹" value={packaging} onChange={setPackaging} />
          <Field id="comm" label="Commission" suffix="%" value={commissionPct} onChange={setCommissionPct} />
          <Field id="opd" label="Orders per day today" value={ordersPerDay} onChange={setOrdersPerDay} />
        </div>

        <fieldset className="mt-8">
          <legend className={LABEL}>Offer type</legend>
          <div className="mt-3 grid gap-2.5">
            {OFFER_TYPES.map((t) => (
              <label
                key={t.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                  offer === t.id
                    ? "border-gold-400/60 bg-gold-500/10 text-cream-50"
                    : "border-cream-100/12 text-cream-300 hover:border-cream-100/25",
                )}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="offer"
                    value={t.id}
                    checked={offer === t.id}
                    onChange={() => setOffer(t.id)}
                    className="accent-[var(--color-gold-400)]"
                  />
                  {t.label}
                </span>
                <span className="hidden text-xs text-cream-500 sm:inline">{t.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {offer === "percent" && (
            <>
              <Field id="pct" label="Discount" suffix="%" value={pct} onChange={setPct} />
              <Field id="cap" label="Maximum discount" prefix="₹" value={cap} onChange={setCap} />
            </>
          )}
          {offer === "flat" && <Field id="flat" label="Flat discount" prefix="₹" value={flat} onChange={setFlat} />}
          {offer === "free" && (
            <Field id="free" label="Free item's food cost" prefix="₹" value={freeItemCost} onChange={setFreeItemCost} />
          )}
          {offer !== "percent" && (
            <>
              <Field id="min" label="Minimum order" prefix="₹" value={minOrder} onChange={setMinOrder} />
              <Field id="oaov" label="Expected AOV with offer" prefix="₹" value={offerAov} onChange={setOfferAov} />
            </>
          )}
        </div>
        {result.warning && <p className="mt-4 text-sm text-gold-300">{result.warning}</p>}
      </div>

      {/* ---------------- Results ---------------- */}
      <div className="card p-6 md:p-8" aria-live="polite">
        <p className={LABEL}>Extra orders needed to break even</p>
        <p className={cn("mt-3 font-display text-[length:var(--text-display-md)] font-bold leading-none", verdict.tone)}>
          {lift === null || baseline.value <= 0 ? "—" : `+${Math.round(lift * 100)}%`}
        </p>
        <p className={cn("mt-3 font-display text-base font-semibold", verdict.tone)}>{verdict.label}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-cream-400">{verdict.body}</p>

        {lift !== null && baseline.value > 0 && result.daily > 0 && (
          <p className="mt-4 text-sm text-cream-300">
            At {result.daily} orders a day today, you would need about{" "}
            <strong className="text-cream-50">{Math.ceil(result.daily * (1 + lift))} orders a day</strong> with the
            offer just to earn the same.
          </p>
        )}

        <div className="mt-7 overflow-x-auto">
          <table className="w-full min-w-[22rem] text-sm">
            <thead>
              <tr className="border-b border-cream-100/10 text-left text-xs uppercase tracking-[0.12em] text-cream-500">
                <th className="py-2.5 pr-3 font-semibold">Per order</th>
                <th className="py-2.5 pr-3 text-right font-semibold">No offer</th>
                <th className="py-2.5 text-right font-semibold">With offer</th>
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
              {result.extraFoodCost > 0 && (
                <tr className="border-b border-cream-100/6">
                  <td className="py-2.5 pr-3">Includes free item</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">—</td>
                  <td className="py-2.5 text-right tabular-nums">{inr(-result.extraFoodCost)}</td>
                </tr>
              )}
              <tr className="font-semibold text-cream-50">
                <td className="py-3 pr-3">Contribution</td>
                <td className="py-3 pr-3 text-right tabular-nums">{inr(baseline.value)}</td>
                <td className="py-3 text-right tabular-nums">{inr(withOffer.value)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-cream-500">
          Assumes commission is charged on the order value after a restaurant-funded discount, with 18% GST on
          commission. Excludes the 5% GST on food, which the platform collects. Check the commission base in your own
          agreement.
        </p>
      </div>
    </div>
  );
}
