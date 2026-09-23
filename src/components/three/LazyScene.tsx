"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { SceneName } from "./SceneRuntime";

/**
 * Entry point for every 3D scene on the site.
 *
 * Server components render `<LazyScene name="…" />`. The actual WebGL runtime
 * lives behind this dynamic import, so three.js and react-three-fiber never
 * appear in a page's first-load JavaScript — they are fetched only when a scene
 * mounts. Until then (and permanently, on a device without WebGL) the CSS
 * poster below stands in.
 */

const SceneRuntime = dynamic(() => import("./SceneRuntime"), {
  ssr: false,
  loading: () => null,
});

export type { SceneName };

/** CSS stand-in: a soft radial bloom in the scene's dominant hue. */
function Poster({ name }: { name: SceneName }) {
  const tint: Record<SceneName, string> = {
    "reach-network": "rgba(180,122,23,0.20)",
    "signal-orb": "rgba(234,85,43,0.18)",
  };

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2 blur-3xl"
        style={{
          background: `radial-gradient(circle at center, ${tint[name]}, transparent 68%)`,
        }}
      />
    </div>
  );
}

export function LazyScene({
  name,
  className,
  maxDpr,
}: {
  name: SceneName;
  className?: string;
  maxDpr?: number;
}) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* Sits underneath the canvas: visible while the chunk loads, and the
          permanent visual if WebGL is unavailable. */}
      <Poster name={name} />
      <SceneRuntime name={name} maxDpr={maxDpr} fallback={<Poster name={name} />} />
    </div>
  );
}
