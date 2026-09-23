import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/** Shared chrome for the policy pages: breadcrumb, title bar, prose column. */
export function LegalShell({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="relative overflow-hidden border-b border-cream-100/8">
        <div className="grid-lines absolute inset-0 mask-fade-b opacity-30" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(180,122,23,0.14),transparent_55%)]"
          aria-hidden
        />

        <div className="container-x relative py-12 lg:py-16">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-cream-500">
              <li>
                <Link href="/" className="transition-colors hover:text-gold-300">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li className="text-cream-300">{title}</li>
            </ol>
          </nav>

          <h1 className="mt-6 text-[length:var(--text-display-lg)] font-bold leading-[1.05] tracking-[-0.03em]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-300">{intro}</p>
          <p className="mt-4 text-sm text-cream-500">Last updated: {updated}</p>
        </div>
      </header>

      <div className="container-x py-12 lg:py-16">
        <div className="prose-pfc max-w-3xl">{children}</div>
      </div>
    </>
  );
}
