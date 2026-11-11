import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { site } from "./site";

/** Conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "14 Mar 2026" — unambiguous for an Indian audience, stable across locales. */
export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** ISO date for <time dateTime> and structured data. */
export function isoDate(date: Date | string | null | undefined) {
  if (!date) return undefined;
  const d = typeof date === "string" ? new Date(date) : date;
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function absoluteUrl(path = "/") {
  const base = site.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    // Strip the combining marks that NFKD just separated out.
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

export function estimateReadingMinutes(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/**
 * Deterministic 0–1 value from a string (FNV-1a). Used to give each post a
 * stable generated cover, so the blog looks designed without stock photography.
 */
export function hashRatio(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * Search-snippet description. Google shows ~155 characters; anything longer is
 * cut mid-word. Excerpts migrated from WordPress were already hard-cut at 158
 * characters, so a dangling partial word is dropped and the text ends on a
 * full word.
 */
export function metaDescription(text: string | null | undefined, max = 155) {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max && /[.!?…)"”]$/.test(clean)) return clean;
  const cut = clean.length <= max ? clean : clean.slice(0, max + 1);
  const words = cut.replace(/\s+\S*$/, "").replace(/[\s,;:–—-]+$/, "");
  return `${words}…`;
}

/** Excerpt trimmed to whole sentences (no trailing ellipsis), max ~300 chars. */
export function sentenceExcerpt(text: string | null | undefined, max = 300) {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max && /[.!?]$/.test(clean)) return clean;
  const cut = clean.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return end > 60 ? cut.slice(0, end + 1) : metaDescription(clean, max);
}

/** Page title that stays near 60 characters with the brand suffix. */
export function seoTitle(title: string, brand = "Plateful Consulting") {
  // A hand-written meta title from the Studio that already carries a brand
  // suffix ("… | PFC") is used exactly as written.
  if (/\|\s*(PFC|Plateful Consulting)\s*$/i.test(title)) return title;
  const full = `${title} | ${brand}`;
  if (full.length <= 60) return full;
  const short = `${title} | PFC`;
  return short.length <= 60 ? short : title;
}

/** Branded 1200×630 share card rendered by /og. */
export function ogImageUrl(title: string, label?: string | null) {
  const params = new URLSearchParams({ title });
  if (label) params.set("label", label);
  return `/og?${params.toString()}`;
}

export function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  hellip: "…",
  rarr: "→",
  larr: "←",
  times: "×",
  middot: "·",
  bull: "•",
  copy: "©",
  reg: "®",
  trade: "™",
  rupee: "₹",
};

/**
 * Turns HTML entities back into characters. Text pulled out of stored HTML
 * (headings for the contents list, FAQ answers for structured data, plain-text
 * excerpts) is still entity-encoded; React escapes it again on render, which is
 * how "Ratings &amp; Reviews" ended up printed literally. Repeats until stable
 * so double-encoded input ("&amp;amp;") also resolves.
 */
export function decodeEntities(input: string) {
  let out = input;
  for (let i = 0; i < 3; i++) {
    const next = out.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] === "#") {
        const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? match;
    });
    if (next === out) break;
    out = next;
  }
  return out;
}
