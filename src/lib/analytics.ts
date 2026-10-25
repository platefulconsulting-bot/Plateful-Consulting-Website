/**
 * Meta Pixel helpers.
 *
 * The pixel ID is public (it ships in every page anyway), so it falls back to
 * the PFC dataset when no env override is set.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "812104141846081";

type Fbq = (...args: unknown[]) => void;

/** Fire a standard Meta event. A no-op until the pixel script has loaded. */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  fbq?.("track", event, params);
}
