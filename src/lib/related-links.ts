import { caseStudies, resultsPage, type CaseStudy } from "@/lib/site";

/**
 * Internal links for the "Keep going" block at the foot of every blog post:
 * one service, one free tool and one client result, chosen from the post's
 * slug, title, category and tags.
 *
 * Pure and synchronous on purpose. It runs on the server for every article,
 * needs no database call, and can be checked by reading the examples below.
 *
 * Matching is keyword based. The post's slug, title, category (slug and name)
 * and tags are lower-cased into one string, hyphens become spaces, and each
 * rule is a whole-word regular expression, so "ads" matches "Swiggy ads" but
 * not "downloads" or "roads".
 *
 * Copy rules: plain practitioner tone, no guarantees, commission only as a
 * range, and case-study numbers only ever come from `caseStudies` in site.ts.
 *
 * @example
 * // Commission post: commission service, commission calculator, Drama.
 * relatedLinks({ slug: "how-to-reduce-swiggy-commission", title: "How to reduce Swiggy commission" })
 * // → variant "full"; hrefs: "/commission-reduction", "/tools/commission-calculator", "/results#drama"
 *
 * @example
 * // Ads post in Hyderabad: account management, ROAS calculator, Balaji Dhaba case study.
 * relatedLinks({
 *   slug: "swiggy-ads-guide",
 *   title: "Swiggy ads that pay back in Hyderabad",
 *   category: { slug: "ads-and-roas", name: "Ads & ROAS" },
 * })
 * // → hrefs: "/swiggy-zomato-account-management", "/tools/ads-roas-calculator",
 * //          "/balaji-dhaba-case-study-hyderabad-zomato-swiggy"
 *
 * @example
 * // Discount post: no service keyword, so the free audit; discount calculator;
 * // Punjabi Rasoi (discount cut from 27.3% to 13.4% while sales grew).
 * relatedLinks({ slug: "zomato-discount-strategy", title: "Zomato discount strategy", tags: [{ slug: "offers", name: "Offers" }] })
 * // → hrefs: "/free-growth-audit", "/tools/discount-calculator", "/punjabi-rasoi-case-study-delhi-swiggy-zomato"
 *
 * @example
 * // Setup post: free audit, menu price calculator (pricing), Olantic 8 launch.
 * relatedLinks({ slug: "cloud-kitchen-business-plan", title: "Cloud kitchen business plan and menu pricing" })
 * // → hrefs: "/free-growth-audit", "/tools/menu-price-calculator", "/olantic-8-case-study-gurugram-swiggy-zomato"
 *
 * @example
 * // Pune post with nothing else to match: free audit, commission calculator, Burrito Bros.
 * relatedLinks({ slug: "best-food-delivery-in-pune", title: "Food delivery in Pune" })
 * // → hrefs: "/free-growth-audit", "/tools/commission-calculator", "/burrito-bros-case-study-pune-swiggy-zomato"
 *
 * @example
 * // Case-study posts already are a result, so the block links onward instead.
 * relatedLinks({ slug: "olantic-8-case-study-gurugram-swiggy-zomato", title: "Olantic 8 case study" })
 * // → variant "case-study"; hrefs: "/results", "/free-growth-audit"
 */

export type RelatedLinkKind = "service" | "tool" | "case-study" | "results" | "audit";

export type RelatedLink = {
  kind: RelatedLinkKind;
  /** Small label above the title, e.g. "Service". */
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  /** Link text at the foot of the card. */
  cta: string;
  /** Optional short chip, used for a case study's headline result. */
  chip?: string;
};

export type RelatedLinks = {
  /** "full" = service + tool + case study; "case-study" = onward links only. */
  variant: "full" | "case-study";
  links: RelatedLink[];
};

export type RelatedLinksInput = {
  slug: string;
  title: string;
  category?: { slug: string; name: string } | null;
  tags?: { slug: string; name: string }[];
};

// ---------------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------------

const AUDIT: RelatedLink = {
  kind: "service",
  eyebrow: "Service",
  title: "Free Swiggy & Zomato growth audit",
  body: "We go through your live listing, menu, ads and discounts and show you where orders and margin are leaking. No cost and no obligation.",
  href: "/free-growth-audit",
  cta: "Get the free audit",
};

const SERVICES = {
  commission: {
    kind: "service",
    eyebrow: "Service",
    title: "Commission and payout reduction",
    body: "Commission plus GST alone usually runs 20–28% of an order, before ads and discounts. We find which deductions you can legitimately bring down.",
    href: "/commission-reduction",
    cta: "See how it works",
  },
  accountManagement: {
    kind: "service",
    eyebrow: "Service",
    title: "Swiggy & Zomato account management",
    body: "Listing, menu, ratings, ads and offers run for you every week, with a weekly one-page report and a monthly review.",
    href: "/swiggy-zomato-account-management",
    cta: "See how it works",
  },
  audit: AUDIT,
} satisfies Record<string, RelatedLink>;

