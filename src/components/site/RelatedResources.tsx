import Link from "next/link";
import { ArrowUpRight, BarChart3, Briefcase, Calculator, ClipboardCheck, type LucideIcon } from "lucide-react";

import { relatedLinks, type RelatedLinkKind, type RelatedLinksInput } from "@/lib/related-links";
import { cn } from "@/lib/utils";

const ICONS: Record<RelatedLinkKind, LucideIcon> = {
  service: Briefcase,
  tool: Calculator,
  "case-study": BarChart3,
  results: BarChart3,
  audit: ClipboardCheck,
};

/**
 * "Keep going" block at the foot of a blog post: one service, one free tool
 * and one client result matched to the post's topic and city (see
 * `relatedLinks`). On case-study posts it links to all results and the free
 * audit instead. Server-rendered, no client JS.
 */
export function RelatedResources({
  post,
  className,
}: {
  post: RelatedLinksInput;
  className?: string;
}) {
  const { variant, links } = relatedLinks(post);

  return (
    <section className={cn("section-tight border-t border-cream-100/8", className)} aria-labelledby="keep-going-title">
      <div className="container-x">
        <p className="eyebrow">Keep going</p>
        <h2
          id="keep-going-title"
          className="mt-4 text-balance font-display text-[length:var(--text-display-md)] font-bold leading-tight tracking-[-0.025em] text-cream-50"
        >
          {variant === "case-study" ? "More results, or a look at your outlet" : "Related tools and results"}
        </h2>

        <ul className={cn("mt-10 grid gap-6 md:grid-cols-2", variant === "full" && "lg:grid-cols-3")}>
          {links.map((l) => {
            const Icon = ICONS[l.kind];
            return (
              <li key={l.href} className="h-full">
                <Link
                  href={l.href}
                  className="card card-sheen group flex h-full flex-col p-7 transition-colors hover:border-gold-400/40 md:p-8"
                >
                  <span className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
                    <Icon className="h-4 w-4" aria-hidden />
                    {l.eyebrow}
                  </span>
                  {l.chip && <span className="chip mt-5 self-start">{l.chip}</span>}
                  <span className="mt-4 text-balance font-display text-lg font-bold leading-tight tracking-[-0.025em] text-cream-50">
                    {l.title}
                  </span>
                  <span className="mt-3 text-sm leading-relaxed text-cream-400">{l.body}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-gold-400 transition-colors group-hover:text-gold-300">
                    {l.cta}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
