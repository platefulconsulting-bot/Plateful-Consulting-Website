"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/app/studio/actions";

const FIELD =
  "w-full rounded-xl border border-cream-100/12 bg-ink-800/70 px-4 py-3 text-sm text-cream-100 placeholder:text-cream-500 transition-colors focus:border-gold-400/60 focus:outline-none focus:ring-2 focus:ring-gold-400/20";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-gold w-full disabled:opacity-70">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Signing in…
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" aria-hidden />
          Sign in
        </>
      )}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.14em] text-cream-400">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          className={`${FIELD} mt-2`}
          placeholder="info@platefulconsulting.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-[0.14em] text-cream-400">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={`${FIELD} mt-2`}
          placeholder="••••••••••"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-ember-500/30 bg-ember-500/10 p-3 text-sm text-ember-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
