/**
 * Ad-platform tracking helpers (Meta Pixel + Google tag).
 *
 * Both IDs are public (they ship in every page anyway), so they fall back to
 * the PFC accounts when no env override is set.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "812104141846081";
export const GOOGLE_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID ?? "AW-11159348982";

type Fn = (...args: unknown[]) => void;

// Meta standard event -> Google recommended event.
const GOOGLE_EVENTS: Record<string, string> = {
  PageView: "page_view",
  Contact: "contact",
  Lead: "generate_lead",
};

/** Fire an event on both platforms. A no-op until each script has loaded. */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: Fn; gtag?: Fn };
  w.fbq?.("track", event, params);
  w.gtag?.("event", GOOGLE_EVENTS[event] ?? event, params);
}
