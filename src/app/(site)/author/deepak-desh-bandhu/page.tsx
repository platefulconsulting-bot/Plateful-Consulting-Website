import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Phone } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { PostCard } from "@/components/site/PostCard";
import { CTABand } from "@/components/site/CTABand";
import { getPostsByAuthor } from "@/lib/posts";
import { authorProfiles, contact, site, topicHubs } from "@/lib/site";
import { jsonLd, breadcrumbSchema, personSchema, profilePageSchema } from "@/lib/seo";
import { metaDescription, ogImageUrl, seoTitle } from "@/lib/utils";

export const revalidate = 3600;

const author = authorProfiles["deepak-desh-bandhu"];
const path = `/author/${author.slug}`;

export const metadata: Metadata = {
  title: { absolute: seoTitle(`${author.name}, Swiggy & Zomato Consultant`) },
  description: metaDescription(author.metaDescription),
  alternates: { canonical: path },
  openGraph: {
    type: "profile",
    title: `${author.name} — ${author.role}, ${site.name}`,
    description: metaDescription(author.metaDescription),
    url: path,
    images: [{ url: ogImageUrl(author.name, author.role), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${author.name} — ${author.role}`,
    description: metaDescription(author.metaDescription),
    images: [ogImageUrl(author.name, author.role)],
  },
};

const initials = author.name
  .split(" ")
  .slice(0, 2)
  .map((w) => w[0])
  .join("");

export default async function AuthorPage() {
  const posts = await getPostsByAuthor(author.slug);

  const schema = jsonLd(
    profilePageSchema(author),
    personSchema({
      slug: author.slug,
      name: author.name,
      jobTitle: author.role,
      description: author.summary,
      knowsAbout: author.knowsAbout,
      sameAs: [author.linkedin],
    }),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about-us" },
      { name: author.name, path },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ================= HEADER ================= */}
      <header className="relative overflow-hidden border-b border-cream-100/8">
        <div className="grid-lines absolute inset-0 mask-fade-b opacity-30" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_0%,rgba(180,122,23,0.18),transparent_55%)]"
          aria-hidden
        />

        <div className="container-x relative py-12 lg:py-16">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-cream-500">
              <li>
                <Link href="/" className="transition-colors hover:text-gold-300">
                  Home
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li>
                <Link href="/about-us" className="transition-colors hover:text-gold-300">
                  About Us
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li aria-current="page" className="text-cream-300">
                {author.name}
              </li>
            </ol>
          </nav>

          <div className="mt-9 flex flex-col gap-8 md:flex-row md:items-center md:gap-10">
            {/* No photograph yet: a monogram in the brand palette stands in. */}
            <Reveal immediate>
              <span
                role="img"
                aria-label={`${author.name} monogram`}
                className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl border border-gold-400/25 bg-gradient-to-br from-gold-300/30 to-ember-500/20 font-display text-4xl font-bold text-gold-300 shadow-[0_20px_60px_-20px_rgba(180,122,23,0.45)] md:h-36 md:w-36 md:text-5xl"
              >
                {initials}
              </span>
            </Reveal>

            <Reveal immediate delay={0.05} className="max-w-3xl">
              <p className="eyebrow">Author</p>
              <h1 className="mt-4 text-[length:var(--text-display-lg)] font-bold leading-[1.06] tracking-[-0.03em]">
                {author.name}
              </h1>
              <p className="mt-2 text-lg font-medium text-gold-400">
                {author.role}, {site.name}
              </p>
              <p className="mt-5 text-lg leading-relaxed text-cream-300">{author.summary}</p>
              <p className="mt-4">
                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="text-sm font-semibold text-gold-300 underline-offset-4 hover:underline"
                >
                  Connect with Deepak on LinkedIn
                </a>
              </p>
            </Reveal>
          </div>
        </div>
      </header>

      {/* ================= CREDENTIALS ================= */}
      <section className="section-tight" aria-labelledby="credentials-title">
        <div className="container-x">
          <h2 id="credentials-title" className="sr-only">
            Credentials
          </h2>
          <dl className="grid gap-px overflow-hidden rounded-3xl border border-cream-100/8 bg-cream-100/8 sm:grid-cols-2 lg:grid-cols-4">
            {author.credentials.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.08} className="flex flex-col-reverse bg-ink-850/80 p-7">
                <dt className="mt-3 font-display text-base font-semibold text-cream-50">{c.label}</dt>
                <dd className="font-display text-[length:var(--text-display-md)] font-bold leading-none text-gradient-gold">
                  {c.value}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="section-tight border-t border-cream-100/8" aria-labelledby="story-title">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">Background</p>
              <h2
                id="story-title"
                className="mt-5 text-[length:var(--text-display-md)] font-bold leading-[1.1]"
              >
                An operator first, then a consultant.
              </h2>
              <h3 className="mt-10 font-display text-sm font-semibold uppercase tracking-[0.16em] text-gold-400">
                Areas of expertise
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {author.knowsAbout.map((k) => (
                  <li key={k} className="chip">
                    {k}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="space-y-5 text-lg leading-relaxed text-cream-200">
                {author.story.map((para) => (
                  <p key={para.slice(0, 32)}>{para}</p>
                ))}
              </div>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href={contact.primaryPhone.href} className="btn btn-gold btn-sm">
                  <Phone className="h-4 w-4" aria-hidden />
                  Talk to Deepak — {contact.primaryPhone.label}
                </a>
                <Link href="/services" className="btn btn-outline btn-sm">
                  How we work
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= ARTICLES ================= */}
      <section className="section border-t border-cream-100/8" aria-labelledby="articles-title">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal className="max-w-2xl">
              <p className="eyebrow">Writing</p>
              <h2
                id="articles-title"
                className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
              >
                Articles by {author.name.split(" ")[0]}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-cream-300">
                {posts.length > 0
                  ? `${posts.length} guides on Swiggy and Zomato ranking, ads, menus, ratings and margins.`
                  : "Guides on Swiggy and Zomato ranking, ads, menus, ratings and margins."}{" "}
                Start with a topic guide:{" "}
                {topicHubs.map((h, i) => (
                  <span key={h.slug}>
                    <Link href={`/${h.slug}`} className="font-medium text-gold-400 hover:text-gold-300">
                      {h.shortName}
                    </Link>
                    {i < topicHubs.length - 2 ? ", " : i === topicHubs.length - 2 ? " or " : "."}
                  </span>
                ))}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <Link href="/blogs" className="btn btn-outline">
                All articles
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </div>

          {posts.length > 0 && (
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={(i % 3) * 0.08} className="h-full">
                  <PostCard post={post} className="h-full" />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTABand className="border-t border-cream-100/8" />
    </>
  );
}
