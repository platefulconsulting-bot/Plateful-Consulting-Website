"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared WebGL canvas wrapper.
 *
 * Three things every scene on this site needs, handled once:
 *
 *  1. It stops rendering when scrolled out of view. A page with four scenes
 *     would otherwise run four render loops against the GPU simultaneously —
 *     which is exactly how a 3D site ends up draining a phone battery.
 *  2. It honours `prefers-reduced-motion` by rendering a single frame and then
 *     freezing, so the composition is still there but nothing moves.
 *  3. It degrades to a supplied fallback when WebGL is unavailable or the
 *     context is lost, rather than leaving a blank rectangle.
 */

type Props = {
  children: ReactNode;
  className?: string;
  /** Rendered instead of the canvas when WebGL is unavailable. */
  fallback?: ReactNode;
  camera?: CanvasProps["camera"];
  /** Device-pixel-ratio ceiling. 1.6 is plenty for these soft-shaded scenes. */
  maxDpr?: number;
  /** Keep rendering even when offscreen. Only for very small scenes. */
  alwaysOn?: boolean;
};

export function SceneCanvas({
  children,
  className,
  fallback = null,
  camera = { position: [0, 0, 9], fov: 40 },
  maxDpr = 1.6,
  alwaysOn = false,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failed, setFailed] = useState(false);

  // --- WebGL capability check ---------------------------------------------
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl");
      if (!gl) setFailed(true);
    } catch {
      setFailed(true);
    }
  }, []);

  // --- Reduced motion ------------------------------------------------------
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // --- Pause when offscreen ------------------------------------------------
  useEffect(() => {
    if (alwaysOn) {
      setVisible(true);
      return;
    }
    const el = hostRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      // Start a little before it scrolls in so nothing pops.
      { rootMargin: "200px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [alwaysOn]);

  if (failed) {
    return (
      <div ref={hostRef} className={cn("relative", className)}>
        {fallback}
      </div>
    );
  }

  // "never" halts the loop entirely; "demand" renders once then waits, which is
  // what a reduced-motion user should get.
  const frameloop = reducedMotion ? "demand" : visible ? "always" : "never";

  return (
    <div ref={hostRef} className={cn("relative", className)}>
      <Canvas
        camera={camera}
        frameloop={frameloop}
        dpr={[1, maxDpr]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          // Nothing here needs to read pixels back; let the driver discard.
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setFailed(true);
          });
        }}
        style={{ pointerEvents: "none" }}
      >
        {children}
      </Canvas>
    </div>
  );
}
