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
   * Reveal on mount instead of on scroll-in. For above-the-fold content — a
   * hero headline and its call to action should not wait on an observer.
   */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (immediate) {
      // Next frame, so the hidden state paints first and the transition runs.
      const id = requestAnimationFrame(() => el.setAttribute("data-shown", ""));
      return () => cancelAnimationFrame(id);
    }

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
      style: delay ? { transitionDelay: `${delay}s` } : undefined,
      className: cn(className),
    },
    children,
  );
}
