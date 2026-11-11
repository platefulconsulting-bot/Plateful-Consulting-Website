/**
 * Tracking helpers: Meta Pixel, Google Ads and Google Analytics 4.
 *
 * All IDs are public (they ship in every page anyway), so they fall back to
 * the PFC accounts when no env override is set.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "812104141846081";
export const GOOGLE_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID ?? "AW-11159348982";
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "G-FJ1W2HRJFD";

/**
 * Google Ads conversion labels (the part after the slash in "AW-123/AbC-dEf").
 * Each one comes from a conversion action created in the Google Ads UI. While
 * a label is empty that conversion simply isn't sent; GA4 still gets the event.
 */
export const ADS_LABELS = {
  lead: process.env.NEXT_PUBLIC_GADS_LEAD_LABEL ?? "",
  call: process.env.NEXT_PUBLIC_GADS_CALL_LABEL ?? "",
  whatsapp: process.env.NEXT_PUBLIC_GADS_WHATSAPP_LABEL ?? "",
};
export type AdsConversion = keyof typeof ADS_LABELS;

// Events Meta recognises as standard; anything else goes out as a custom event.
const META_STANDARD = new Set(["PageView", "Contact", "Lead", "Subscribe"]);

type Fn = (...args: unknown[]) => void;

// Meta standard event -> Google recommended event.
const GOOGLE_EVENTS: Record<string, string> = {
  PageView: "page_view",
  Contact: "contact",
  Lead: "generate_lead",
  Subscribe: "sign_up",
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

/**
 * Report a Google Ads conversion. `userData` (email / phone) is passed as
 * enhanced-conversion data: gtag hashes it before it leaves the browser.
 */
export function adsConversion(kind: AdsConversion, userData?: { email?: string; phone_number?: string }) {
  if (typeof window === "undefined") return;
  const label = ADS_LABELS[kind];
  const w = window as unknown as { gtag?: Fn };
  if (!label || !w.gtag) return;
  if (userData) w.gtag("set", "user_data", userData);
  w.gtag("event", "conversion", { send_to: `${GOOGLE_TAG_ID}/${label}` });
}

/** "+91 98765 43210" / "9876543210" -> "+919876543210" (E.164, India default). */
export function toE164(raw: string): string | undefined {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return undefined;
}
