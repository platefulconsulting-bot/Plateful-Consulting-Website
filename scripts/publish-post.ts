/**
 * Publish an article from files, without going through the Studio UI.
 * ---------------------------------------------------------------------------
 *   npx tsx --env-file=.env.local scripts/publish-post.ts content/posts/<slug>.json
 *
 * Reads `<slug>.json` (metadata) and the sibling `<slug>.html` (body), then
 * creates or updates the post exactly as `savePostAction` would: sanitised
 * HTML, reading time, tag upserts, and `editedInStudio` so a re-seed leaves it
 * alone. The sitemap, /blogs and the article page pick it up on their next ISR
 * revalidation (at most an hour), or immediately on the next deploy.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { sanitizeArticle, htmlToText } from "../src/lib/sanitize";
import { slugify, estimateReadingMinutes, truncate } from "../src/lib/utils";

const metaSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(4).max(200),
  excerpt: z.string().max(400).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(320).optional(),
  category: z.string().optional(), // category slug
  author: z.string().optional(), // author slug
  tags: z.array(z.string()).max(12).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.boolean().default(false),
  coverImage: z.string().optional(),
  coverAlt: z.string().optional(),
});

async function main() {
  const metaPath = process.argv[2];
  if (!metaPath) throw new Error("Usage: publish-post.ts content/posts/<slug>.json");

  const meta = metaSchema.parse(JSON.parse(readFileSync(resolve(metaPath), "utf8")));
  const html = readFileSync(resolve(metaPath.replace(/\.json$/, ".html")), "utf8");

  const db = new PrismaClient();
  try {
    const contentHtml = sanitizeArticle(html);
    const slug = slugify(meta.slug);

    const category = meta.category
      ? await db.category.findUniqueOrThrow({ where: { slug: meta.category } })
      : null;
    const author = meta.author
      ? await db.author.findUniqueOrThrow({ where: { slug: meta.author } })
      : null;

    const tagIds: { id: string }[] = [];
    for (const name of [...new Set(meta.tags.map((t) => t.trim()).filter(Boolean))]) {
      const tag = await db.tag.upsert({
        where: { slug: slugify(name) },
        update: { name },
        create: { slug: slugify(name), name },
      });
      tagIds.push({ id: tag.id });
    }

    const existing = await db.post.findUnique({ where: { slug }, select: { id: true, publishedAt: true } });
    const publishing = meta.status === "published";

    const payload = {
      slug,
      title: meta.title,
      excerpt: meta.excerpt?.trim() || truncate(htmlToText(contentHtml), 200),
      contentHtml,
      coverImage: meta.coverImage || null,
      coverAlt: meta.coverAlt || null,
      categoryId: category?.id ?? null,
      authorId: author?.id ?? null,
      status: meta.status,
      featured: meta.featured,
      editedInStudio: true,
      readingMinutes: estimateReadingMinutes(contentHtml),
      metaTitle: meta.metaTitle || null,
      metaDescription: meta.metaDescription || null,
      publishedAt: publishing ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null,
    };

    const saved = existing
      ? await db.post.update({ where: { id: existing.id }, data: { ...payload, tags: { set: tagIds } } })
      : await db.post.create({ data: { ...payload, tags: { connect: tagIds } } });

    console.log(
      `${existing ? "Updated" : "Created"} "${saved.title}" (${saved.status}) — /${saved.slug}, ` +
        `${saved.readingMinutes} min read`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
