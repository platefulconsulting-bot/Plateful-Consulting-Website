"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

/**
 * Swiggy & Zomato commission calculator (simple monthly version).
 *
 * Same layout as PFC's sales calculator: per platform, monthly sales, then
 * the current rate vs a target rate after negotiation.
 * Total commission = sales × (commission % + payment gateway %) × (1 + 18% GST).
 * Defaults are examples only; the target column is not a promised rate.
 */

const GST = 0.18;
const FIELD =
  "w-full rounded-xl border border-cream-100/12 bg-ink-800/70 px-3 py-2.5 text-sm text-cream-100 transition-colors focus:border-gold-400/60 focus:outline-none focus:ring-2 focus:ring-gold-400/20";
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

type Rates = { commission: string; gateway: string };
type Platform = { sales: string; current: Rates; target: Rates };

function cost(sales: number, r: Rates) {
  const total = sales * ((num(r.commission) + num(r.gateway)) / 100) * (1 + GST);
  return { total, pct: sales > 0 ? (total / sales) * 100 : 0 };
}

function PctInput({ id, value, onChange, label }: { id: string; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        max={100}
        step="0.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(FIELD, "pr-8 text-right tabular-nums")}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cream-500">%</span>
    </div>
  );
}

function PlatformCard({ id, name, p, set }: { id: string; name: string; p: Platform; set: (p: Platform) => void }) {
  const sales = num(p.sales);
  const cur = cost(sales, p.current);
  const tgt = cost(sales, p.target);
  const saved = cur.total - tgt.total;

  const row = (label: string, key: keyof Rates) => (
    <tr className="border-b border-cream-100/6">
      <td className="py-2.5 pr-3 text-cream-300">{label}</td>
      <td className="py-2 pr-2">
        <PctInput
          id={`${id}-cur-${key}`}
          label={`${name} current ${label}`}
          value={p.current[key]}
          onChange={(v) => set({ ...p, current: { ...p.current, [key]: v } })}
        />
      </td>
      <td className="py-2">
        <PctInput
          id={`${id}-tgt-${key}`}
          label={`${name} target ${label}`}
          value={p.target[key]}
          onChange={(v) => set({ ...p, target: { ...p.target, [key]: v } })}
        />
      </td>
    </tr>
  );

  return (
    <div className="card card-sheen p-6 md:p-7">
      <p className="font-display text-xl font-bold text-cream-50">{name}</p>

      <label htmlFor={`${id}-sales`} className={cn(LABEL, "mt-5")}>
        Monthly sales on {name}
      </label>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-gold-300">₹</span>
        <input
          id={`${id}-sales`}
          type="number"
          inputMode="decimal"
          min={0}
          value={p.sales}
          onChange={(e) => set({ ...p, sales: e.target.value })}
          className="w-full rounded-xl border-2 border-gold-400/60 bg-gold-500/10 py-3 pl-9 pr-4 text-lg font-semibold tabular-nums text-cream-50 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
        />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[19rem] text-sm">
          <thead>
            <tr className="border-b border-cream-100/10 text-left text-xs uppercase tracking-[0.12em] text-cream-500">
              <th className="py-2 pr-3 font-semibold"> </th>
              <th className="py-2 pr-2 text-right font-semibold">Current</th>
              <th className="py-2 text-right font-semibold text-gold-300">Target</th>
            </tr>
          </thead>
          <tbody>
            {row("Commission", "commission")}
            {row("Payment gateway", "gateway")}
            <tr className="border-b border-cream-100/6">
              <td className="py-2.5 pr-3 text-cream-300">GST on both</td>
              <td className="py-2.5 pr-2 text-right tabular-nums text-cream-400">18%</td>
              <td className="py-2.5 text-right tabular-nums text-cream-400">18%</td>
            </tr>
            <tr className="border-b border-cream-100/6 font-semibold text-cream-50">
              <td className="py-3 pr-3">Total commission / month</td>
              <td className="py-3 pr-2 text-right tabular-nums">{inr(cur.total)}</td>
              <td className="py-3 text-right tabular-nums text-gold-300">{inr(tgt.total)}</td>
            </tr>
            <tr className="text-cream-300">
              <td className="py-2.5 pr-3">Total % of sales</td>
              <td className="py-2.5 pr-2 text-right tabular-nums">{sales > 0 ? `${cur.pct.toFixed(1)}%` : "—"}</td>
              <td className="py-2.5 text-right tabular-nums text-gold-300">{sales > 0 ? `${tgt.pct.toFixed(1)}%` : "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-500/8 px-5 py-4">
        <p className={LABEL}>₹ saved on {name}</p>
        <p className={cn("mt-1.5 font-display text-2xl font-bold tabular-nums", saved >= 0 ? "text-emerald-400" : "text-red-400")}>
          {inr(saved)}
          <span className="ml-1.5 text-sm font-semibold text-cream-400">/ month</span>
        </p>
        <p className="mt-0.5 text-xs text-cream-400">{inr(saved * 12)} a year</p>
      </div>
    </div>
  );
}

export function CommissionCalculator() {
  const [swiggy, setSwiggy] = useState<Platform>({
    sales: "1000000",
    current: { commission: "24", gateway: "2" },
    target: { commission: "15", gateway: "2" },
  });
  const [zomato, setZomato] = useState<Platform>({
    sales: "1000000",
    current: { commission: "27", gateway: "2" },
    target: { commission: "18", gateway: "2" },
  });

  const totalSaved = useMemo(() => {
    const s = cost(num(swiggy.sales), swiggy.current).total - cost(num(swiggy.sales), swiggy.target).total;
    const z = cost(num(zomato.sales), zomato.current).total - cost(num(zomato.sales), zomato.target).total;
    return s + z;
  }, [swiggy, zomato]);

  const inputs = JSON.stringify([swiggy, zomato]);
  const initial = useRef(inputs);
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current || inputs === initial.current) return;
    tracked.current = true;
    track("calculator_use", { tool: "commission_calculator" });
  }, [inputs]);

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PlatformCard id="sw" name="Swiggy" p={swiggy} set={setSwiggy} />
        <PlatformCard id="zo" name="Zomato" p={zomato} set={setZomato} />
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-gold-400/30 bg-gold-500/10 p-6 sm:flex-row sm:items-center" aria-live="polite">
        <div>
          <p className={LABEL}>Total saved on both apps</p>
          <p className="mt-1.5 font-display text-[length:var(--text-display-md)] font-bold leading-none tabular-nums text-gold-300">
            {inr(totalSaved)}
            <span className="ml-2 text-base font-semibold text-cream-400">/ month</span>
          </p>
        </div>
        <p className="font-display text-xl font-semibold tabular-nums text-cream-100">{inr(totalSaved * 12)} a year</p>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-cream-500">
        Total commission = monthly sales × (commission % + payment gateway %) + 18% GST. Type your own numbers in any
        box. The current and target figures shown are examples, not Swiggy&apos;s or Zomato&apos;s published rates and
        not a promised rate: your commission is set in your agreement with each platform. Discounts and ads are not
        included.
      </p>
    </div>
  );
}
