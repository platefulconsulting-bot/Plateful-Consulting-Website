"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type Heading = { id: string; text: string; level: number };

/**
 * Table of contents with scroll spy.
 *
 * These articles run to thirty or more headings, so the contents list is doing
 * real navigational work rather than decoration. The active item is chosen by
 * tracking which heading was most recently scrolled past, which behaves far
 * better than IntersectionObserver ratios on headings of wildly varying
 * section lengths.
 */
export function ArticleToc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    if (!headings.length) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      // Anything above this line counts as "read".
      const line = window.scrollY + 140;

      let current = elements[0];
      for (const el of elements) {
        if (el.offsetTop <= line) current = el;
        else break;
      }
      setActive(current.id);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav aria-labelledby="toc-heading" className="text-sm">
      <h2
        id="toc-heading"
        className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-gold-400"
      >
        On this page
      </h2>

      <ul className="mt-4 max-h-[60vh] space-y-0.5 overflow-y-auto pr-2 [scrollbar-width:thin]">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={cn(
                "block border-l-2 py-1.5 leading-snug transition-colors duration-200",
                h.level === 3 ? "pl-6 text-[0.8rem]" : "pl-3.5",
                active === h.id
                  ? "border-gold-400 text-gold-300"
                  : "border-cream-100/10 text-cream-500 hover:border-cream-100/30 hover:text-cream-200",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
