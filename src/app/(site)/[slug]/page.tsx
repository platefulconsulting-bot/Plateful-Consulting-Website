import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Calendar, ChevronRight, Clock } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { PostCard } from "@/components/site/PostCard";
import { CTABand } from "@/components/site/CTABand";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ArticleToc } from "@/components/blog/ArticleToc";
import { ShareRow } from "@/components/blog/ShareRow";
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { enhanceArticle } from "@/lib/sanitize";
import { services } from "@/lib/site";
import { jsonLd, articleSchema, breadcrumbSchema } from "@/lib/seo";
import { absoluteUrl, formatDate, isoDate } from "@/lib/utils";

export const revalidate = 3600;

/**
 * Articles live at the site root (`/how-to-increase-swiggy-orders`) because
 * that is where they lived on WordPress, and moving them would forfeit their
 * existing rankings.
 *
 * `dynamicParams` must stay true. The 32 migrated slugs are prerendered by
 * generateStaticParams, but an article published later through the Studio is not
 * in that list — with dynamic params disabled it would 404 until the next
 * deploy, which would quietly break publishing. Unmatched paths are handled by
 * the `notFound()` guard below, not by refusing to render them.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getAllPostSlugs();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/${post.slug}`,
      publishedTime: isoDate(post.publishedAt),
      modifiedTime: isoDate(post.updatedAt),
      authors: post.author ? [post.author.name] : undefined,
      section: post.category?.name,
      tags: post.tags.map((t) => t.name),
      images: post.ogImage ?? post.coverImage ? [post.ogImage ?? post.coverImage!] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  const { html, headings } = enhanceArticle(post.contentHtml);
  const accent = post.category?.accent ?? "#B47A17";
  const url = absoluteUrl(`/${post.slug}`);

  // Point the article at the service that solves the problem it describes.
  const matchedService =
    services.find((s) => s.relatedPosts.includes(post.slug)) ??
    services.find((s) => post.category?.slug === "ads-and-roas" && s.slug === "aggregator-ads") ??
    services.find((s) => s.slug === "delivery-sales-growth")!;

  const schema = jsonLd(
    articleSchema(post),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blogs", path: "/blogs" },
      { name: post.title, path: `/${post.slug}` },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ReadingProgress />

      {/* ================= HEADER ================= */}
      <header className="relative overflow-hidden border-b border-cream-100/8">
        <div className="grid-lines absolute inset-0 mask-fade-b opacity-30" aria-hidden />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 75% 0%, ${accent}22, transparent 55%)`,
          }}
          aria-hidden
        />

        <div className="container-x relative py-12 lg:py-16">
          {/* Breadcrumb */}
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
              {post.category && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  <li>
                    <Link
                      href={`/blogs?category=${post.category.slug}`}
                      className="transition-colors hover:text-gold-300"
                    >
                      {post.category.name}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="mt-7 max-w-4xl">
            {post.category && (
              <Link
                href={`/blogs?category=${post.category.slug}`}
                className="inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-85"
                style={{
                  backgroundColor: `${accent}1f`,
                  color: accent,
                  border: `1px solid ${accent}55`,
                }}
              >
                {post.category.name}
              </Link>
            )}

            <h1 className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.06] tracking-[-0.03em]">
              {post.title}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-cream-300">
              {post.excerpt}
            </p>

            {/* Byline */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-cream-500">
              {post.author && (
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="grid h-9 w-9 place-items-center rounded-full bg-gold-500/15 font-display text-xs font-bold text-gold-300"
                  >
                    {post.author.name
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")}
                  </span>
                  <span>
                    <span className="block font-medium text-cream-200">{post.author.name}</span>
                    <span className="block text-xs">{post.author.role}</span>
                  </span>
                </span>
              )}

              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" aria-hidden />
                  <time dateTime={isoDate(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden />
                {post.readingMinutes} min read
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className="container-x">
        <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14 lg:py-16">
          {/* Article */}
          <div className="min-w-0">
            <article id="article-body" className="prose-pfc" dangerouslySetInnerHTML={{ __html: html }} />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap items-center gap-2.5 border-t border-cream-100/8 pt-8">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-500">
                  Topics
                </span>
                {post.tags.map((tag) => (
                  <Link key={tag.slug} href={`/blogs?tag=${tag.slug}`} className="chip transition-opacity hover:opacity-80">
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8">
              <ShareRow url={url} title={post.title} />
            </div>

            {/* Author card */}
            {post.author && (
              <aside className="card card-sheen mt-12 p-7 md:p-8">
                <div className="flex flex-wrap items-start gap-5">
                  <span
                    aria-hidden
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold-300/25 to-ember-500/15 font-display text-lg font-bold text-gold-300"
                  >
                    {post.author.name
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-500">
                      Written by
                    </p>
                    <h2 className="mt-1.5 font-display text-lg font-bold text-cream-50">
                      {post.author.name}
                    </h2>
                    <p className="text-sm font-medium text-gold-400">{post.author.role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-cream-400">{post.author.bio}</p>
                    <Link
                      href="/about-us"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 transition-colors hover:text-gold-300"
                    >
                      More about the practice
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              </aside>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              <ArticleToc headings={headings} />

              {/* Service cross-sell, matched to the article's topic */}
              <div className="card card-sheen p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
                  Related service
                </p>
                <h2 className="mt-3 font-display text-base font-bold text-cream-50">
                  {matchedService.name}
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-cream-400">
                  {matchedService.outcome}
                </p>
                <Link
                  href={`/services#${matchedService.slug}`}
                  className="btn btn-gold btn-sm mt-5 w-full"
                >
                  See how it works
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>

              <div className="card p-6">
                <p className="font-display text-base font-bold text-cream-50">
                  Want this run on your outlet?
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-cream-400">
                  We will audit your live Swiggy and Zomato dashboards and show you where the
                  orders are leaking.
                </p>
                <Link href="/contact-us" className="btn btn-primary btn-sm mt-5 w-full">
                  Book a growth audit
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ================= RELATED ================= */}
      {related.length > 0 && (
        <section className="section-tight border-t border-cream-100/8" aria-labelledby="related-title">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <Reveal>
                <p className="eyebrow">Keep reading</p>
                <h2
                  id="related-title"
                  className="mt-4 text-[length:var(--text-display-md)] font-bold leading-tight"
                >
                  Related guides
                </h2>
              </Reveal>
              <Reveal delay={0.08}>
                <Link href="/blogs" className="btn btn-outline btn-sm">
                  All articles
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Reveal>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.08} className="h-full">
                  <PostCard post={p} className="h-full" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABand className="border-t border-cream-100/8" />
    </>
  );
}
