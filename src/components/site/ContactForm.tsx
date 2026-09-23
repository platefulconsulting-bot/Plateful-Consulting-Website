"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { services, cities } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Enquiry form.
 *
 * Deliberately asks for restaurant, city and service alongside the basics: the
 * first reply is far more useful when we already know whether we are talking to
 * a single cloud kitchen in Pune or a twelve-outlet chain. Only name, email and
 * message are required, so the extra fields never cost a submission.
 */

const FIELD =
  "w-full rounded-xl border border-cream-100/12 bg-ink-800/70 px-4 py-3 text-sm text-cream-100 placeholder:text-cream-500 transition-colors focus:border-gold-400/60 focus:outline-none focus:ring-2 focus:ring-gold-400/20";
const LABEL = "block text-xs font-semibold uppercase tracking-[0.14em] text-cream-400";

export function ContactForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;

    setState("loading");
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setError(data.error ?? "Something went wrong. Please try again or call us.");
        return;
      }

      router.push("/thank-you");
    } catch {
      setState("error");
      setError("Network error. Please try again, or call us directly.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* Honeypot: bots fill hidden fields, humans never see this. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company-website">Do not fill this in</label>
        <input id="company-website" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={LABEL}>
            Your name <span className="text-ember-400">*</span>
          </label>
          <input id="name" name="name" required autoComplete="name" className={cn(FIELD, "mt-2")} placeholder="Rohan Mehta" />
        </div>

        <div>
          <label htmlFor="phone" className={LABEL}>
            Mobile number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={cn(FIELD, "mt-2")}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={LABEL}>
          Email <span className="text-ember-400">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={cn(FIELD, "mt-2")}
          placeholder="you@restaurant.com"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="restaurant" className={LABEL}>
            Restaurant / brand
          </label>
          <input id="restaurant" name="restaurant" className={cn(FIELD, "mt-2")} placeholder="Ivoryy Kitchen" />
        </div>

        <div>
          <label htmlFor="city" className={LABEL}>
            City
          </label>
          <input
            id="city"
            name="city"
            list="pfc-cities"
            className={cn(FIELD, "mt-2")}
            placeholder="Delhi NCR"
          />
          <datalist id="pfc-cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label htmlFor="service" className={LABEL}>
          What do you need help with?
        </label>
        <select
          id="service"
          name="service"
          defaultValue={params.get("service") ?? ""}
          className={cn(FIELD, "mt-2 appearance-none bg-[length:0]")}
        >
          <option value="">Not sure yet — start with the audit</option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={LABEL}>
          Where are you stuck? <span className="text-ember-400">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={cn(FIELD, "mt-2 resize-y")}
          placeholder="Roughly how many orders a month, what you have already tried, and what is not moving."
        />
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
            Sending…
          </>
        ) : (
          <>
            Request my growth audit
            <ArrowRight className="h-4 w-4" aria-hidden />
          </>
        )}
      </button>

      <p className="text-xs leading-relaxed text-cream-500">
        We reply within one business day. Your details are used only to respond to this
        enquiry — never sold or shared.
      </p>
    </form>
  );
}
