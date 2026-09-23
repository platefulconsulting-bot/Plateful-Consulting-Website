import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";
import type { PostCard as PostCardData } from "@/lib/posts";
import { PostCover } from "@/components/ui/PostCover";
import { formatDate, isoDate, cn } from "@/lib/utils";

export function PostCard({
  post,
  priority = false,
  variant = "default",
  className,
}: {
  post: PostCardData;
  priority?: boolean;
  variant?: "default" | "featured" | "compact";
  className?: string;
}) {
  const accent = post.category?.accent ?? "#B47A17";
  const href = `/${post.slug}`;

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-cream-100/4",
          className,
        )}
      >
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
          {post.coverImage ? (
            <Image src={post.coverImage} alt={post.coverAlt ?? ""} fill className="object-cover" sizes="80px" />
          ) : (
            <PostCover slug={post.slug} accent={accent} className="h-full w-full" compact />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-cream-100 transition-colors group-hover:text-gold-300">
            {post.title}
          </h3>
          <p className="mt-1.5 text-xs text-cream-500">{post.readingMinutes} min read</p>
        </div>
      </Link>
    );
  }

  const featured = variant === "featured";

  return (
    <article
      className={cn(
        "card card-hover card-sheen group overflow-hidden",
        featured && "lg:grid lg:grid-cols-2",
        className,
      )}
    >
      {/* Not a link itself — the stretched title link below covers the whole
          card, so wrapping this too would duplicate the destination for screen
          readers and keyboard users. */}
      <div className={cn(featured && "lg:h-full")}>
        <div
          className={cn(
            "relative overflow-hidden",
            featured ? "aspect-[16/10] lg:h-full lg:aspect-auto" : "aspect-[16/9]",
          )}
        >
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.coverAlt ?? ""}
              fill
              priority={priority}
              sizes={featured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <PostCover
              slug={post.slug}
              accent={accent}
              className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]"
            />
          )}

          {post.category && (
            <span
              className="absolute left-4 top-4 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider backdrop-blur-md"
              style={{
                backgroundColor: `${accent}22`,
                color: accent,
                border: `1px solid ${accent}55`,
              }}
            >
              {post.category.name}
            </span>
          )}
        </div>
      </div>

      <div className={cn("flex flex-col p-6", featured && "lg:justify-center lg:p-9")}>
        <div className="flex items-center gap-3 text-xs text-cream-500">
          {post.publishedAt && (
            <time dateTime={isoDate(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
          )}
          <span aria-hidden className="h-1 w-1 rounded-full bg-cream-500/50" />
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {post.readingMinutes} min
          </span>
        </div>

        <h3
          id={`post-${post.id}`}
          className={cn(
            "mt-3 font-display font-semibold leading-snug text-cream-50 transition-colors group-hover:text-gold-300",
            featured ? "text-2xl lg:text-3xl" : "text-lg",
          )}
        >
          <Link href={href} className="after:absolute after:inset-0 focus:outline-none">
            {post.title}
          </Link>
        </h3>

        <p
          className={cn(
            "mt-3 text-sm leading-relaxed text-cream-400",
            featured ? "line-clamp-4" : "line-clamp-3",
          )}
        >
          {post.excerpt}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">
          {post.author && (
            <span className="text-xs text-cream-500">
              By <span className="text-cream-300">{post.author.name}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 transition-transform duration-300 group-hover:translate-x-0.5">
            Read
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}
