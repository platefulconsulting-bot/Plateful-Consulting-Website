import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { platforms } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * Swiggy & Zomato band.
 *
 * The single most important thing a visiting restaurant owner needs to
 * establish in the first few seconds is "these people do *my* platforms". The
 * two aggregators get their own colours and their own panel rather than being
 * mentioned in body copy.
 *
 * Trademark note: the platform names and colours are used nominatively — to
 * identify the services this consultancy works on. No platform logos are
 * reproduced, and the footer carries a non-affiliation disclaimer.
 */

/** Small inline pills — used in the hero to badge the specialism immediately. */
export function PlatformChips({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2.5", className)}>
      {platforms.map((platform) => (
        <li
          key={platform.slug}
          className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold"
          style={{
            borderColor: `${platform.color}55`,
            backgroundColor: `${platform.color}14`,
            color: platform.color,
          }}
        >
          <span
            aria-hidden
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: platform.color }}
          />
          {platform.name}
        </li>
      ))}
    </ul>
  );
}

export function PlatformBand({ className }: { className?: string }) {
  return (
    <section
      className={cn("section relative overflow-hidden", className)}
      aria-labelledby="platforms-title"
    >
      {/* Two-tone wash: Swiggy orange on the left, Zomato red on the right. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 12% 20%, rgba(252,128,25,0.14), transparent 55%), radial-gradient(ellipse at 88% 70%, rgba(226,55,68,0.14), transparent 55%)",
        }}
      />

      <div className="container-x relative">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">The two platforms that decide your month</p>
          <h2
            id="platforms-title"
            className="mt-5 text-[length:var(--text-display-lg)] font-bold leading-[1.05]"
          >
            We work inside{" "}
            <span style={{ color: platforms[0].color }}>Swiggy</span> and{" "}
            <span style={{ color: platforms[1].color }}>Zomato</span> every day.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-cream-300">
            These are the partner dashboards where your whole restaurant sales are driven
            — where every order is won, where a two-point lift in acceptance rate moves
            more revenue than a month of posting, and where we spend our working day.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {platforms.map((platform, i) => (
            <Reveal key={platform.slug} delay={i * 0.1}>
              <article
                className="card card-hover group relative h-full overflow-hidden p-8 md:p-9"
                style={{ borderColor: `${platform.color}33` }}
              >
                {/* Platform colour bleeding in from the top edge */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-40 opacity-45 transition-opacity duration-500 group-hover:opacity-70"
                  style={{
                    background: `linear-gradient(180deg, ${platform.color}2e, transparent)`,
                  }}
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: platform.color }}
                />

                <div className="relative">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3
                      className="font-display text-3xl font-bold tracking-tight md:text-4xl"
                      style={{ color: platform.color }}
                    >
                      {platform.name}
                    </h3>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-cream-500">
                      0{i + 1}
                    </span>
                  </div>

                  <p className="mt-2 font-display text-base font-medium text-cream-100">
                    {platform.tagline}
                  </p>

                  <ul className="mt-7 space-y-3.5">
                    {platform.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-cream-300">
                        <span
                          className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                          style={{ backgroundColor: `${platform.color}22` }}
                        >
                          <Check className="h-3 w-3" style={{ color: platform.color }} aria-hidden />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/services"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1"
                    style={{ color: platform.color }}
                  >
                    What we do on {platform.name}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
