"use client";

import dynamic from "next/dynamic";

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

export function ScrollStage() {
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
        <ScrollStageRuntime />

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
