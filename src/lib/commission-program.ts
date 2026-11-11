/**
 * Shared constants for the Commission Reduction Program: the qualifying bands
 * the lead form offers, and the rule that decides who goes straight to a
 * WhatsApp conversation with the founder and who starts with the free audit.
 * Used by both the form (client) and the API route (server), so they agree.
 */

export const PROGRAM_PRICE_FROM = "₹90,000";

export const GMV_BANDS = [
  { id: "lt3", label: "Under ₹3 lakh / month", min: 0 },
  { id: "3to5", label: "₹3–5 lakh / month", min: 3 },
  { id: "5to10", label: "₹5–10 lakh / month", min: 5 },
  { id: "10to25", label: "₹10–25 lakh / month", min: 10 },
  { id: "25plus", label: "₹25 lakh+ / month", min: 25 },
  { id: "new", label: "Not live yet (new outlet)", min: -1 },
] as const;

export const OUTLET_BANDS = [
  { id: "1", label: "1 outlet", count: 1 },
  { id: "2to3", label: "2–3 outlets", count: 2 },
  { id: "4to10", label: "4–10 outlets", count: 4 },
  { id: "10plus", label: "10+ outlets", count: 10 },
] as const;

/** Qualified = ₹10L+/month on the apps, or 2+ outlets. */
export function isQualified(gmv: string, outlets: string) {
  const g = GMV_BANDS.find((b) => b.id === gmv);
  const o = OUTLET_BANDS.find((b) => b.id === outlets);
  return (g ? g.min >= 10 : false) || (o ? o.count >= 2 : false);
}
