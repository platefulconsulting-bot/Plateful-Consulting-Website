import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/posts";
import { categories } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

/**
 * Sitemap.
 *
 * Articles keep their root-level URLs from the WordPress site. Category
 * listings are included so the taxonomy pages get crawled, but the paginated
 * and search views are left out — they are filtered views of content already
 * listed here, and would only dilute the crawl budget.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPostSlugs();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/about-us"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/contact-us"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/blogs"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/terms-and-condition"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/privacy-policy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`/blogs?category=${c.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/${post.slug}`),
    lastModified: post.updatedAt ?? post.publishedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...postPages];
}
