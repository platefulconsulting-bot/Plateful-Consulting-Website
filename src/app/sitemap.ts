import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/posts";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

/**
 * Sitemap.
 *
 * Articles keep their root-level URLs from the WordPress site. Category,
 * paginated and search views of /blogs are left out: they canonicalise to
 * /blogs (Search Console reports them as alternates), so listing them only
 * sends mixed signals and dilutes the crawl budget.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPostSlugs();
  const now = new Date();

  // Real modification dates only: a lastmod that changes on every build teaches
  // Google to ignore it. Home and /blogs change when a post does; the static
  // pages carry the date their copy last changed (bump these when editing).
  const latestPost = posts.reduce<Date | null>((latest, p) => {
    const d = p.updatedAt ?? p.publishedAt;
    return d && (!latest || d > latest) ? d : latest;
  }, null) ?? now;
  const STATIC_UPDATED = new Date("2026-11-12");
  const LEGAL_UPDATED = new Date("2026-03-19");

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: latestPost, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/about-us"), lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/contact-us"), lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/blogs"), lastModified: latestPost, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/tools/discount-calculator"), lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/whats-new"), lastModified: latestPost, changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/terms-and-condition"), lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/privacy-policy"), lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.2 },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/${post.slug}`),
    lastModified: post.updatedAt ?? post.publishedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...postPages];
}
