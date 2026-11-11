"use client";

import { useState } from "react";
import { ArrowRight, Loader2, AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";
import { cities, contact } from "@/lib/site";
import { cn } from "@/lib/utils";
import { track, adsConversion, toE164 } from "@/lib/analytics";
import { GMV_BANDS, OUTLET_BANDS } from "@/lib/commission-program";

/**
 * Commission Reduction Program application.
 *
 * Asks the three qualifying questions (monthly sales, outlets, current
 * commission) up front. Qualified leads (₹10L+/month or 2+ outlets) get a
 * pre-filled WhatsApp chat with the founder straight away; everyone else is
 * told the team will send a free Commission Leak Audit first.
 */

const FIELD =
  "w-full rounded-xl border border-cream-100/12 bg-ink-800/70 px-4 py-3 text-sm text-cream-100 placeholder:text-cream-500 transition-colors focus:border-gold-400/60 focus:outline-none focus:ring-2 focus:ring-gold-400/20";
const LABEL = "block text-xs font-semibold uppercase tracking-[0.14em] text-cream-400";

type Done = { qualified: boolean; waText: string };

export function CommissionLeadForm() {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setError("");

    const payload = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const phone = toE164(payload.phone ?? "");
    if (!phone) {
      setState("error");
      setError("Please enter a valid 10-digit mobile number so we can reach you.");
      return;
    }

    try {
      const res = await fetch("/api/commission-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setError(data.error ?? "Something went wrong. Please try again or WhatsApp us.");
        return;
      }

      track("Lead", { content_name: "commission_reduction", qualified: Boolean(data.qualified) });
      adsConversion("lead", { email: (payload.email ?? "").trim().toLowerCase() || undefined, phone_number: phone });

      const gmv = GMV_BANDS.find((b) => b.id === payload.gmv)?.label ?? "";
      const outlets = OUTLET_BANDS.find((b) => b.id === payload.outlets)?.label ?? "";
      const waText = [
        `Hi, I'm ${payload.name}${payload.restaurant ? ` from ${payload.restaurant}` : ""}, ${payload.city}.`,
        `Interested in the Commission Reduction Program.`,
        `Sales: ${gmv}. ${outlets}.${payload.commission ? ` Current commission: ${payload.commission}%.` : ""}`,
      ].join(" ");

      setDone({ qualified: Boolean(data.qualified), waText });
      setState("idle");
    } catch {
      setState("error");
      setError("Network error. Please try again, or WhatsApp us directly.");
    }
  }

  if (done) {
    const waHref = `${contact.whatsapp}?text=${encodeURIComponent(done.waText)}`;
    return (
      <div className="card p-6 md:p-8" role="status">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" aria-hidden />
        {done.qualified ? (
          <>
            <p className="mt-4 font-display text-xl font-semibold text-cream-50">You qualify for the program.</p>
            <p className="mt-2 leading-relaxed text-cream-300">
              Your details are with us. To skip the queue, message our founder on WhatsApp now. Your numbers are
              already filled in.
            </p>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg mt-6">
              <MessageCircle className="h-4 w-4" aria-hidden />
              Talk to DD on WhatsApp
            </a>
          </>
        ) : (
          <>
            <p className="mt-4 font-display text-xl font-semibold text-cream-50">
              Thanks. We&rsquo;ll start with your free Commission Leak Audit.
            </p>
            <p className="mt-2 leading-relaxed text-cream-300">
              At your current size, the fastest win is usually fixing ads, discounts and menu pricing before a rate
              negotiation. Our team will reach out within one business day with what your listing is leaking.
            </p>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-6">
              <MessageCircle className="h-4 w-4" aria-hidden />
              Or message us on WhatsApp
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 md:p-8" noValidate>
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="cl-company-website">Do not fill this in</label>
        <input id="cl-company-website" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cl-name" className={LABEL}>
            Your name <span className="text-ember-400">*</span>
          </label>
          <input id="cl-name" name="name" required autoComplete="name" className={cn(FIELD, "mt-2")} placeholder="Rohan Mehta" />
        </div>
        <div>
          <label htmlFor="cl-phone" className={LABEL}>
            Mobile (WhatsApp) <span className="text-ember-400">*</span>
          </label>
          <input
            id="cl-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            className={cn(FIELD, "mt-2")}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cl-restaurant" className={LABEL}>
            Restaurant / brand
          </label>
          <input id="cl-restaurant" name="restaurant" className={cn(FIELD, "mt-2")} placeholder="Your brand name" />
        </div>
        <div>
          <label htmlFor="cl-city" className={LABEL}>
            City <span className="text-ember-400">*</span>
          </label>
          <input id="cl-city" name="city" required list="cl-cities" className={cn(FIELD, "mt-2")} placeholder="Hyderabad" />
          <datalist id="cl-cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cl-gmv" className={LABEL}>
            Monthly sales on Swiggy + Zomato <span className="text-ember-400">*</span>
          </label>
          <select id="cl-gmv" name="gmv" required defaultValue="" className={cn(FIELD, "mt-2")}>
            <option value="" disabled>
              Select
            </option>
            {GMV_BANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cl-outlets" className={LABEL}>
            Number of outlets <span className="text-ember-400">*</span>
          </label>
          <select id="cl-outlets" name="outlets" required defaultValue="" className={cn(FIELD, "mt-2")}>
            <option value="" disabled>
              Select
            </option>
            {OUTLET_BANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cl-commission" className={LABEL}>
            Current commission %
          </label>
          <input
            id="cl-commission"
            name="commission"
            type="number"
            inputMode="decimal"
            min={0}
            max={50}
            className={cn(FIELD, "mt-2")}
            placeholder="e.g. 24"
          />
        </div>
        <div>
          <label htmlFor="cl-email" className={LABEL}>
            Email
          </label>
          <input id="cl-email" name="email" type="email" autoComplete="email" className={cn(FIELD, "mt-2")} placeholder="Optional" />
        </div>
      </div>

      {state === "error" && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-ember-500/30 bg-ember-500/10 p-3.5 text-sm text-ember-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <button type="submit" disabled={state === "loading"} className="btn btn-primary btn-lg w-full disabled:opacity-70">
        {state === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Checking…
          </>
        ) : (
          <>
            Check if I qualify
            <ArrowRight className="h-4 w-4" aria-hidden />
          </>
        )}
      </button>
      <p className="text-xs leading-relaxed text-cream-500">
        Takes 30 seconds. Your details are used only to respond to this enquiry, never sold or shared.
      </p>
    </form>
  );
}
