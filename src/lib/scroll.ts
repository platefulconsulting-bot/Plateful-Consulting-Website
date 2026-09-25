/**
 * Scroll state.
 *
 * A module-level singleton rather than React state, deliberately. The WebGL
 * stage reads this on every animation frame; routing it through React would
 * re-render the tree sixty times a second to move a few meshes.
 *
 * Two performance rules this module exists to enforce:
 *
 *  1. No layout reads on the scroll path. Section positions are measured once,
 *     then again only when the page actually reflows (resize, fonts, images),
 *     and every scroll frame is pure arithmetic on those cached numbers.
 *     Calling getBoundingClientRect per section per frame forces a synchronous
 *     layout whenever anything else on the page has touched a style — which,
 *     with reveal animations running, is most frames.
 *
 *  2. Choreography follows content. Sections register their real DOM nodes and
 *     the chapter they belong to, so editing copy or reordering blocks shifts
 *     the 3D with it instead of breaking hard-coded offsets.
 */

/** The set pieces the stage can show. See components/three/world/ChapterWorld. */
export type Chapter = "chart" | "engines" | "menu" | "bars" | "orbit";

export type ScrollState = {
  y: number;
  /** Whole-document progress, 0–1. */
  progress: number;
  /** Pixels per frame, lightly smoothed. */
  velocity: number;
  viewportHeight: number;
};

export const scrollState: ScrollState = { y: 0, progress: 0, velocity: 0, viewportHeight: 0 };

type Entry = { el: HTMLElement; chapter?: Chapter; top: number; height: number };

const entries = new Map<string, Entry>();
const progressById = new Map<string, number>();
const coverageByChapter = new Map<Chapter, number>();
const progressByChapter = new Map<Chapter, number>();
const listeners = new Set<() => void>();

let docHeight = 0;
let lastY = 0;

export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Smoothstep — eases both ends, so nothing starts or stops abruptly. */
export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

/** Frame-rate independent exponential approach toward a target. */
export function damp(current: number, target: number, lambda: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}

/* ------------------------------------------------------------------------- */
/* Measurement — the only place layout is read                               */
/* ------------------------------------------------------------------------- */

function measure() {
  const y = window.scrollY;
  for (const entry of entries.values()) {
    const rect = entry.el.getBoundingClientRect();
    entry.top = rect.top + y;
    entry.height = rect.height;
  }
  docHeight = document.documentElement.scrollHeight;
}

let queued = false;
function queueMeasure() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    measure();
    updateScroll(window.scrollY);
  });
}

let observing = false;
function observeLayout() {
  if (observing) return;
  observing = true;
  window.addEventListener("resize", queueMeasure, { passive: true });
  // Content height changes as images decode and sections expand.
  if ("ResizeObserver" in window) new ResizeObserver(queueMeasure).observe(document.body);
  // Web fonts reflow the page after first paint.
  document.fonts?.ready.then(queueMeasure).catch(() => {});
}

/**
 * Registers a DOM section with the stage. `chapter` names the set piece that
 * should be on screen while this section is. Returns an unsubscribe.
 */
export function registerSection(id: string, el: HTMLElement, chapter?: Chapter) {
  entries.set(id, { el, chapter, top: 0, height: 0 });
  observeLayout();
  queueMeasure();
  return () => {
    entries.delete(id);
    progressById.delete(id);
    queueMeasure();
  };
}

/* ------------------------------------------------------------------------- */
/* Per-frame update — arithmetic only                                        */
/* ------------------------------------------------------------------------- */

/** Called by the smooth-scroll driver on every scroll frame. */
export function updateScroll(y: number) {
  const vh = window.innerHeight;
  scrollState.viewportHeight = vh;
  scrollState.y = y;
  scrollState.progress = docHeight > vh ? clamp01(y / (docHeight - vh)) : 0;

  scrollState.velocity += (y - lastY - scrollState.velocity) * 0.2;
  lastY = y;

  coverageByChapter.clear();
  const spans = new Map<Chapter, [number, number]>();

  for (const [id, e] of entries) {
    progressById.set(id, clamp01((vh - (e.top - y)) / (e.height + vh)));
    if (!e.chapter) continue;

    // How much of the viewport this section is currently filling.
    const overlap = Math.max(0, Math.min(e.top + e.height, y + vh) - Math.max(e.top, y));
    coverageByChapter.set(e.chapter, (coverageByChapter.get(e.chapter) ?? 0) + overlap / vh);

    const span = spans.get(e.chapter);
    spans.set(
      e.chapter,
      span
        ? [Math.min(span[0], e.top), Math.max(span[1], e.top + e.height)]
        : [e.top, e.top + e.height],
    );
  }

  progressByChapter.clear();
  for (const [chapter, [start, end]] of spans) {
    progressByChapter.set(chapter, clamp01((y + vh / 2 - start) / Math.max(1, end - start)));
  }

  for (const fn of listeners) fn();
}

/* ------------------------------------------------------------------------- */
/* Readers                                                                   */
/* ------------------------------------------------------------------------- */

/**
 * 0–1 presence of a chapter, from the share of the screen its sections fill.
 *
 * The 35–65% window is what makes neighbouring chapters crossfade instead of
 * stacking: at a 50/50 seam both sit at half strength, and whichever section
 * takes over the screen takes over the stage.
 */
export function chapterVisibility(chapter: Chapter) {
  return smoothstep(0.35, 0.65, coverageByChapter.get(chapter) ?? 0);
}

/** 0–1 as the viewport centre travels from the chapter's first section to its last. */
export function chapterProgress(chapter: Chapter) {
  return progressByChapter.get(chapter) ?? 0;
}

/** 0 when a section's top reaches the viewport bottom, 1 when its bottom leaves the top. */
export function sectionProgress(id: string) {
  return progressById.get(id) ?? 0;
}

/**
 * For a pinned (sticky) section: 0 when its top reaches the viewport top, 1
 * when its bottom reaches the viewport bottom — i.e. across the scroll distance
 * during which its sticky child holds still.
 */
export function pinProgress(id: string) {
  const e = entries.get(id);
  if (!e) return 0;
  return clamp01((scrollState.y - e.top) / Math.max(1, e.height - scrollState.viewportHeight));
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
