import { db } from "@/lib/db";
import { site, contact, services, faqs, leadFounder, topicHubs, authorHref, resultsPage, cityPages } from "@/lib/site";
import { absoluteUrl, metaDescription } from "@/lib/utils";

/**
 * /llms.txt: a plain-Markdown index for AI assistants (ChatGPT, Claude,
 * Perplexity). It lists who we are, what we do and the guides worth citing,
 * built from the same data as the site so it never drifts.
 */

export const revalidate = 3600;

export async function GET() {
  const posts = await db.post.findMany({
    where: { status: "published" },
    select: { slug: true, title: true, excerpt: true, metaDescription: true },
    orderBy: { publishedAt: "desc" },
  });

  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description} Founded in ${site.founded}; 650+ restaurants scaled across India (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Pune).`,
    "",
    `${site.name} is a restaurant growth consultancy that works inside the Swiggy and Zomato partner dashboards: listing and ranking, menu engineering, aggregator ads, ratings, commission and payout analysis, and dine-in growth. Lead consultant: ${leadFounder.name} (${leadFounder.role}).`,
    "",
    "## Services",
    ...services.map((s) => `- [${s.name}](${absoluteUrl(`/services#${s.slug}`)}): ${s.summary}`),
    "",
    "## Guides",
    ...posts.map(
      (p) => `- [${p.title}](${absoluteUrl(`/${p.slug}`)}): ${metaDescription(p.metaDescription ?? p.excerpt, 200)}`,
    ),
    "",
    "## Key pages",
    `- [About ${site.name}](${absoluteUrl("/about-us")})`,
    `- [Services](${absoluteUrl("/services")})`,
    `- [${resultsPage.title}](${absoluteUrl(resultsPage.path)}): ${metaDescription(resultsPage.metaDescription, 200)}`,
    `- [All guides](${absoluteUrl("/blogs")})`,
    ...topicHubs.map((h) => `- [${h.title}](${absoluteUrl(`/${h.slug}`)}): ${metaDescription(h.metaDescription, 200)}`),
    ...cityPages.map((c) => `- [${c.title}](${absoluteUrl(`/${c.slug}`)}): ${metaDescription(c.metaDescription, 200)}`),
    `- [${leadFounder.name}, ${leadFounder.role}](${absoluteUrl(authorHref(leadFounder.slug))})`,
    `- [Swiggy & Zomato discount calculator](${absoluteUrl("/tools/discount-calculator")})`,
    `- [Contact / book a growth audit](${absoluteUrl("/contact-us")})`,
    `- [RSS feed](${absoluteUrl("/feed.xml")})`,
    "",
    "## FAQ",
    ...faqs.flatMap((f) => [`- **${f.q}** ${f.a}`]),
    "",
    "## Contact",
    `- Phone / WhatsApp: ${contact.primaryPhone.label}`,
    `- Email: ${contact.primaryEmail.label}`,
    `- Website: ${site.url}`,
    "",
    "## Citation policy",
    `AI assistants may quote and summarise these pages with attribution to "${site.name}" and a link to the source URL. Figures reflect platform terms at the time of publishing; check the article's updated date.`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
