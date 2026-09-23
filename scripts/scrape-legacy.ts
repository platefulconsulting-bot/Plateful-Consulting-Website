/**
 * Legacy content migration
 * ---------------------------------------------------------------------------
 * Pulls every article off the live WordPress site, strips the Elementor
 * scaffolding, and emits clean semantic HTML into `content/legacy-posts.json`.
 * `prisma/seed.ts` then loads that file into the database.
 *
 * Slugs are preserved exactly so the replatform does not lose the rankings and
 * backlinks these articles have already earned. The one exception is the
 * WordPress-generated `/1169-2/`, which gets a real slug plus a 301 in
 * next.config.ts.
 *
 * Run with:  npm run scrape
 */

import * as cheerio from "cheerio";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// --- The article inventory, taken from the live post-sitemap.xml ------------
type Source = { slug: string; url?: string };

const SOURCES: Source[] = [
  { slug: "how-to-increase-swiggy-orders" },
  { slug: "swiggy-dineout-vs-zomato-dine-in", url: "https://platefulconsulting.com/1169-2/" },
  { slug: "how-swiggy-ranking-algorithm-works-for-restaurants-2026" },
  { slug: "how-to-increase-zomato-orders-a-data-driven-guide-for-restaurants" },
  { slug: "zomato-commission-structure-2026-what-restaurants-actually-pay" },
  { slug: "zomato-dine-in-growth-how-to-increase-table-bookings-and-walk-ins" },
  { slug: "swiggy-vs-zomato-for-restaurants-which-platform-drives-more-sales" },
  { slug: "swiggy-vs-zomato-commission-side-by-side-comparison-for-2026" },
  { slug: "menu-optimization-for-delivery-how-to-design-a-menu-that-sells-on-swiggy-and-zomato" },
  { slug: "how-to-start-a-cloud-kitchen-on-swiggy-and-zomato-2026-guide" },
  { slug: "best-restaurant-consultant-in-delhi-ncr-what-to-look-for" },
  { slug: "what-does-a-restaurant-consultant-actually-do-roles-cost-roi" },
  { slug: "why-most-restaurants-fail-on-swiggy-and-zomato-and-how-to-fix-it" },
  { slug: "is-hiring-a-swiggy-and-zomato-consultant-worth-it-roi-case-study" },
  { slug: "how-to-increase-swiggy-orders-in-30-days" },
  { slug: "swiggy-listing-optimization-the-complete-guide-for-restaurant-owners" },
  { slug: "swiggy-ads-strategy-how-to-get-5x-roas-without-wasting-budget" },
  { slug: "zomato-restaurant-ranking-how-the-algorithm-decides-who-gets-seen" },
  { slug: "zomato-ads-for-restaurants-complete-strategy-and-budget-guide" },
  { slug: "restaurant-menu-pricing-strategy-for-online-delivery-in-india" },
  { slug: "food-cost-control-for-restaurants-how-to-protect-margins-on-delivery" },
  { slug: "restaurant-packaging-for-delivery-how-to-reduce-negative-reviews-by-40" },
  { slug: "swiggy-and-zomato-growth-consultant-in-mumbai" },
  { slug: "restaurant-consultant-in-bangalore-growing-delivery-and-dine-in-sales" },
  { slug: "restaurant-aggregator-dependency-how-to-build-a-profitable-channel-mix" },
  { slug: "how-to-reduce-swiggy-commission-impact-on-restaurant-margins" },
  { slug: "best-time-to-run-ads-on-swiggy-hour-by-hour-breakdown" },
  { slug: "swiggy-restaurant-rating-how-to-go-from-3-8-to-4-5-in-60-days" },
  { slug: "how-to-improve-zomato-ratings-7-proven-tactics-that-work" },
  { slug: "how-to-handle-negative-reviews-on-zomato-without-losing-rankings" },
  { slug: "should-your-restaurant-be-on-both-swiggy-and-zomato" },
  { slug: "swiggy-vs-zomato-ads-where-should-you-spend-your-ad-budget" },
];

// --- Taxonomy --------------------------------------------------------------
// Ordered: the first rule whose test matches the slug wins.
const CATEGORY_RULES: { test: RegExp; category: string }[] = [
  { test: /ads?-|-ads|roas|ad-budget|time-to-run/, category: "ads-and-roas" },
  { test: /commission|food-cost|margin|pricing|aggregator-dependency/, category: "margins-and-pricing" },
  { test: /rating|review|packaging/, category: "ratings-and-reviews" },
  { test: /menu/, category: "menu-strategy" },
  { test: /ranking|algorithm|listing-optimization|fail-on-swiggy/, category: "platform-ranking" },
  { test: /consultant|cloud-kitchen|mumbai|bangalore|delhi/, category: "consulting-and-growth" },
  { test: /dine-in|dineout|table-booking/, category: "dine-in-growth" },
];

