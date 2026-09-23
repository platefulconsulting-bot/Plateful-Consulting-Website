"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { updateScroll } from "@/lib/scroll";

/**
 * Smooth scrolling.
 *
 * Lenis interpolates the scroll position so the page glides. It runs in `lerp`
 * mode rather than fixed-duration mode: each frame closes a fixed share of the
 * remaining distance, so the page tracks the wheel closely and settles quickly,
 * instead of playing out a one-second ease after every notch — which is what
 * reads as "lag" once a 3D scene is also following the scroll.
 *
 * This is the ONLY smoothing between the wheel and the stage. The scene reads
 * the Lenis position directly; stacking a second ease on top in the renderer
 * is what made the previous version trail the content.
 *
 *  - `prefers-reduced-motion` disables it and falls back to native scrolling,
 *    still feeding the same store.
 *  - Touch devices keep native momentum scrolling.
 *  - Anchor links and keyboard paging still work: Lenis drives the real
 *    window scroll position rather than transforming a container.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    if (reduced || coarse) {
      const onScroll = () => updateScroll(window.scrollY);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      lerp: 0.14,
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false,
    });

    lenis.on("scroll", ({ scroll }: { scroll: number }) => updateScroll(scroll));

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    updateScroll(window.scrollY);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