const TOOLS = {
  commission: {
    kind: "tool",
    eyebrow: "Free tool",
    title: "Commission calculator",
    body: "See what you pay Swiggy and Zomato in commission each month, and what a lower rate would save.",
    href: "/tools/commission-calculator",
    cta: "Open the calculator",
  },
  discount: {
    kind: "tool",
    eyebrow: "Free tool",
    title: "Discount calculator",
    body: "Check whether an offer makes money or just burns margin, before you switch it on.",
    href: "/tools/discount-calculator",
    cta: "Open the calculator",
  },
  ads: {
    kind: "tool",
    eyebrow: "Free tool",
    title: "Ads ROAS calculator",
    body: "Work out what your Swiggy and Zomato ads actually return after commission and food cost.",
    href: "/tools/ads-roas-calculator",
    cta: "Open the calculator",
  },
  menu: {
    kind: "tool",
    eyebrow: "Free tool",
    title: "Menu price calculator",
    body: "Price a dish for delivery so it still leaves a margin after commission, packaging and discounts.",
    href: "/tools/menu-price-calculator",
    cta: "Open the calculator",
  },
} satisfies Record<string, RelatedLink>;

// ---------------------------------------------------------------------------
// Keyword rules (whole words, matched against the normalised haystack)
// ---------------------------------------------------------------------------

const RX = {
  commission: /\b(commissions?|take rate|payouts?|deductions?)\b/,
  ads: /\b(ads?|advertising|advertisements?|roas|cpc|campaigns?|ads and roas)\b/,
  accountManagement:
    /\b(ratings?|reviews?|listings?|menus?|orders?|visibility|ranking|platform ranking|menu strategy|ratings and reviews)\b/,
  setup:
    /\b(cloud kitchens?|registrations?|register|licen[cs]es?|fssai|gst registration|home kitchens?|business plans?|franchises?|franchising|setup|set up|start(ing)? a (restaurant|cloud kitchen)|onboarding|launch(ing)?)\b/,
  discount: /\b(discounts?|offers?|coupons?|promo codes?)\b/,
  menuPricing: /\b(menu|menus|pricing|price|prices|food cost|margins?|margins and pricing|menu strategy)\b/,
};

/** City words → case-study slug. Checked in this order. */
const CITY_CASES: { rx: RegExp; caseSlug: string }[] = [
  { rx: /\b(hyderabad|secunderabad|marredpally)\b/, caseSlug: "balaji-dhaba" },
  { rx: /\bpune\b/, caseSlug: "burrito-bros" },
  { rx: /\b(gurugram|gurgaon)\b/, caseSlug: "olantic-8" },
  { rx: /\bnoida\b/, caseSlug: "punjabi-rasoi" },
  { rx: /\b(delhi|ncr|rohini|dwarka|connaught place)\b/, caseSlug: "punjabi-rasoi" },
];

/** Strong all-round default: two platforms, ad spend shown next to sales. */
const DEFAULT_CASE = "drama";

// ---------------------------------------------------------------------------

function haystack({ slug, title, category, tags = [] }: RelatedLinksInput): string {
  return [slug, title, category?.slug, category?.name, ...tags.flatMap((t) => [t.slug, t.name])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ");
}

function pickService(text: string): RelatedLink {
  if (RX.commission.test(text)) return SERVICES.commission;
  // Setup questions come before ads/menu: "cloud kitchen menu" is a setup post.
  if (RX.setup.test(text)) return SERVICES.audit;
  if (RX.ads.test(text)) return SERVICES.accountManagement;
  if (RX.accountManagement.test(text)) return SERVICES.accountManagement;
  return SERVICES.audit;
}

function pickTool(text: string): RelatedLink {
  if (RX.commission.test(text)) return TOOLS.commission;
  if (RX.discount.test(text)) return TOOLS.discount;
  if (RX.ads.test(text)) return TOOLS.ads;
  if (RX.menuPricing.test(text)) return TOOLS.menu;
  return TOOLS.commission;
}

function pickCase(text: string, currentSlug: string): CaseStudy {
  const bySlug = (s: string) => caseStudies.find((c) => c.slug === s);
  const candidates: string[] = [];

  for (const { rx, caseSlug } of CITY_CASES) if (rx.test(text)) candidates.push(caseSlug);
  // No city: match the topic to the case that shows it best.
  if (RX.setup.test(text)) candidates.push("olantic-8"); // new delivery launch
  if (RX.discount.test(text)) candidates.push("punjabi-rasoi"); // shallower discounts, sales up
  candidates.push(DEFAULT_CASE);

  for (const s of candidates) {
    const c = bySlug(s);
    // Never link a post to itself.
    if (c && c.post !== currentSlug) return c;
  }
  return caseStudies[0];
}

function caseLink(c: CaseStudy): RelatedLink {
  return {
    kind: "case-study",
    eyebrow: "Client result",
    title: c.name,
    body: `${c.work} Individual result, not a guarantee.`,
    chip: c.highlight,
    href: c.post ? `/${c.post}` : `${resultsPage.path}#${c.slug}`,
    cta: c.post ? "Read the case study" : "See the numbers",
  };
}

export function isCaseStudySlug(slug: string): boolean {
  return slug.includes("case-study");
}

export function relatedLinks(input: RelatedLinksInput): RelatedLinks {
  if (isCaseStudySlug(input.slug)) {
    return {
      variant: "case-study",
      links: [
        {
          kind: "results",
          eyebrow: "More results",
          title: "All client results",
          body: `Before and after numbers for ${caseStudies.length} outlets in Delhi NCR, Hyderabad and Pune, with ad spend shown next to sales.`,
          href: resultsPage.path,
          cta: "See all results",
        },
        { ...AUDIT, kind: "audit", eyebrow: "Your outlet" },
      ],
    };
  }

  const text = haystack(input);
  return {
    variant: "full",
    links: [pickService(text), pickTool(text), caseLink(pickCase(text, input.slug))],
  };
}
