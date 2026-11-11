"use client";

import { createElement, useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered reveal.
 *
 * Deliberately cheap, because the homepage has dozens of these and the 3D
 * stage shares the main thread with them:
 *
 *  - No React state. The observer flips a `data-shown` attribute directly, so
 *    revealing a row of cards costs zero renders. React never manages that
 *    attribute, so a parent re-render cannot reset it.
 *  - No `will-change`. Promoting every reveal to its own compositor layer, and
 *    leaving it there after the animation, means the browser composites dozens
 *    of extra layers on every scroll frame. The transition is short enough not
 *    to need it.
 *  - The hidden/shown styles live in globals.css (`[data-reveal]`), and the
 *    reduced-motion rule there collapses the whole effect.
 *  - Nothing is hidden unless JavaScript is running (`html[data-js]`, set by
 *    the inline bootstrap script), and `immediate` reveals are a CSS-only,
 *    transform-only entrance — so above-the-fold copy paints from the server
 *    HTML and is never held back by the JS bundle.
 */

type Direction = "up" | "down" | "left" | "right" | "none";

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  as: Tag = "div",
  once = true,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  /** Seconds. Use small increments to stagger a row of cards. */
  delay?: number;
  direction?: Direction;
  as?: ElementType;
  once?: boolean;
  /**
   * Animate in on first paint instead of on scroll-in. For above-the-fold
   * content — a hero headline and its call to action should not wait on an
   * observer, or on JavaScript at all. CSS-only and always visible.
   */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Immediate reveals are pure CSS (see globals.css) and visible from the
    // server HTML — nothing to do here, so the hero never waits on hydration.
    if (immediate) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-shown", "");
          if (once) observer.disconnect();
        } else if (!once) {
          el.removeAttribute("data-shown");
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate, once]);

  // createElement rather than <Tag>: a generic ElementType resolves its props
  // to `never` in JSX, so TypeScript rejects ref/style on it.
  return createElement(
    Tag,
    {
      ref,
      "data-reveal": direction,
      "data-immediate": immediate ? "" : undefined,
      style: delay
        ? immediate
          ? { animationDelay: `${delay}s` }
          : { transitionDelay: `${delay}s` }
        : undefined,
      className: cn(className),
    },
    children,
  );
}