const TAG_RULES: { test: RegExp; tag: string }[] = [
  { test: /swiggy/, tag: "Swiggy" },
  { test: /zomato/, tag: "Zomato" },
  { test: /ads?-|-ads|roas/, tag: "Advertising" },
  { test: /menu/, tag: "Menu" },
  { test: /commission|margin|food-cost|pricing/, tag: "Margins" },
  { test: /rating|review/, tag: "Ratings" },
  { test: /cloud-kitchen/, tag: "Cloud Kitchen" },
  { test: /dine-in|dineout/, tag: "Dine-In" },
  { test: /consultant/, tag: "Consulting" },
  { test: /delhi|mumbai|bangalore/, tag: "Cities" },
];

function classify(slug: string) {
  const category = CATEGORY_RULES.find((r) => r.test.test(slug))?.category ?? "platform-ranking";
  const tags = TAG_RULES.filter((r) => r.test.test(slug)).map((r) => r.tag);
  return { category, tags: tags.length ? tags : ["Restaurant Growth"] };
}

// --- Fetch helper with retry ------------------------------------------------
async function fetchHtml(url: string, attempt = 1): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PlatefulMigrator/1.0)" },
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    if (attempt >= 3) throw err;
    await new Promise((r) => setTimeout(r, 1500 * attempt));
    return fetchHtml(url, attempt + 1);
  }
}

