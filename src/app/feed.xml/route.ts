import { db } from "@/lib/db";
import { site } from "@/lib/site";
import { absoluteUrl, metaDescription } from "@/lib/utils";

/** RSS 2.0 feed of published guides, so readers and AI crawlers pick up new posts. */

export const revalidate = 3600;

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = await db.post.findMany({
    where: { status: "published" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      metaDescription: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const items = posts
    .map((p) => {
      const url = absoluteUrl(`/${p.slug}`);
      return [
        "    <item>",
        `      <title>${esc(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${esc(metaDescription(p.metaDescription ?? p.excerpt, 300))}</description>`,
        p.publishedAt ? `      <pubDate>${p.publishedAt.toUTCString()}</pubDate>` : "",
        p.category ? `      <category>${esc(p.category.name)}</category>` : "",
        p.author ? `      <dc:creator>${esc(p.author.name)}</dc:creator>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const lastBuild = posts[0]?.updatedAt ?? new Date();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(site.name)} — Swiggy &amp; Zomato Growth Guides</title>
    <link>${absoluteUrl("/blogs")}</link>
    <description>${esc(site.description)}</description>
    <language>en-IN</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
