import Link from "next/link";
import { ArrowRight, Home, Search } from "lucide-react";

import { PostCard } from "@/components/site/PostCard";
import { getFeaturedPosts } from "@/lib/posts";
import { nav } from "@/lib/site";
import { SiteFrame } from "@/components/site/SiteFrame";

/**
 * 404.
 *
 * A replatform from WordPress will always produce some dead links from old
 * indexed URLs, so this page treats a miss as a routing opportunity rather than
 * a dead end: search, the main sections, and the articles most people want.
 */
export default async function NotFound() {
  const posts = await getFeaturedPosts(3);

  return (
    <SiteFrame>
      <section className="relative overflow-hidden">
        <div className="grid-lines absolute inset-0 mask-fade-b opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(234,85,43,0.14),transparent_55%)]"
          aria-hidden
        />

        <div className="container-x relative py-20 text-center lg:py-28">
          <p className="font-display text-[clamp(4rem,18vw,10rem)] font-bold leading-none text-gradient-gold">
            404
          </p>

          <h1 className="mt-4 text-[length:var(--text-display-md)] font-bold leading-tight">
            That page has moved on.
          </h1>

          <p className="mx-auto mt-5 max-w-lg leading-relaxed text-cream-400">
            The link may be from our older site. Everything we have written is still here —
            search for it, or start from one of the sections below.
          </p>

          <form action="/blogs" method="get" role="search" className="mx-auto mt-9 max-w-md">
            <label htmlFor="notfound-search" className="sr-only">
              Search articles
            </label>
            <div className="flex items-center gap-2 rounded-full border border-cream-100/12 bg-ink-800/70 p-1.5 pl-4 transition-colors focus-within:border-gold-400/60">
              <Search className="h-4 w-4 shrink-0 text-cream-500" aria-hidden />
              <input
                id="notfound-search"
                type="search"
                name="q"
                placeholder="Search commissions, ranking, ads…"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-cream-100 placeholder:text-cream-500 focus:outline-none"
              />
              <button type="submit" className="btn btn-gold btn-sm">
                Search
              </button>
            </div>
          </form>

          <nav aria-label="Main sections" className="mt-9">
            <ul className="flex flex-wrap items-center justify-center gap-2.5">
              <li>
                <Link href="/" className="btn btn-outline btn-sm">
                  <Home className="h-4 w-4" aria-hidden />
                  Home
                </Link>
              </li>
              {nav
                .filter((item) => item.href !== "/")
                .map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="btn btn-outline btn-sm">
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        </div>
      </section>

      <section className="section-tight border-t border-cream-100/8" aria-labelledby="nf-popular">
        <div className="container-x">
          <h2 id="nf-popular" className="font-display text-xl font-bold text-cream-50">
            Most-read guides
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} className="h-full" />
            ))}
          </div>

          <Link href="/blogs" className="btn btn-gold mt-10">
            Browse all articles
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </SiteFrame>
  );
}
