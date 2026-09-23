"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { nav, contact } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Condense the bar once the page has moved — keeps the hero uncluttered.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll behind the mobile drawer.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold-300 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-ink-900"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-cream-100/8 bg-ink-900/85 py-2.5 backdrop-blur-xl"
            : "border-b border-transparent py-4",
        )}
      >
        <div className="container-x flex items-center justify-between gap-6">
          <Link href="/" aria-label={`${"Plateful Consulting"} home`} className="shrink-0">
            <Logo className={cn("transition-all duration-500", scrolled ? "h-9" : "h-10 md:h-11")} />
          </Link>

          {/* --- Desktop nav --- */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                      isActive(item.href)
                        ? "text-gold-300"
                        : "text-cream-300 hover:text-cream-50",
                    )}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={contact.primaryPhone.href}
              className="hidden items-center gap-2 text-sm font-medium text-cream-300 transition-colors hover:text-gold-300 xl:flex"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {contact.primaryPhone.label}
            </a>

            <ThemeToggle />

            <Link href="/contact-us" className="btn btn-primary btn-sm hidden sm:inline-flex">
              Get Started
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-10 w-10 place-items-center rounded-full border border-cream-100/15 text-cream-100 transition-colors hover:border-gold-400/50 hover:text-gold-300 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* --- Mobile drawer --- */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-0 z-40 lg:hidden"
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" />
        <nav
          aria-label="Mobile"
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 top-0 border-b border-cream-100/10 bg-ink-850 px-6 pb-8 pt-24 shadow-warm-lg"
        >
          <ul className="space-y-1">
            {nav.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{ transitionDelay: `${i * 40}ms` }}
                  className={cn(
                    "block rounded-xl px-4 py-3.5 font-display text-lg font-semibold transition-colors",
                    isActive(item.href)
                      ? "bg-gold-500/12 text-gold-300"
                      : "text-cream-200 hover:bg-cream-100/5",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3 border-t border-cream-100/10 pt-6">
            <Link href="/contact-us" className="btn btn-primary w-full">
              Book a growth audit
            </Link>
            <a href={contact.primaryPhone.href} className="btn btn-outline w-full">
              <Phone className="h-4 w-4" aria-hidden />
              {contact.primaryPhone.label}
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
