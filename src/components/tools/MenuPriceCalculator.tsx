"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

/**
 * Menu price after commission calculator.
 *
 * Finds the app menu price P that leaves the restaurant a chosen amount K per
 * item. A restaurant-funded discount d comes off P first; commission and the
 * payment gateway fee (plus 18% GST on both) are charged on what remains; the
 * packaging cost per item is paid by the restaurant:
 *   K = P(1 − d) × (1 − (c + g) × 1.18) − packaging
 *   P = (K + packaging) ÷ ((1 − d) × (1 − (c + g) × 1.18))
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

const inr = (n: number) => `${n < 0 ? "−" : ""}₹${Math.round(Math.abs(n)).toLocaleString("en-IN")}`;

/** Round up to the next ₹5, the way most menus are priced. */
const roundUp5 = (n: number) => Math.ceil(n / 5) * 5;

type Rates = { commission: number; gateway: number; packaging: number; discount: number };

/** App price needed to keep `keep` per item, or null when no price can do it. */
function appPrice(keep: number, r: Rates) {
  const net = (1 - r.discount / 100) * (1 - ((r.commission + r.gateway) / 100) * (1 + GST));
  if (net <= 0) return null;
  return (keep + r.packaging) / net;
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

type Dish = { name: string; price: string };

export function MenuPriceCalculator() {
  const [base, setBase] = useState("250");
  const [commissionPct, setCommissionPct] = useState("22");
  const [gatewayPct, setGatewayPct] = useState("2");
  const [packaging, setPackaging] = useState("15");
  const [keepMode, setKeepMode] = useState<"same" | "custom">("same");
  const [keepCustom, setKeepCustom] = useState("220");
  const [discountPct, setDiscountPct] = useState("0");
  const [dishes, setDishes] = useState<Dish[]>([
    { name: "Paneer butter masala", price: "280" },
    { name: "Veg biryani", price: "220" },
    { name: "Gulab jamun (2 pcs)", price: "90" },
  ]);

  const rates: Rates = useMemo(
    () => ({
      commission: num(commissionPct),
      gateway: num(gatewayPct),
      packaging: num(packaging),
      discount: Math.min(num(discountPct), 100),
    }),
    [commissionPct, gatewayPct, packaging, discountPct],
  );

  const r = useMemo(() => {
    const B = num(base);
    const keep = keepMode === "same" ? B : num(keepCustom);
    const P = appPrice(keep, rates);
    if (P === null) return { B, keep, P: null };
    const afterDiscount = P * (1 - rates.discount / 100);
    const commission = afterDiscount * (rates.commission / 100);
    const gateway = afterDiscount * (rates.gateway / 100);
    const gst = (commission + gateway) * GST;
    return {
      B,
      keep,
      P,
      rounded: roundUp5(P),
      markup: B > 0 ? (P / B - 1) * 100 : null,
      discount: P - afterDiscount,
      commission,
      gateway,
      gst,
    };
  }, [base, keepMode, keepCustom, rates]);

  // Count a visitor as a calculator user once, the first time any input
  // differs from the defaults (robust to effects running twice in dev).
  const inputs = JSON.stringify([base, commissionPct, gatewayPct, packaging, keepMode, keepCustom, discountPct, dishes]);
  const initial = useRef(inputs);
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current || inputs === initial.current) return;
    tracked.current = true;
    track("calculator_use", { tool: "menu_price_calculator" });
  }, [inputs]);

  const setDish = (i: number, d: Partial<Dish>) => setDishes((all) => all.map((x, j) => (j === i ? { ...x, ...d } : x)));

  const rows: [string, number][] =
    r.P === null
      ? []
      : [
          ["Customer sees on the app", r.P],
          ...(r.discount > 0 ? ([["Discount you fund", -r.discount]] as [string, number][]) : []),
          ["Commission", -r.commission],
          ["Payment gateway", -r.gateway],
          ["GST on both (18%)", -r.gst],
          ["Packaging", -rates.packaging],
        ];

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        {/* ---------------- Inputs ---------------- */}
        <div className="card card-sheen p-6 md:p-8">
          <h2 className="font-display text-lg font-semibold text-cream-50">Your numbers</h2>
          <p className="mt-1.5 text-sm text-cream-400">Example figures are filled in. Type over them with yours.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field id="base" label="Dine-in / base price" prefix="₹" value={base} onChange={setBase} hint="Before 5% GST on food" />
            <Field id="comm" label="Commission" suffix="%" value={commissionPct} onChange={setCommissionPct} />
            <Field id="pg" label="Payment gateway" suffix="%" value={gatewayPct} onChange={setGatewayPct} />
            <Field id="pack" label="Packaging per item" prefix="₹" value={packaging} onChange={setPackaging} hint="The cost you bear" />
            <Field
              id="disc"
              label="Discount you plan to fund"
              suffix="%"
              value={discountPct}
              onChange={setDiscountPct}
              hint="Optional. Leave 0 if none"
            />
          </div>

          <fieldset className="mt-7">
            <legend className={LABEL}>Money you want to keep per item</legend>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {(
                [
                  ["same", "Same as dine-in price"],
                  ["custom", "A custom amount"],
                ] as const
              ).map(([id, label]) => (
                <label
                  key={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                    keepMode === id
                      ? "border-gold-400/60 bg-gold-500/10 text-cream-50"
                      : "border-cream-100/12 text-cream-300 hover:border-cream-100/25",
                  )}
                >
                  <input
                    type="radio"
                    name="keep"
                    value={id}
                    checked={keepMode === id}
                    onChange={() => setKeepMode(id)}
                    className="accent-[var(--color-gold-400)]"
                  />
                  {label}
                </label>
              ))}
            </div>
            {keepMode === "custom" && (
              <div className="mt-4 sm:max-w-[50%]">
                <Field id="keep" label="Keep per item" prefix="₹" value={keepCustom} onChange={setKeepCustom} />
              </div>
            )}
          </fieldset>
        </div>

        {/* ---------------- Results ---------------- */}
        <div className="card p-6 md:p-8" aria-live="polite">
          <p className={LABEL}>App menu price you need</p>
          <p className="mt-3 font-display text-[length:var(--text-display-md)] font-bold leading-none tabular-nums text-gold-300">
            {r.P === null ? "—" : inr(r.rounded)}
          </p>
          {r.P === null ? (
            <p className="mt-3 text-sm text-red-400">
              At these rates no menu price can leave you that amount. Check the commission, gateway and discount figures.
            </p>
          ) : (
            <p className="mt-3 text-sm text-cream-300">
              Exactly {inr(r.P)}, rounded up to the next ₹5. You keep{" "}
              <strong className="text-cream-50">{inr(r.keep)}</strong> per item
              {keepMode === "same" ? ", the same as dine-in." : "."}
            </p>
          )}

          <div className="mt-6 rounded-2xl border border-gold-400/30 bg-gold-500/10 px-5 py-4">
            <p className={LABEL}>Markup over dine-in</p>
            <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-cream-50">
              {r.P === null || r.markup == null ? "—" : `${r.markup >= 0 ? "+" : ""}${r.markup.toFixed(0)}%`}
            </p>
          </div>

          {r.P !== null && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[18rem] text-sm">
                <thead>
                  <tr className="border-b border-cream-100/10 text-left text-xs uppercase tracking-[0.12em] text-cream-500">
                    <th className="py-2.5 pr-3 font-semibold">Per item</th>
                    <th className="py-2.5 text-right font-semibold">₹</th>
                  </tr>
                </thead>
                <tbody className="text-cream-300">
                  {rows.map(([label, v]) => (
                    <tr key={label} className="border-b border-cream-100/6">
                      <td className="py-2.5 pr-3">{label}</td>
                      <td className="py-2.5 text-right tabular-nums">{inr(v)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold text-cream-50">
                    <td className="py-3 pr-3">You keep</td>
                    <td className="py-3 text-right tabular-nums">{inr(r.keep)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Dish table ---------------- */}
      <div className="card mt-8 p-6 md:p-8">
        <h2 className="font-display text-lg font-semibold text-cream-50">Try it on three dishes</h2>
        <p className="mt-1.5 text-sm text-cream-400">
          Edit the names and dine-in prices. Each dish uses the rates above and keeps its own dine-in price.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[30rem] text-sm">
            <thead>
              <tr className="border-b border-cream-100/10 text-left text-xs uppercase tracking-[0.12em] text-cream-500">
                <th className="py-2.5 pr-3 font-semibold">Dish</th>
                <th className="py-2.5 pr-3 font-semibold">Dine-in price</th>
                <th className="py-2.5 pr-3 text-right font-semibold text-gold-300">App price</th>
                <th className="py-2.5 text-right font-semibold">Markup</th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((d, i) => {
                const price = num(d.price);
                const P = appPrice(price, rates);
                return (
                  <tr key={i} className="border-b border-cream-100/6">
                    <td className="py-2 pr-3">
                      <label htmlFor={`dish-${i}-name`} className="sr-only">
                        Dish {i + 1} name
                      </label>
                      <input
                        id={`dish-${i}-name`}
                        type="text"
                        value={d.name}
                        onChange={(e) => setDish(i, { name: e.target.value })}
                        className={cn(FIELD, "py-2.5")}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <label htmlFor={`dish-${i}-price`} className="sr-only">
                        Dish {i + 1} dine-in price
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-cream-500">
                          ₹
                        </span>
                        <input
                          id={`dish-${i}-price`}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          value={d.price}
                          onChange={(e) => setDish(i, { price: e.target.value })}
                          className={cn(FIELD, "py-2.5 pl-8 tabular-nums")}
                        />
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold tabular-nums text-gold-300">
                      {P === null || price <= 0 ? "—" : inr(roundUp5(P))}
                    </td>
                    <td className="py-2 text-right tabular-nums text-cream-300">
                      {P === null || price <= 0 ? "—" : `+${((P / price - 1) * 100).toFixed(0)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-cream-500">
        Illustrative only. App price = (amount you keep + packaging) ÷ ((1 − discount %) × (1 − (commission % + gateway
        %) × 1.18)). Assumes commission and gateway fees are charged on the price after a discount you fund, with 18%
        GST on both. Prices are before the 5% GST on food, which the platform collects. The rates shown are examples,
        not Swiggy&apos;s or Zomato&apos;s published rates: yours are set by your agreement with each platform, and some
        agreements also limit how far app prices can differ from your dine-in menu.
      </p>
    </div>
  );
}
