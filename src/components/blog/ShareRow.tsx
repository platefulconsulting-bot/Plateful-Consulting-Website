"use client";

import { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";

/**
 * Share controls.
 *
 * Uses the native share sheet where the browser offers one (most phones, which
 * is where sharing actually happens) and falls back to copy-to-clipboard plus
 * direct WhatsApp and LinkedIn intents — the two channels restaurant owners
 * actually forward links on.
 */
export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context or denied permission) — the link is
      // in the address bar anyway, so there is nothing useful to say here.
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User dismissed the sheet.
        return;
      }
    }
    copy();
  }

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-500">
        Share
      </span>

      <button
        type="button"
        onClick={nativeShare}
        className="inline-flex items-center gap-2 rounded-full border border-cream-100/12 px-3.5 py-2 text-sm text-cream-300 transition-colors hover:border-gold-400/50 hover:text-gold-300"
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        Share
      </button>

      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-cream-100/12 px-3.5 py-2 text-sm text-cream-300 transition-colors hover:border-gold-400/50 hover:text-gold-300"
      >
        WhatsApp
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-cream-100/12 px-3.5 py-2 text-sm text-cream-300 transition-colors hover:border-gold-400/50 hover:text-gold-300"
      >
        LinkedIn
      </a>

      <button
        type="button"
        onClick={copy}
        aria-live="polite"
        className="inline-flex items-center gap-2 rounded-full border border-cream-100/12 px-3.5 py-2 text-sm text-cream-300 transition-colors hover:border-gold-400/50 hover:text-gold-300"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-basil-400" aria-hidden />
            Copied
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" aria-hidden />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
