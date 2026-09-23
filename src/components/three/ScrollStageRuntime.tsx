"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import ChapterWorld from "./world/ChapterWorld";
import { Prewarm } from "./Prewarm";

/**
 * The scroll stage.
 *
 * A single fixed canvas behind the page rather than one per section — which is
 * what lets one set piece crossfade into the next as the content changes.
 *
 * Budget, because this canvas covers the whole viewport on every frame:
 *  - pixel ratio is capped at 1.35. The scene sits behind a scrim and is soft
 *    by design; rendering it at a phone's native 3× would triple the fill cost
 *    for detail nobody can see;
 *  - a quality tier from device memory, core count and screen size trims
 *    particles and pixel ratio further on weaker hardware;
 *  - rendering stops entirely while the tab is hidden;
 *  - `prefers-reduced-motion` renders one frame and freezes;
 *  - no WebGL means no canvas, and the CSS ground behind it stays.
 */
export default function ScrollStageRuntime() {
  const [supported, setSupported] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [quality, setQuality] = useState(1);

  useEffect(() => {
    try {
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl2") ?? probe.getContext("webgl"))) setSupported(false);
    } catch {
      setSupported(false);
    }

    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;
    let tier = 1;
    if (window.innerWidth < 768) tier = 0.6;
    if (memory <= 4 || cores <= 4) tier = Math.min(tier, 0.6);
    if (memory <= 2 || cores <= 2) tier = 0.4;
    setQuality(tier);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (!supported) return null;

  return (
    <Canvas
      // The camera never moves: set pieces are composed in front of it.
      camera={{ position: [0, 0, 10], fov: 40, near: 0.1, far: 60 }}
      frameloop={reduced ? "demand" : hidden ? "never" : "always"}
      dpr={[1, quality >= 1 ? 1.35 : 1.1]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          setSupported(false);
        });
      }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <ChapterWorld quality={quality} />
        <Prewarm />
      </Suspense>
    </Canvas>
  );
}
