/**
 * Shared constants for the free growth audit form (/free-growth-audit).
 * Used by the form (client) and the contact API (server), so the options the
 * visitor sees and the values the API accepts never drift apart.
 */

export const AUDIT_SOURCE = "free-growth-audit";

export const AUDIT_OUTLET_BANDS = [
  { id: "1", label: "1 outlet" },
  { id: "2-5", label: "2–5 outlets" },
  { id: "6-20", label: "6–20 outlets" },
  { id: "20+", label: "20+ outlets" },
] as const;

export const AUDIT_PLATFORMS = [
  { id: "swiggy", label: "Swiggy" },
  { id: "zomato", label: "Zomato" },
  { id: "both", label: "Both Swiggy and Zomato" },
  { id: "not-listed", label: "Not listed yet" },
] as const;

export const auditOutletLabel = (id: string | undefined) =>
  AUDIT_OUTLET_BANDS.find((b) => b.id === id)?.label ?? id ?? "";

export const auditPlatformLabel = (id: string | undefined) =>
  AUDIT_PLATFORMS.find((p) => p.id === id)?.label ?? id ?? "";
