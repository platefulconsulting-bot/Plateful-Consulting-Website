/**
 * Database seed
 * ---------------------------------------------------------------------------
 * Idempotent. Safe to re-run: everything is upserted by natural key, so seeding
 * a second time updates rather than duplicates, and never clobbers posts the
 * team has since edited in the Studio (see PRESERVE_EDITS below).
 *
 * Run with:  npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { categories, founders } from "../src/lib/site";
import { estimateReadingMinutes } from "../src/lib/utils";

const db = new PrismaClient();

/**
 * When true, any post the Studio has saved (flagged `editedInStudio`) is left
 * untouched by a re-import, so re-running the seed never overwrites the team's
 * own writing.
 */
const PRESERVE_EDITS = true;

type LegacyPost = {
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  publishedAt: string | null;
  readingMinutes: number;
  wordCount: number;
  headings: { id: string; text: string; level: number }[];
  category: string;
  tags: string[];
};

/**
 * Two migrated articles shipped under an identical title, which makes them
 * compete for the same query. Both URLs are kept so their existing rankings
 * survive, but the titles are differentiated to stop the cannibalisation.
 */
const TITLE_OVERRIDES: Record<string, string> = {
  "how-to-increase-swiggy-orders-in-30-days":
    "Swiggy Order Growth Checklist: Listing, Menu, Ratings and Ads",
};

/** Longer, higher-intent guides get surfaced on the blog index. */
const FEATURED = new Set([
  "how-swiggy-ranking-algorithm-works-for-restaurants-2026",
  "swiggy-ads-strategy-how-to-get-5x-roas-without-wasting-budget",
  "zomato-commission-structure-2026-what-restaurants-actually-pay",
  "menu-optimization-for-delivery-how-to-design-a-menu-that-sells-on-swiggy-and-zomato",
]);

/**
 * Deepak leads the practice and carries the byline on every article — he is the
 * name the business goes to market with, so the blog credits him throughout.
 */
const DEFAULT_AUTHOR = "deepak-desh-bandhu";

function slugifyTag(name: string) {
  return name.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
}

async function main() {
  console.log("Seeding Plateful Consulting…\n");

  // --- Studio user --------------------------------------------------------
  const email = process.env.STUDIO_EMAIL ?? "info@platefulconsulting.com";
  const password = process.env.STUDIO_PASSWORD ?? "plateful-change-me";
  if (password === "plateful-change-me") {
    console.warn("  ! STUDIO_PASSWORD is unset — using the insecure default.");
    console.warn("    Set it in .env before deploying.\n");
  }
  await db.user.upsert({
    where: { email },
    update: { name: "Plateful Admin", role: "admin" },
    create: {
      email,
      name: "Plateful Admin",
      role: "admin",
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  console.log(`  users      ✓ studio login: ${email}`);

  // --- Authors ------------------------------------------------------------
  for (const f of founders) {
    await db.author.upsert({
      where: { slug: f.slug },
      update: { name: f.name, role: f.role, bio: f.bio },
      create: { slug: f.slug, name: f.name, role: f.role, bio: f.bio },
    });
  }
  console.log(`  authors    ✓ ${founders.length}`);

  // --- Categories ---------------------------------------------------------
  for (const c of categories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, accent: c.accent, order: c.order },
      create: { slug: c.slug, name: c.name, description: c.description, accent: c.accent, order: c.order },
    });
  }
  console.log(`  categories ✓ ${categories.length}`);

  // --- Posts --------------------------------------------------------------
  const jsonPath = resolve(process.cwd(), "content/legacy-posts.json");
  if (!existsSync(jsonPath)) {
    console.log("\n  ! content/legacy-posts.json not found — run `npm run scrape` first.");
    return;
  }

  const legacy: LegacyPost[] = JSON.parse(readFileSync(jsonPath, "utf8"));
  const authorIds = new Map<string, string>();
  for (const f of founders) {
    const a = await db.author.findUnique({ where: { slug: f.slug } });
    if (a) authorIds.set(f.slug, a.id);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const p of legacy) {
    const existing = await db.post.findUnique({ where: { slug: p.slug } });

    if (existing && PRESERVE_EDITS && existing.editedInStudio) {
      skipped++;
      continue;
    }

    const category = await db.category.findUnique({ where: { slug: p.category } });
    const authorSlug = DEFAULT_AUTHOR;

    // Tags are shared across posts, so create them before connecting.
    const tagIds: { id: string }[] = [];
    for (const name of p.tags) {
      const slug = slugifyTag(name);
      const tag = await db.tag.upsert({
        where: { slug },
        update: { name },
        create: { slug, name },
      });
      tagIds.push({ id: tag.id });
    }

    const title = TITLE_OVERRIDES[p.slug] ?? p.title;

    const data = {
      title,
      excerpt: p.excerpt,
      contentHtml: p.contentHtml,
      status: "published",
      featured: FEATURED.has(p.slug),
      // Recomputed from the HTML rather than trusting the scrape, so a
      // re-import always reflects the content actually stored.
      readingMinutes: estimateReadingMinutes(p.contentHtml),
      publishedAt: p.publishedAt ? new Date(p.publishedAt) : new Date(),
      metaTitle: `${title} | Plateful Consulting`,
      metaDescription: p.excerpt.slice(0, 158),
      categoryId: category?.id ?? null,
      authorId: authorIds.get(authorSlug) ?? null,
    };

    if (existing) {
      await db.post.update({
        where: { slug: p.slug },
        data: { ...data, tags: { set: tagIds } },
      });
      updated++;
    } else {
      await db.post.create({
        data: { slug: p.slug, ...data, tags: { connect: tagIds } },
      });
      created++;
    }
  }

  console.log(`  posts      ✓ ${created} created, ${updated} refreshed, ${skipped} left alone (edited in Studio)`);

  const total = await db.post.count({ where: { status: "published" } });
  console.log(`\nDone. ${total} published articles live.\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
