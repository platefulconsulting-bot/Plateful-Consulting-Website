"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Count-up statistic, triggered once when it scrolls into view.
 *
 * The number is written straight into the text node inside a rAF loop rather
 * than through React state. Four counters animating together would otherwise be
 * four React renders per frame for ~2 seconds — exactly while the user is
 * scrolling past them and the 3D stage needs the main thread.
 *
 * The final value is server-rendered, so crawlers and reduced-motion users read
 * "150+", never "0+".
 */
export function Counter({
  value,
  suffix = "",
  decimals = 0,
  duration = 1800,
  className,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    // Mutate React's own text node rather than replacing it, so a later
    // re-render still finds the node it created.
    const text = el?.firstChild;
    if (!el || !text || text.nodeType !== Node.TEXT_NODE) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const format = (n: number) => `${n.toFixed(decimals)}${suffix}`;
    let frame = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          text.nodeValue = format(value * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        text.nodeValue = format(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, suffix, decimals, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {`${value.toFixed(decimals)}${suffix}`}
    </span>
  );
}
