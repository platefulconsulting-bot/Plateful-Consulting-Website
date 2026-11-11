"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Mounts the scroll stage.
 *
 * The WebGL runtime sits behind a dynamic import so three.js never lands in the
 * page's first-load JavaScript — the hero paints from HTML and CSS, and the
 * world fades in behind it a moment later.
 *
 * The stage is `fixed` and `aria-hidden`: it is scenery. Every word on the page
 * lives in normal DOM above it, so the content is fully readable, selectable
 * and crawlable with the canvas removed.
 */

const ScrollStageRuntime = dynamic(() => import("./ScrollStageRuntime"), {
  ssr: false,
  loading: () => null,
});

/**
 * When to start the WebGL world.
 *
 * Fetching three.js, compiling shaders and filling a full-viewport canvas costs
 * seconds of main-thread time on a mid-range phone, and doing it during the
 * initial load is what pushed mobile LCP to ~8 s and TBT to ~1.6 s. The CSS
 * ground and bloom already look finished, so the world can wait:
 *  - phones (viewport under 768px, or a touch screen under 500px tall): never.
 *    The CSS backdrop is the whole stage — three.js is not even downloaded;
 *  - tablets: on the first scroll, touch or key press;
 *  - desktop: once the browser is idle after load (capped at 2.5 s).
 */
function isPhone() {
  const narrow = window.matchMedia("(max-width: 767px)").matches;
  // A phone turned sideways is wider than 767px but still a phone.
  const landscapePhone = window.matchMedia("(pointer: coarse) and (max-height: 500px)").matches;
  return narrow || landscapePhone;
}

function useDeferredStage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      setReady(true);
    };

    if (isPhone()) return;

    if (window.innerWidth >= 1024) {
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      const onLoad = () => {
        if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 2500 });
        else window.setTimeout(start, 1200);
      };
      if (document.readyState === "complete") onLoad();
      else window.addEventListener("load", onLoad, { once: true });
      return () => window.removeEventListener("load", onLoad);
    }

    const events = ["scroll", "touchstart", "pointerdown", "keydown", "wheel"] as const;
    events.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, start));
  }, []);

  return ready;
}

export function ScrollStage() {
  const ready = useDeferredStage();
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        // Painted before the content, which sits at z-10 and above.
        style={{ contain: "strict" }}
      >
        {/* CSS ground and bloom: visible instantly, and the permanent backdrop
            on devices without WebGL. `bg-ink-900` flips with the theme. */}
        <div className="absolute inset-0 bg-ink-900" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 15%, rgba(252,128,25,0.10), transparent 55%), radial-gradient(ellipse at 85% 70%, rgba(226,55,68,0.09), transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(224,168,46,0.10), transparent 60%)",
          }}
        />
        {ready && <ScrollStageRuntime />}

        {/* Readability scrim.
            A full-page 3D backdrop only works if it stays a backdrop. This sits
            between the world and the copy and takes roughly half the contrast
            out of it — the scene still reads as depth and movement, but no
            glowing edge ever competes with a headline.

            The gradient itself is a theme variable: on paper it has to lighten
            the scene, not darken it. */}
        <div className="absolute inset-0" style={{ background: "var(--stage-scrim)" }} />
      </div>
    </>
  );
}
