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

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/about-us"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/contact-us"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/blogs"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/terms-and-condition"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/privacy-policy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/${post.slug}`),
    lastModified: post.updatedAt ?? post.publishedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...postPages];
}
