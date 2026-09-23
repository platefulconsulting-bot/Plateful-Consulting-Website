"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pointer-tracked 3D tilt with a specular highlight that follows the cursor.
 *
 * Updates are written straight to CSS custom properties inside a rAF, so the
 * effect never triggers a React render. Pointer-coarse devices are skipped
 * entirely — a tilt you cannot aim is just jitter.
 */

export function TiltCard({
  children,
  className,
  intensity = 8,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees. */
  intensity?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${(0.5 - py) * intensity}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * intensity}deg`);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    });
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={
        {
          transform:
            "perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(0)",
          transformStyle: "preserve-3d",
          transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        } as React.CSSProperties
      }
      className={cn("relative", className)}
    >
      {children}

      {glare && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 [background:radial-gradient(320px_circle_at_var(--mx,50%)_var(--my,50%),rgba(247,208,69,0.14),transparent_60%)] group-hover:opacity-100"
        />
      )}
    </div>
  );
}
