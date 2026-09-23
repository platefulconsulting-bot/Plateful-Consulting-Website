import Link from "next/link";
import { ExternalLink, PencilLine, PlusCircle, Search } from "lucide-react";

import { db } from "@/lib/db";
import { formatDate, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudioHome({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const query = q?.trim();

  const where = {
    ...(status === "draft" || status === "published" ? { status } : {}),
    ...(query ? { title: { contains: query } } : {}),
  };

  const [posts, counts, enquiryCount, subscriberCount] = await Promise.all([
    db.post.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        featured: true,
        views: true,
        publishedAt: true,
        updatedAt: true,
        readingMinutes: true,
        category: { select: { name: true, accent: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
    db.post.groupBy({ by: ["status"], _count: { _all: true } }),
    db.enquiry.count({ where: { handled: false } }),
    db.subscriber.count(),
  ]);

  const published = counts.find((c) => c.status === "published")?._count._all ?? 0;
  const drafts = counts.find((c) => c.status === "draft")?._count._all ?? 0;

  const tabs = [
    { key: undefined, label: "All", count: published + drafts },
    { key: "published", label: "Published", count: published },
    { key: "draft", label: "Drafts", count: drafts },
  ];

  return (
    <div className="p-6 lg:p-10">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-50">Articles</h1>
          <p className="mt-1.5 text-sm text-cream-400">
            {published} published · {drafts} draft{drafts === 1 ? "" : "s"} ·{" "}
            <Link href="/studio/enquiries" className="text-gold-400 hover:text-gold-300">
              {enquiryCount} new enquir{enquiryCount === 1 ? "y" : "ies"}
            </Link>{" "}
            ·{" "}
            <Link href="/studio/subscribers" className="text-gold-400 hover:text-gold-300">
              {subscriberCount} subscriber{subscriberCount === 1 ? "" : "s"}
            </Link>
          </p>
        </div>

        <Link href="/studio/posts/new" className="btn btn-gold">
          <PlusCircle className="h-4 w-4" aria-hidden />
          New article
        </Link>
      </header>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.key ? `/studio?status=${tab.key}` : "/studio"}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                (status ?? undefined) === tab.key
                  ? "border-gold-400/50 bg-gold-500/12 text-gold-300"
                  : "border-cream-100/12 text-cream-300 hover:border-gold-400/40 hover:text-gold-300",
              )}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-60">{tab.count}</span>
            </Link>
          ))}
        </div>

        <form action="/studio" method="get" role="search" className="w-full sm:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="studio-search" className="sr-only">
            Search articles
          </label>
          <div className="flex items-center gap-2 rounded-full border border-cream-100/12 bg-ink-800/70 px-4 py-2 focus-within:border-gold-400/60">
            <Search className="h-4 w-4 shrink-0 text-cream-500" aria-hidden />
            <input
              id="studio-search"
              type="search"
              name="q"
              defaultValue={query ?? ""}
              placeholder="Search titles…"
              className="min-w-0 flex-1 bg-transparent text-sm text-cream-100 placeholder:text-cream-500 focus:outline-none"
            />
          </div>
        </form>
      </div>

      {/* List */}
      <div className="card mt-6 overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-lg font-semibold text-cream-50">No articles here.</p>
            <p className="mt-2 text-sm text-cream-400">
              {query ? "Nothing matched that search." : "Write your first one."}
            </p>
            <Link href="/studio/posts/new" className="btn btn-gold mt-6">
              New article
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-cream-100/8">
            {posts.map((post) => (
              <li key={post.id}>
                <div className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-cream-100/3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider",
                          post.status === "published"
                            ? "bg-basil-500/20 text-basil-400"
                            : "bg-saffron-400/15 text-saffron-400",
                        )}
                      >
                        {post.status}
                      </span>

                      {post.featured && (
                        <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-gold-300">
                          Featured
                        </span>
                      )}

                      {post.category && (
                        <span
                          className="text-xs font-medium"
                          style={{ color: post.category.accent }}
                        >
                          {post.category.name}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/studio/posts/${post.id}`}
                      className="mt-1.5 block font-display text-base font-semibold text-cream-50 transition-colors hover:text-gold-300"
                    >
                      {post.title}
                    </Link>

                    <p className="mt-1 truncate text-xs text-cream-500">
                      /{post.slug} · {post.readingMinutes} min ·{" "}
                      {post.publishedAt
                        ? `published ${formatDate(post.publishedAt)}`
                        : "not published"}{" "}
                      · edited {formatDate(post.updatedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.status === "published" && (
                      <Link
                        href={`/${post.slug}`}
                        target="_blank"
                        aria-label={`View ${post.title} on the site`}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-cream-100/12 text-cream-400 transition-colors hover:border-gold-400/50 hover:text-gold-300"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </Link>
                    )}
                    <Link
                      href={`/studio/posts/${post.id}`}
                      aria-label={`Edit ${post.title}`}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-cream-100/12 text-cream-400 transition-colors hover:border-gold-400/50 hover:text-gold-300"
                    >
                      <PencilLine className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
