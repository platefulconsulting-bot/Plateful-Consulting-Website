"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { SceneCanvas } from "./SceneCanvas";

/**
 * The WebGL runtime boundary.
 *
 * Everything that pulls in three.js — the canvas wrapper and the scenes — is
 * reachable only from this module, and `LazyScene` reaches it through a
 * dynamic import. That keeps react-three-fiber and three out of every page's
 * first-load bundle; they arrive in their own chunk once a scene is actually
 * mounted.
 */

const SCENES = {
  "reach-network": dynamic(() => import("./scenes/ReachNetwork"), { ssr: false }),
  "signal-orb": dynamic(() => import("./scenes/SignalOrb"), { ssr: false }),
} as const;

export type SceneName = keyof typeof SCENES;

const CAMERAS: Record<SceneName, { position: [number, number, number]; fov: number }> = {
  "reach-network": { position: [0, 0, 9], fov: 45 },
  "signal-orb": { position: [0, 1.2, 8.5], fov: 45 },
};

export default function SceneRuntime({
  name,
  maxDpr,
  fallback,
}: {
  name: SceneName;
  maxDpr?: number;
  fallback?: ReactNode;
}) {
  const Scene = SCENES[name];

  return (
    <SceneCanvas className="h-full w-full" camera={CAMERAS[name]} maxDpr={maxDpr} fallback={fallback}>
      <Scene />
    </SceneCanvas>
  );
}
