"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type State = "idle" | "loading" | "done" | "error";

export function NewsletterForm({ className, source = "footer" }: { className?: string; source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;

    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setState("done");
      setMessage(data.message ?? "You're on the list.");
      setEmail("");
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <p className={cn("flex items-center gap-2 text-sm text-basil-400", className)}>
        <Check className="h-4 w-4 shrink-0" aria-hidden />
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 rounded-full border border-cream-100/12 bg-ink-800/70 p-1.5 pl-4 transition-colors focus-within:border-gold-400/60">
        <label htmlFor={`nl-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder="you@restaurant.com"
          autoComplete="email"
          className="min-w-0 flex-1 bg-transparent text-sm text-cream-100 placeholder:text-cream-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-ink-900 transition-transform hover:scale-105 disabled:opacity-60"
          aria-label="Subscribe"
        >
          {state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>

      {state === "error" && (
        <p role="alert" className="text-xs text-ember-400">
          {message}
        </p>
      )}
    </form>
  );
}
