import type { Metadata } from "next";
import Link from "next/link";
import { Search, ArrowLeft, ArrowRight, X } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { PostCard } from "@/components/site/PostCard";
import { CTABand } from "@/components/site/CTABand";
import { LazyScene } from "@/components/three/LazyScene";
import { getPosts, getCategoriesWithCounts, getFeaturedPosts, POSTS_PER_PAGE } from "@/lib/posts";
import { jsonLd, breadcrumbSchema } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blogs — Swiggy & Zomato Growth Guides for Restaurants",
  description:
    "In-depth guides on Swiggy and Zomato ranking, commissions, menu optimisation, ads and ratings — written from inside real restaurant partner dashboards.",
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "Plateful Consulting — Restaurant growth guides",
    description: "How the platforms actually rank, price and charge you.",
    url: "/blogs",
  },
};

type SearchParams = Promise<{ page?: string; category?: string; tag?: string; q?: string }>;

export default async function BlogsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const category = params.category?.trim() || undefined;
  const tag = params.tag?.trim() || undefined;
  const query = params.q?.trim() || undefined;

  const [{ posts, total, totalPages }, categories, featured] = await Promise.all([
    getPosts({ page, perPage: POSTS_PER_PAGE, category, tag, query }),
    getCategoriesWithCounts(),
    // The hero slot is only for the unfiltered first page.
    page === 1 && !category && !tag && !query ? getFeaturedPosts(1) : Promise.resolve([]),
  ]);

  const hero = featured[0];
  // Avoid showing the hero article twice in the same view.
  const gridPosts = hero ? posts.filter((p) => p.id !== hero.id) : posts;

  const activeCategory = categories.find((c) => c.slug === category);
  const isFiltered = Boolean(category || tag || query);

  /**
   * Builds a filter URL, carrying the current filters forward unless a key is
   * explicitly present in `next` (passing `undefined` for a key clears it).
   * `page=1` is omitted so the first page has one canonical URL.
   */
  const buildHref = (next: { category?: string; tag?: string; q?: string; page?: number }) => {
    const sp = new URLSearchParams();
    const nextCategory = "category" in next ? next.category : category;
    const nextTag = "tag" in next ? next.tag : tag;
    const nextQuery = "q" in next ? next.q : query;
    const nextPage = "page" in next ? next.page : undefined;

    if (nextCategory) sp.set("category", nextCategory);
    if (nextTag) sp.set("tag", nextTag);
    if (nextQuery) sp.set("q", nextQuery);
    if (nextPage && nextPage > 1) sp.set("page", String(nextPage));

    const qs = sp.toString();
    return qs ? `/blogs?${qs}` : "/blogs";
  };

  const schema = jsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blogs", path: "/blogs" },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ================= HEADER ================= */}
      <section className="relative overflow-hidden border-b border-cream-100/8" aria-labelledby="blogs-title">
        <div className="grid-lines absolute inset-0 mask-fade-b opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(180,122,23,0.18),transparent_55%)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute -right-32 -top-20 hidden h-[30rem] w-[30rem] opacity-45 lg:block">
          <LazyScene name="reach-network" maxDpr={1.25} />
        </div>

        <div className="container-x relative py-14 lg:py-20">
          <Reveal immediate className="max-w-3xl">
            <p className="eyebrow">Insights</p>
            <h1
              id="blogs-title"
              className="mt-6 text-[length:var(--text-display-xl)] font-bold leading-[1.0] tracking-[-0.03em]"
            >
              The Swiggy &amp; Zomato{" "}
              <span className="text-gradient-gold">playbook</span>, published.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-cream-300">
              Ranking signals, commission structures, menu engineering, ad budgets and
              rating recovery — written from inside real partner dashboards, and updated as
              the platforms change.
            </p>
          </Reveal>

          {/* Search — a plain GET form, so it works without JavaScript. */}
          <Reveal immediate delay={0.08}>
            <form action="/blogs" method="get" role="search" className="mt-9 max-w-md">
              {category && <input type="hidden" name="category" value={category} />}
              <label htmlFor="blog-search" className="sr-only">
                Search articles
              </label>
              <div className="flex items-center gap-2 rounded-full border border-cream-100/12 bg-ink-800/70 p-1.5 pl-4 transition-colors focus-within:border-gold-400/60">
                <Search className="h-4 w-4 shrink-0 text-cream-500" aria-hidden />
                <input
                  id="blog-search"
                  type="search"
                  name="q"
                  defaultValue={query ?? ""}
                  placeholder="Search commissions, ranking, ads…"
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm text-cream-100 placeholder:text-cream-500 focus:outline-none"
                />
                <button type="submit" className="btn btn-gold btn-sm">
                  Search
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>

      {/* ================= FILTERS ================= */}
      <section className="sticky top-[4.25rem] z-30 border-b border-cream-100/8 bg-ink-900/90 py-4 backdrop-blur-xl" aria-label="Filter articles">
        <div className="container-x">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href={buildHref({ category: undefined, page: undefined })}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                !category
                  ? "border-gold-400/50 bg-gold-500/12 text-gold-300"
                  : "border-cream-100/12 text-cream-300 hover:border-gold-400/40 hover:text-gold-300",
              )}
            >
              All articles
            </Link>

            {categories.map((c) => (
              <Link
                key={c.slug}
                href={buildHref({ category: c.slug, page: undefined })}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  category === c.slug
                    ? "text-ink-900"
                    : "border-cream-100/12 text-cream-300 hover:border-gold-400/40 hover:text-gold-300",
                )}
                style={
                  category === c.slug
                    ? { backgroundColor: c.accent, borderColor: c.accent }
                    : undefined
                }
              >
                {c.name}
                <span className="ml-2 text-xs opacity-60">{c._count.posts}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= RESULTS ================= */}
      <section className="section-tight" aria-live="polite">
        <div className="container-x">
          {/* Context line for a filtered view */}
          {isFiltered && (
            <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-cream-50">
                  {query ? (
                    <>
                      {total} result{total === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
                    </>
                  ) : activeCategory ? (
                    activeCategory.name
                  ) : (
                    `Tagged “${tag}”`
                  )}
                </h2>
                {activeCategory && !query && (
                  <p className="mt-1.5 max-w-2xl text-sm text-cream-400">
                    {activeCategory.description}
                  </p>
                )}
              </div>

              <Link href="/blogs" className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-400 hover:text-gold-300">
                <X className="h-4 w-4" aria-hidden />
                Clear filters
              </Link>
            </div>
          )}

          {/* Featured hero article */}
          {hero && (
            <Reveal className="mb-10">
              <PostCard post={hero} variant="featured" priority />
            </Reveal>
          )}

          {gridPosts.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="font-display text-xl font-semibold text-cream-50">
                Nothing matched that.
              </p>
              <p className="mx-auto mt-3 max-w-md text-cream-400">
                Try a broader term — &ldquo;commission&rdquo;, &ldquo;ranking&rdquo;,
                &ldquo;menu&rdquo; or &ldquo;ads&rdquo; — or browse everything we have
                written.
              </p>
              <Link href="/blogs" className="btn btn-gold mt-7">
                Browse all articles
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post, i) => (
                <Reveal key={post.id} delay={(i % 3) * 0.07} className="h-full">
                  <PostCard post={post} className="h-full" />
                </Reveal>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-14 flex items-center justify-between gap-4" aria-label="Pagination">
              {page > 1 ? (
                <Link href={buildHref({ page: page - 1 })} className="btn btn-outline">
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Previous
                </Link>
              ) : (
                <span />
              )}

              <p className="text-sm text-cream-500">
                Page <span className="text-cream-100">{page}</span> of {totalPages}
              </p>

              {page < totalPages ? (
                <Link href={buildHref({ page: page + 1 })} className="btn btn-outline">
                  Next
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </section>

      <CTABand
        className="border-t border-cream-100/8"
        eyebrow="Stop reading, start fixing"
        title="Want this analysis run on your own listing?"
        body="Everything in these articles is the method we apply in an engagement. Send us your outlet and we will run it against your live numbers."
      />
    </>
  );
}
