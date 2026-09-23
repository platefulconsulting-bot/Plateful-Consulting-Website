import Link from "next/link";
import { Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { site, contact, services, cities } from "@/lib/site";
import { getLatestPosts } from "@/lib/posts";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";

/**
 * Footer.
 *
 * Doubles as the site's internal-linking hub: services, the most recent
 * articles and the city pages all get a crawlable link from every page, which
 * is how link equity reaches the deeper content.
 */
export async function Footer() {
  const recent = await getLatestPosts(4);
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-px border-t border-cream-100/8 bg-ink-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <div className="container-x py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* --- Brand --- */}
          {/* 3 columns, not 4: the contact block needs the fourth to keep the
              email address on one line. The newsletter pill and the blurb both
              hold up at this width. */}
          <div className="lg:col-span-3">
            <Logo className="h-12" showTagline />

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream-400">
              {site.name} is a specialist Swiggy and Zomato sales consulting firm helping
              restaurants build consistent, high-margin revenue on aggregator platforms.
            </p>

            <p className="accent-serif mt-4 text-lg text-gold-300">&ldquo;{site.tagline}&rdquo;</p>

            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream-500">
                Growth notes, twice a month
              </p>
              <NewsletterForm className="mt-3 max-w-sm" source="footer" />
            </div>

            <ul className="mt-7 flex items-center gap-3">
              {contact.socials.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${site.name} on ${s.name}`}
                    className="grid h-10 w-10 place-items-center rounded-full border border-cream-100/12 text-cream-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/60 hover:text-gold-300"
                  >
                    {s.name === "Instagram" ? (
                      <Instagram className="h-5 w-5" aria-hidden />
                    ) : (
                      <Youtube className="h-5 w-5" aria-hidden />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Services --- */}
          <nav aria-label="Services" className="lg:col-span-2">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-cream-50">
              Services
            </h2>
            <ul className="mt-5 space-y-2.5">
              {services.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services#${s.slug}`}
                    className="text-sm text-cream-400 transition-colors hover:text-gold-300"
                  >
                    {s.shortName}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-sm font-medium text-gold-400 hover:text-gold-300">
                  All services →
                </Link>
              </li>
            </ul>
          </nav>

          {/* --- Company --- */}
          <nav aria-label="Company" className="lg:col-span-2">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-cream-50">
              Company
            </h2>
            <ul className="mt-5 space-y-2.5">
              {[
                { label: "About Us", href: "/about-us" },
                { label: "Blogs", href: "/blogs" },
                { label: "Contact Us", href: "/contact-us" },
                { label: "Terms & Conditions", href: "/terms-and-condition" },
                { label: "Privacy Policy", href: "/privacy-policy" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream-400 transition-colors hover:text-gold-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* --- Latest writing --- */}
          <nav aria-label="Latest articles" className="lg:col-span-2">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-cream-50">
              Latest reads
            </h2>
            <ul className="mt-5 space-y-3">
              {recent.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}`}
                    className="line-clamp-2 text-sm leading-snug text-cream-400 transition-colors hover:text-gold-300"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* --- Contact --- */}
          <div className="lg:col-span-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-cream-50">
              Get in touch
            </h2>
            <ul className="mt-5 space-y-3.5 text-sm">
              {contact.phones.map((p) => (
                <li key={p.href}>
                  <a
                    href={p.href}
                    className="flex items-start gap-2.5 text-cream-400 transition-colors hover:text-gold-300"
                  >
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                    {p.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={contact.primaryEmail.href}
                  className="flex items-start gap-2.5 break-words text-cream-400 transition-colors hover:text-gold-300"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                  {contact.primaryEmail.label}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-cream-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                <address className="not-italic leading-relaxed">
                  {contact.address.line1},<br />
                  {contact.address.line2},<br />
                  {contact.address.city} – {contact.address.postalCode}
                </address>
              </li>
            </ul>
          </div>
        </div>

        {/* --- Cities served --- */}
        <div className="mt-14 border-t border-cream-100/8 pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream-500">
            Serving restaurants across
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cream-400">
            {cities.join(" · ")}
          </p>
        </div>

        {/* --- Legal --- */}
        <div className="mt-8 flex flex-col gap-4 border-t border-cream-100/8 pt-8 text-xs text-cream-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p>
            Swiggy and Zomato are trademarks of their respective owners. {site.name} is an
            independent consultancy and is not affiliated with either platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
