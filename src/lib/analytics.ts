/**
 * Tracking helpers: Meta Pixel, Google Ads and Google Analytics 4.
 *
 * All IDs are public (they ship in every page anyway), so they fall back to
 * the PFC accounts when no env override is set.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "812104141846081";
export const GOOGLE_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID ?? "AW-11159348982";
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "G-FJ1W2HRJFD";

// Events Meta recognises as standard; anything else goes out as a custom event.
const META_STANDARD = new Set(["PageView", "Contact", "Lead"]);

type Fn = (...args: unknown[]) => void;

// Meta standard event -> Google recommended event.
const GOOGLE_EVENTS: Record<string, string> = {
  PageView: "page_view",
  Contact: "contact",
  Lead: "generate_lead",
};

/** Fire an event on every platform. A no-op until each script has loaded. */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: Fn; gtag?: Fn };
  w.fbq?.(META_STANDARD.has(event) ? "track" : "trackCustom", event, params);

  // GA4's enhanced measurement already counts client-side navigations from
  // history changes, so a manual page_view goes to Google Ads only — sending
  // it to GA4 as well would count every in-app page change twice.
  const google = event === "PageView" ? { ...params, send_to: GOOGLE_TAG_ID } : params;
  w.gtag?.("event", GOOGLE_EVENTS[event] ?? event, google);
}
