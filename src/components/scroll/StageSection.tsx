"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerSection, type Chapter } from "@/lib/scroll";

/**
 * A page section the 3D stage follows.
 *
 * `chapter` names the set piece that should be on screen while this section
 * fills the viewport. Consecutive sections can share a chapter, so a set piece
 * holds across a run of related content and only changes when the story does.
 *
 * Registering the real DOM node (rather than hard-coding scroll offsets) keeps
 * the choreography correct when copy is edited or blocks are reordered.
 */
export function StageSection({
  id,
  chapter,
  className,
  children,
  ariaLabelledby,
  ariaLabel,
  as: Tag = "section",
}: {
  /** Unique within the page. */
  id: string;
  chapter?: Chapter;
  className?: string;
  children: ReactNode;
  ariaLabelledby?: string;
  ariaLabel?: string;
  /** Use "div" when the children already render their own <section>. */
  as?: "section" | "div";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerSection(id, el, chapter);
  }, [id, chapter]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLElement>}
      data-stage={id}
      data-chapter={chapter}
      className={className}
      aria-labelledby={ariaLabelledby}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}
