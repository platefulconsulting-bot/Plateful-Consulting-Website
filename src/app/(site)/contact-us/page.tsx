import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail, Phone, MapPin, Clock, Instagram, Youtube, MessageCircle } from "lucide-react";

import { LazyScene } from "@/components/three/LazyScene";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/site/ContactForm";
import { contact, faqs, site } from "@/lib/site";
import { jsonLd, breadcrumbSchema, faqSchema, organizationSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Us — Book a Swiggy & Zomato Growth Audit",
  description:
    "Talk to Plateful Consulting about growing your restaurant's Swiggy and Zomato sales. Call +91 81300 32195, email info@platefulconsulting.com, or request a growth audit.",
  alternates: { canonical: "/contact-us" },
  openGraph: {
    title: "Contact Plateful Consulting",
    description: "Book a Swiggy & Zomato growth audit for your restaurant.",
    url: "/contact-us",
  },
};

export default function ContactPage() {
  const schema = jsonLd(
    organizationSchema(),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Contact Us", path: "/contact-us" },
    ]),
    faqSchema(),
  );

  const channels = [
    {
      icon: Phone,
      label: "Call us",
      items: contact.phones.map((p) => ({ label: p.label, href: p.href })),
    },
    {
      icon: Mail,
      label: "Email us",
      items: contact.emails.map((e) => ({ label: e.label, href: e.href })),
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      items: [{ label: "Message us directly", href: contact.whatsapp }],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ================= HERO + FORM ================= */}
      <section className="relative overflow-hidden" aria-labelledby="contact-hero">
        <div className="grid-lines absolute inset-0 mask-fade-b opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(234,85,43,0.15),transparent_55%)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute -right-40 top-20 hidden h-[36rem] w-[36rem] opacity-50 xl:block">
          <LazyScene name="signal-orb" maxDpr={1.3} />
        </div>

        <div className="container-x relative grid gap-12 pb-16 pt-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:pb-24 lg:pt-20">
          {/* Left: pitch + channels */}
          <div>
            <Reveal immediate>
              <p className="eyebrow">Contact us</p>
            </Reveal>

            <Reveal immediate delay={0.05}>
              <h1
                id="contact-hero"
                className="mt-6 text-[length:var(--text-display-xl)] font-bold leading-[1.0] tracking-[-0.03em]"
              >
                Let&rsquo;s look at your{" "}
                <span className="text-gradient-gold">actual numbers.</span>
              </h1>
            </Reveal>

            <Reveal immediate delay={0.1}>
              <p className="mt-7 max-w-lg text-lg leading-relaxed text-cream-300">
                Tell us your city, cuisine and roughly where you are today. We will come
                back with what we would look at first — whether or not you end up working
                with us.
              </p>
            </Reveal>

            <div className="mt-10 space-y-4">
              {channels.map((channel, i) => (
                <Reveal key={channel.label} immediate delay={0.16 + i * 0.05}>
                  <div className="card flex items-start gap-4 p-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-500/12 text-gold-300">
                      <channel.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-500">
                        {channel.label}
                      </p>
                      <ul className="mt-1.5 space-y-0.5">
                        {channel.items.map((item) => (
                          <li key={item.href}>
                            <a
                              href={item.href}
                              target={item.href.startsWith("http") ? "_blank" : undefined}
                              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="break-words font-medium text-cream-100 transition-colors hover:text-gold-300"
                            >
                              {item.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal immediate delay={0.32}>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                  <address className="text-sm not-italic leading-relaxed text-cream-400">
                    <span className="mb-1 block font-semibold text-cream-100">Office</span>
                    {contact.address.line1},<br />
                    {contact.address.line2},<br />
                    {contact.address.city} – {contact.address.postalCode}
                    <a
                      href={contact.maps.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block w-fit font-semibold text-gold-300 transition-colors hover:text-gold-200"
                    >
                      Get directions
                    </a>
                  </address>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" aria-hidden />
                  <p className="text-sm leading-relaxed text-cream-400">
                    <span className="mb-1 block font-semibold text-cream-100">Hours</span>
                    {contact.hours}
                  </p>
                </div>
              </div>

              <ul className="mt-8 flex items-center gap-3">
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
            </Reveal>
          </div>

          {/* Right: form */}
          <Reveal immediate delay={0.1}>
            <div className="card card-sheen p-7 md:p-9">
              <h2 className="font-display text-xl font-bold text-cream-50">
                Request a growth audit
              </h2>
              <p className="mt-2 text-sm text-cream-400">
                Takes a minute. No obligation, no retainer required.
              </p>

              <div className="mt-7">
                <Suspense
                  fallback={<div className="h-96 animate-pulse rounded-xl bg-ink-800/60" />}
                >
                  <ContactForm />
                </Suspense>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= MAP ================= */}
      <section className="border-y border-cream-100/8" aria-label="Office location">
        <div className="relative h-[22rem] w-full bg-ink-850">
          <iframe
            title={`${site.name} office location`}
            src={contact.maps.embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            // Google Maps only ships a light tile set, so it is inverted for the
            // dark theme and left alone on paper.
            className="absolute inset-0 h-full w-full grayscale-[0.25] contrast-[1.05] dark:[filter:invert(0.9)_hue-rotate(180deg)_grayscale(0.3)]"
          />
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="section" aria-labelledby="faq-title">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">Before you write</p>
              <h2
                id="faq-title"
                className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
              >
                Questions we get asked first.
              </h2>
              <p className="mt-6 leading-relaxed text-cream-400">
                If yours is not here, put it in the message field — we would rather answer
                it directly than have you guess.
              </p>
            </Reveal>

            <div className="divide-y divide-cream-100/8">
              {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 0.05}>
                  <details className="group py-5" name="contact-faq">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-lg font-semibold text-cream-50 transition-colors hover:text-gold-300 [&::-webkit-details-marker]:hidden">
                      {faq.q}
                      <span
                        aria-hidden
                        className="mt-1.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-cream-100/20 text-gold-400 transition-transform duration-300 group-open:rotate-45"
                      >
                        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 1v10M1 6h10" strokeLinecap="round" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-4 max-w-2xl leading-relaxed text-cream-400">{faq.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
