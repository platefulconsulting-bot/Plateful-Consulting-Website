import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { FileText, Inbox, Mail, LogOut, ExternalLink, PlusCircle } from "lucide-react";

import { getSession } from "@/lib/auth";
import { logoutAction } from "./actions";
import { Logo } from "@/components/site/Logo";

export const metadata: Metadata = {
  title: { default: "Studio", template: "%s | Plateful Studio" },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Studio shell.
 *
 * The login screen lives at /studio/login and is the only route here without a
 * session, so the sidebar is rendered only once there is one. Access itself is
 * enforced in middleware, before any of this runs.
 */
export default async function StudioLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    return <div className="min-h-dvh bg-ink-950">{children}</div>;
  }

  const links = [
    { href: "/studio", label: "Articles", icon: FileText },
    { href: "/studio/enquiries", label: "Enquiries", icon: Inbox },
    { href: "/studio/subscribers", label: "Subscribers", icon: Mail },
  ];

  return (
    <div className="min-h-dvh bg-ink-950 lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar */}
      <aside className="border-b border-cream-100/8 bg-ink-900 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col p-5">
          <Link href="/studio" className="block">
            <Logo className="h-9" />
          </Link>

          <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream-500">
            Blog studio
          </p>

          <Link href="/studio/posts/new" className="btn btn-gold btn-sm mt-3 w-full">
            <PlusCircle className="h-4 w-4" aria-hidden />
            New article
          </Link>

          <nav aria-label="Studio" className="mt-6 flex-1">
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-cream-300 transition-colors hover:bg-cream-100/6 hover:text-gold-300"
                  >
                    <link.icon className="h-4 w-4" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/blogs"
                  target="_blank"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-cream-300 transition-colors hover:bg-cream-100/6 hover:text-gold-300"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  View live blog
                </Link>
              </li>
            </ul>
          </nav>

          <div className="mt-6 border-t border-cream-100/8 pt-4">
            <p className="truncate text-sm font-medium text-cream-100">{session.name}</p>
            <p className="truncate text-xs text-cream-500">{session.email}</p>

            <form action={logoutAction} className="mt-3">
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-cream-400 transition-colors hover:bg-ember-500/10 hover:text-ember-300"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
