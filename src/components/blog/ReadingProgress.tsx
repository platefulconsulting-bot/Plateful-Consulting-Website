"use client";

import { useEffect, useRef } from "react";

/**
 * Thin progress bar pinned under the header.
 *
 * Writes the scale directly to the element inside a rAF — no state, no
 * re-render per scroll event. Measures against the article element rather than
 * the document so the bar hits 100% at the end of the text, not after the
 * footer.
 */
export function ReadingProgress({ targetId = "article-body" }: { targetId?: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const article = document.getElementById(targetId);
    if (!article || !bar.current) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const el = bar.current;
      if (!el) return;

      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      // Very short articles have nothing to track.
      const progress = total <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / total));

      el.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-[4.25rem] z-40 h-0.5 bg-cream-100/6"
    >
      <div
        ref={bar}
        className="h-full origin-left scale-x-0 bg-gradient-to-r from-gold-400 to-ember-500"
      />
    </div>
  );
}
