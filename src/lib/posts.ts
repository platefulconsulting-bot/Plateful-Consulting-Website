import "server-only";
import { db } from "./db";
import { Prisma } from "@prisma/client";

/**
 * Blog data access.
 *
 * Every query lives here so pages never touch Prisma directly — it keeps the
 * select shapes consistent (and small: article bodies are only ever loaded on
 * the article page itself, never for listings).
 */

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  coverAlt: true,
  readingMinutes: true,
  featured: true,
  publishedAt: true,
  category: { select: { slug: true, name: true, accent: true } },
  author: { select: { slug: true, name: true, role: true } },
  tags: { select: { slug: true, name: true } },
} satisfies Prisma.PostSelect;

export type PostCard = Prisma.PostGetPayload<{ select: typeof cardSelect }>;

const PUBLISHED = { status: "published" } satisfies Prisma.PostWhereInput;

export const POSTS_PER_PAGE = 9;

export async function getPosts(options: {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
  query?: string;
  excludeSlug?: string;
} = {}) {
  const {
    page = 1,
    perPage = POSTS_PER_PAGE,
    category,
    tag,
    query,
    excludeSlug,
  } = options;

  const where: Prisma.PostWhereInput = {
    ...PUBLISHED,
    ...(category ? { category: { slug: category } } : {}),
    ...(tag ? { tags: { some: { slug: tag } } } : {}),
    ...(excludeSlug ? { NOT: { slug: excludeSlug } } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
          ],
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
      select: cardSelect,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.post.count({ where }),
  ]);

  return {
    posts,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getPostBySlug(slug: string) {
  return db.post.findFirst({
    where: { slug, ...PUBLISHED },
    include: {
      category: true,
      author: true,
      tags: true,
    },
  });
}

/** Used by generateStaticParams and the sitemap. */
export async function getAllPostSlugs() {
  const posts = await db.post.findMany({
    where: PUBLISHED,
    select: { slug: true, publishedAt: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });
  return posts;
}

export async function getFeaturedPosts(limit = 4) {
  const featured = await db.post.findMany({
    where: { ...PUBLISHED, featured: true },
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  if (featured.length >= limit) return featured;

  // Top up with the most recent posts so the slot is never half-empty.
  const filler = await db.post.findMany({
    where: { ...PUBLISHED, NOT: { id: { in: featured.map((p) => p.id) } } },
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit - featured.length,
  });
  return [...featured, ...filler];
}

export async function getLatestPosts(limit = 3) {
  return db.post.findMany({
    where: PUBLISHED,
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/**
 * Related articles for the bottom of a post: same category first, then the
 * post's tags, then recency. Keeps readers moving through the site instead of
 * bouncing at the end of an article.
 */
export async function getRelatedPosts(
  post: { id: string; categoryId: string | null; tags: { id: string }[] },
  limit = 3,
) {
  const exclude = { NOT: { id: post.id } };

  const sameCategory = post.categoryId
    ? await db.post.findMany({
        where: { ...PUBLISHED, ...exclude, categoryId: post.categoryId },
        select: cardSelect,
        orderBy: { publishedAt: "desc" },
        take: limit,
      })
    : [];

  if (sameCategory.length >= limit) return sameCategory;

  const seen = new Set(sameCategory.map((p) => p.id));
  const tagIds = post.tags.map((t) => t.id);

  const sameTags = tagIds.length
    ? await db.post.findMany({
        where: {
          ...PUBLISHED,
          NOT: { id: { in: [post.id, ...seen] } },
          tags: { some: { id: { in: tagIds } } },
        },
        select: cardSelect,
        orderBy: { publishedAt: "desc" },
        take: limit - sameCategory.length,
      })
    : [];

  const merged = [...sameCategory, ...sameTags];
  if (merged.length >= limit) return merged;

  const recent = await db.post.findMany({
    where: { ...PUBLISHED, NOT: { id: { in: [post.id, ...merged.map((p) => p.id)] } } },
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
    take: limit - merged.length,
  });

  return [...merged, ...recent];
}

/** Pulls the specific articles a service page links out to. */
export async function getPostsBySlugs(slugs: readonly string[]) {
  if (!slugs.length) return [];
  const posts = await db.post.findMany({
    where: { ...PUBLISHED, slug: { in: [...slugs] } },
    select: cardSelect,
  });
  // Preserve the order declared in site.ts rather than the database's.
  const order = new Map(slugs.map((s, i) => [s, i]));
  return posts.sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99));
}

export async function getCategoriesWithCounts() {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { posts: { where: PUBLISHED } } } },
  });
  return categories.filter((c) => c._count.posts > 0);
}

export async function getPostCount() {
  return db.post.count({ where: PUBLISHED });
}

/** Fire-and-forget view counter; failures must never break a page render. */
export async function incrementViews(slug: string) {
  try {
    await db.post.update({ where: { slug }, data: { views: { increment: 1 } } });
  } catch {
    // A missing post or a read-only replica is not worth a 500.
  }
}