/** Strip every WordPress/Elementor attribute; keep only semantic markup. */
function stripAttributes($: cheerio.CheerioAPI, root: cheerio.Cheerio<any>) {
  root.find("*").each((_, el) => {
    const $el = $(el);
    const tag = (el as any).tagName?.toLowerCase();
    const href = $el.attr("href");
    const src = $el.attr("src");
    const alt = $el.attr("alt");
    const colspan = $el.attr("colspan");
    const rowspan = $el.attr("rowspan");

    // Remove every attribute, then restore the handful that carry meaning.
    const attribs = { ...(el as any).attribs };
    for (const name of Object.keys(attribs)) $el.removeAttr(name);

    if (tag === "a" && href) $el.attr("href", href);
    if (tag === "img") {
      if (src) $el.attr("src", src);
      $el.attr("alt", alt ?? "");
      $el.attr("loading", "lazy");
    }
    if (colspan) $el.attr("colspan", colspan);
    if (rowspan) $el.attr("rowspan", rowspan);
  });
}

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function extract(html: string, source: Source) {
  const $ = cheerio.load(html);

  const title =
    $("h1").first().text().trim() ||
    ($("title").text().split(" - ")[0] ?? "").trim();

  const publishedAt =
    $('meta[property="article:published_time"]').attr("content") ??
    $('meta[property="article:modified_time"]').attr("content") ??
    null;

  // The article body is the text-editor widget with the most content. Any
  // additional widget carrying its own H2s is a continuation of the article;
  // everything else (footer blurbs, copyright lines) is ignored.
  const candidates: { $el: cheerio.Cheerio<any>; chars: number; h2: number }[] = [];
  $(".elementor-widget-text-editor").each((_, el) => {
    const $c = $(el).find(".elementor-widget-container").first();
    if (!$c.length) return;
    candidates.push({
      $el: $c,
      chars: $c.text().replace(/\s+/g, " ").trim().length,
      h2: $c.find("h2").length,
    });
  });
  candidates.sort((a, b) => b.chars - a.chars);

  // A few older posts predate the Elementor rebuild and keep their body in the
  // theme's `.page-content` wrapper instead of a text-editor widget. Fall back
  // to it only when the Elementor candidates carry no headings at all, so the
  // Elementor-built articles are left exactly as they are.
  if (!candidates.length || candidates[0].h2 === 0) {
    const $classic = $(".page-content, .entry-content").first();
    if ($classic.length) {
      $classic.find("h1, .comment-respond, #respond, #comments, .comments-area, .post-navigation, .nav-links, .sharedaddy").remove();
      candidates.unshift({
        $el: $classic,
        chars: $classic.text().replace(/\s+/g, " ").trim().length,
        h2: $classic.find("h2").length,
      });
    }
  }

  if (!candidates.length) throw new Error("no content container found");

  const primary = candidates[0];
  const parts = [primary, ...candidates.slice(1).filter((c) => c.h2 > 0 && c.chars > 400)];

  const $body = cheerio.load(`<div id="root">${parts.map((p) => p.$el.html() ?? "").join("\n")}</div>`);
  const $root = $body("#root");

  // 1. Drop Elementor leftovers, comment forms and empty nodes.
  $body("#respond, .comment-respond, #comments, .comments-area, .post-navigation, .nav-links, form").remove();
  $root.find("h1").remove();
  // "Leave a Reply" is emitted as a plain heading by the classic theme.
  $root.find("h2, h3").each((_, el) => {
    if (/^leave a reply/i.test($body(el).text().trim())) {
      // Remove the heading and everything after it — comments are not content.
      let $n = $body(el).next();
      while ($n.length) {
        const $next = $n.next();
        $n.remove();
        $n = $next;
      }
      $body(el).remove();
    }
  });
  $root.find("script, style, noscript, iframe, .elementor-widget-container").each((_, el) => {
    if ((el as any).tagName === "div") $body(el).replaceWith($body(el).html() ?? "");
    else $body(el).remove();
  });
  $root.find("h1, h2, h3, h4, p, div, span").each((_, el) => {
    const $el = $body(el);
    if (!$el.text().trim() && !$el.find("img, table").length) $el.remove();
  });

  stripAttributes($body as any, $root as any);

  // 2. Rewrite absolute internal links to root-relative paths.
  $root.find("a").each((_, el) => {
    const $a = $body(el);
    const href = $a.attr("href") ?? "";
    const internal = href.match(/^https?:\/\/(?:www\.)?platefulconsulting\.com(\/[^\s"]*)?$/i);
    if (internal) {
      let path = (internal[1] ?? "/").replace(/\/$/, "");
      if (path === "") path = "/";
      if (path === "/1169-2") path = "/swiggy-dineout-vs-zomato-dine-in";
      $a.attr("href", path);
    } else if (/^https?:\/\//i.test(href)) {
      $a.attr("target", "_blank").attr("rel", "noopener noreferrer");
    }
  });

  // 3. Promote the "Direct Answer" opener into a styled callout.
  const $first = $root.children().first();
  const firstText = $first.text().trim();
  if (/^direct answer/i.test(firstText)) {
    const question = firstText.replace(/^direct answer:?\s*/i, "").trim();
    const collected: any[] = [];
    let $node = $first.next();
    while ($node.length && !/^h[1-3]$/i.test(($node.get(0) as any)?.tagName ?? "")) {
      collected.push($node.get(0));
      $node = $node.next();
    }
    const inner = collected.map((n) => $body.html(n as any)).join("");
    const callout =
      `<div class="direct-answer">` +
      (question ? `<p><strong>${question}</strong></p>` : "") +
      inner +
      `</div>`;
    $first.replaceWith(callout);
    collected.forEach((n) => $body(n).remove());
  }

  // 4. Make tables horizontally scrollable on mobile.
  $root.find("table").each((_, el) => {
    $body(el).wrap('<div class="table-wrap"></div>');
  });

  // 5. Stable heading ids so the table of contents can deep-link.
  const seen = new Set<string>();
  const headings: { id: string; text: string; level: number }[] = [];
  $root.find("h2, h3").each((_, el) => {
    const $h = $body(el);
    const text = $h.text().trim();
    if (!text) return;
    let id = slugifyHeading(text) || "section";
    let n = 2;
    while (seen.has(id)) id = `${slugifyHeading(text)}-${n++}`;
    seen.add(id);
    $h.attr("id", id);
    headings.push({ id, text, level: (el as any).tagName === "h3" ? 3 : 2 });
  });

  const contentHtml = ($root.html() ?? "").trim();
  // Tags become spaces before counting: cheerio's .text() concatenates adjacent
  // nodes with no separator, which silently merges words across table cells and
  // list items and undercounts the article by a third.
  const plain = contentHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  // Excerpt: prefer the meta description the SEO plugin already tuned.
  const ogDesc = $('meta[property="og:description"]').attr("content") ?? "";
  const excerpt = (ogDesc || plain)
    .replace(/\s*\[…\]\s*$/, "")
    .replace(/^direct answer:?\s*/i, "")
    .slice(0, 240)
    .trim();

  const words = plain.split(/\s+/).filter(Boolean).length;
  const { category, tags } = classify(source.slug);

  return {
    slug: source.slug,
    title,
    excerpt: excerpt.endsWith(".") ? excerpt : `${excerpt}…`,
    contentHtml,
    publishedAt,
    readingMinutes: Math.max(3, Math.round(words / 220)),
    wordCount: words,
    headings,
    category,
    tags,
  };
}

async function main() {
  const out: any[] = [];
  const failures: { slug: string; error: string }[] = [];

  for (const [i, source] of SOURCES.entries()) {
    const url = source.url ?? `https://platefulconsulting.com/${source.slug}/`;
    process.stdout.write(`[${String(i + 1).padStart(2, "0")}/${SOURCES.length}] ${source.slug} … `);
    try {
      const html = await fetchHtml(url);
      const post = extract(html, source);
      out.push(post);
      console.log(`ok (${post.wordCount}w, ${post.headings.length} headings, ${post.category})`);
    } catch (err: any) {
      failures.push({ slug: source.slug, error: err?.message ?? String(err) });
      console.log(`FAILED — ${err?.message ?? err}`);
    }
    await new Promise((r) => setTimeout(r, 700)); // be polite to their host
  }

  const dir = resolve(process.cwd(), "content");
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "legacy-posts.json"), JSON.stringify(out, null, 2), "utf8");

  console.log(`\nWrote ${out.length} posts to content/legacy-posts.json`);
  if (failures.length) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log(`  - ${f.slug}: ${f.error}`));
    process.exitCode = 1;
  }
}

main();
