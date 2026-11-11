import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { PostCard } from "@/components/site/PostCard";
import { CTABand } from "@/components/site/CTABand";
import { getPostsBySlugs, getPostsByTitleKeywords } from "@/lib/posts";
import { serviceBySlug, topicHubs, type TopicHub } from "@/lib/site";
import { jsonLd, breadcrumbSchema, collectionPageSchema } from "@/lib/seo";
import { metaDescription, ogImageUrl, seoTitle } from "@/lib/utils";

/**
 * Topic hub: a curated, grouped index of existing articles on one subject
 * (Swiggy growth, Zomato growth, commission and payouts). Each hub answers
 * its core question up front, then routes readers to the depth.
 */

export function topicHubMetadata(hub: TopicHub): Metadata {
  const path = `/${hub.slug}`;
  const description = metaDescription(hub.metaDescription);
  const image = ogImageUrl(hub.metaTitle, "Topic guide");
  return {
    title: { absolute: seoTitle(hub.metaTitle) },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: hub.metaTitle,
      description,
      url: path,
      images: [{ url: image, width: 1200, height: 630, alt: hub.metaTitle }],
    },
    twitter: { card: "summary_large_image", title: hub.metaTitle, description, images: [image] },
  };
}

export async function TopicHubPage({ hub }: { hub: TopicHub }) {
  const path = `/${hub.slug}`;
  const curatedSlugs = [...new Set(hub.groups.flatMap((g) => g.slugs))];

  const [curated, more] = await Promise.all([
    getPostsBySlugs(curatedSlugs),
    getPostsByTitleKeywords(hub.keywords, { excludeSlugs: curatedSlugs, limit: 6 }),
  ]);
  const bySlug = new Map(curated.map((p) => [p.slug, p]));

  // A post can sit in two groups by design, but only the first listing counts
  // toward the ItemList so the structured data has no duplicates.
  const groups = hub.groups
    .map((g) => ({
      ...g,
      posts: g.slugs.map((s) => bySlug.get(s)).filter((p): p is NonNullable<typeof p> => Boolean(p)),
    }))
    .filter((g) => g.posts.length > 0);

  const listed = [...new Map([...groups.flatMap((g) => g.posts), ...more].map((p) => [p.slug, p])).values()];
  const service = serviceBySlug(hub.service);
  const otherHubs = topicHubs.filter((h) => h.slug !== hub.slug);

  const schema = jsonLd(
    collectionPageSchema({
      path,
      name: hub.title,
      description: hub.metaDescription,
      items: listed.map((p) => ({ slug: p.slug, title: p.title })),
    }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blogs", path: "/blogs" },
      { name: hub.shortName, path },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ================= HEADER ================= */}
      <header className="relative overflow-hidden border-b border-cream-100/8">
        <div className="grid-lines absolute inset-0 mask-fade-b opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(180,122,23,0.18),transparent_55%)]"
          aria-hidden
        />

        <div className="container-x relative py-12 lg:py-20">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-cream-500">
              <li>
                <Link href="/" className="transition-colors hover:text-gold-300">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li>
                <Link href="/blogs" className="transition-colors hover:text-gold-300">
                  Blogs
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li aria-current="page" className="text-cream-300">
                {hub.shortName}
              </li>
            </ol>
          </nav>

          <Reveal immediate className="mt-8 max-w-3xl">
            <p className="eyebrow">{hub.eyebrow}</p>
            <h1 className="mt-6 text-[length:var(--text-display-xl)] font-bold leading-[1.0] tracking-[-0.03em]">
              {hub.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-cream-300">{hub.intro}</p>
          </Reveal>

          {groups.length > 1 && (
            <Reveal immediate delay={0.08}>
              <ul className="mt-9 flex flex-wrap gap-2.5" aria-label="Sections">
                {groups.map((g, i) => (
                  <li key={g.name}>
                    <a
                      href={`#group-${i + 1}`}
                      className="inline-flex items-center rounded-full border border-cream-100/12 px-4 py-2 text-sm text-cream-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/50 hover:text-gold-300"
                    >
                      {g.name}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </header>

      {/* ================= GROUPS ================= */}
      <div className="divide-y divide-cream-100/8">
        {groups.map((group, gi) => (
          <section
            key={group.name}
            id={`group-${gi + 1}`}
            className="section-tight scroll-mt-28"
            aria-labelledby={`group-${gi + 1}-title`}
          >
            <div className="container-x">
              <Reveal className="max-w-2xl">
                <h2
                  id={`group-${gi + 1}-title`}
                  className="text-[length:var(--text-display-md)] font-bold leading-[1.1]"
                >
                  {group.name}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-cream-400">{group.description}</p>
              </Reveal>

              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {group.posts.map((post, i) => (
                  <Reveal key={post.id} delay={i * 0.08} className="h-full">
                    <PostCard post={post} className="h-full" />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ))}

        {more.length > 0 && (
          <section className="section-tight" aria-labelledby="more-title">
            <div className="container-x">
              <Reveal className="max-w-2xl">
                <h2 id="more-title" className="text-[length:var(--text-display-md)] font-bold leading-[1.1]">
                  More on this topic
                </h2>
              </Reveal>
              <ul className="mt-6 max-w-3xl space-y-1">
                {more.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/${post.slug}`}
                      className="group flex items-start justify-between gap-4 rounded-xl border border-transparent p-3.5 transition-colors hover:border-cream-100/10 hover:bg-cream-100/4"
                    >
                      <span className="text-sm font-medium leading-snug text-cream-200 transition-colors group-hover:text-gold-300">
                        {post.title}
                      </span>
                      <ArrowUpRight
                        className="mt-0.5 h-4 w-4 shrink-0 text-cream-500 transition-colors group-hover:text-gold-400"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      {/* ================= NEXT STEPS ================= */}
      <section className="section-tight border-t border-cream-100/8 bg-ink-850/60" aria-labelledby="next-title">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-2">
            {service && (
              <Reveal>
                <div className="card card-sheen h-full p-7 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
                    Want this done for you?
                  </p>
                  <h2 id="next-title" className="mt-3 font-display text-xl font-bold text-cream-50">
                    {service.name}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-cream-400">{service.outcome}</p>
                  <Link href={`/services#${service.slug}`} className="btn btn-gold btn-sm mt-6">
                    See how it works
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </Reveal>
            )}
            <Reveal delay={0.08}>
              <div className="card h-full p-7 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-500">
                  Other topic guides
                </p>
                <ul className="mt-4 space-y-2">
                  {otherHubs.map((h) => (
                    <li key={h.slug}>
                      <Link
                        href={`/${h.slug}`}
                        className="inline-flex items-center gap-1.5 font-display text-lg font-semibold text-cream-100 transition-colors hover:text-gold-300"
                      >
                        {h.title}
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/tools/discount-calculator"
                      className="inline-flex items-center gap-1.5 font-display text-lg font-semibold text-cream-100 transition-colors hover:text-gold-300"
                    >
                      Swiggy &amp; Zomato discount calculator
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CTABand className="border-t border-cream-100/8" />
    </>
  );
}
