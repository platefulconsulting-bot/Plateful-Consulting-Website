import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Phone, Mail } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { PostCard } from "@/components/site/PostCard";
import { LazyScene } from "@/components/three/LazyScene";
import { getFeaturedPosts } from "@/lib/posts";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your enquiry has been received. We reply within one business day.",
  alternates: { canonical: "/thank-you" },
  // A conversion confirmation has no business in search results.
  robots: { index: false, follow: true },
};

export default async function ThankYouPage() {
  const posts = await getFeaturedPosts(3);

  return (
    <>
      <section className="relative overflow-hidden" aria-labelledby="ty-title">
        <div className="grid-lines absolute inset-0 mask-fade-b opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(95,179,122,0.14),transparent_55%)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto hidden h-[30rem] w-[30rem] opacity-40 lg:block">
          <LazyScene name="signal-orb" maxDpr={1.25} />
        </div>

        <div className="container-x relative py-20 lg:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-basil-400/30 bg-basil-400/12">
              <CheckCircle2 className="h-8 w-8 text-basil-400" aria-hidden />
            </span>

            <h1
              id="ty-title"
              className="mt-8 text-[length:var(--text-display-lg)] font-bold leading-[1.05] tracking-[-0.03em]"
            >
              Got it. We&rsquo;ll be in touch.
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-cream-300">
              Your enquiry has reached us. We reply within one business day — usually with a few
              specific questions about your outlet so the first call is useful rather than
              introductory.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a href={contact.primaryPhone.href} className="btn btn-primary">
                <Phone className="h-4 w-4" aria-hidden />
                {contact.primaryPhone.label}
              </a>
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                Message on WhatsApp
              </a>
            </div>

            <p className="mt-6 text-sm text-cream-500">
              In a hurry? Call directly, or email{" "}
              <a href={contact.primaryEmail.href} className="text-gold-400 hover:text-gold-300">
                {contact.primaryEmail.label}
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* Keep them on the site rather than closing the tab. */}
      <section className="section border-t border-cream-100/8" aria-labelledby="ty-reading">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">While you wait</p>
            <h2
              id="ty-reading"
              className="mt-5 text-[length:var(--text-display-md)] font-bold leading-tight"
            >
              Three things worth reading first.
            </h2>
            <p className="mt-5 leading-relaxed text-cream-400">
              These cover the questions that come up on almost every first call. Reading them
              beforehand makes the audit conversation much faster.
            </p>
          </Reveal>

          <div className="mt-11 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.08} className="h-full">
                <PostCard post={post} className="h-full" />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 flex flex-wrap gap-4">
            <Link href="/blogs" className="btn btn-gold">
              Browse all articles
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/services" className="btn btn-outline">
              <Mail className="h-4 w-4" aria-hidden />
              See what we do
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
