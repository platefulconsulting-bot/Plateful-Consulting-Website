"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";

import { ServiceIcon } from "@/components/site/ServiceIcon";
import { pinProgress, registerSection, subscribe } from "@/lib/scroll";
import { services } from "@/lib/site";

/**
 * "What we do" — the services on a 3D ring that turns once as you scroll.
 *
 * The section is tall and its content is `sticky`, so the page holds still
 * while the ring makes exactly one full turn, bringing each service to the
 * front in order. Once the turn completes the section's bottom arrives and
 * the page scrolls on as normal.
 *
 * The cards are real DOM (CSS 3D transforms), not WebGL: every service name,
 * summary and link stays readable, focusable and crawlable. The turn is
 * written straight to `style.transform` from the shared scroll store, so
 * scrolling never re-renders React; only the "now showing" label does, and
 * only when the front card changes.
 *
 * `prefers-reduced-motion` gets no pinning and no ring — a plain grid. Only
 * one of the two is ever displayed, so screen readers meet each service once.
 */

const SECTION_ID = "services";

/** The 3D artwork from the old stage, where a service has one. */
const ART: Partial<Record<string, string>> = {
  "swiggy-zomato-onboarding": "/icons3d/food-bag.webp",
  "menu-optimization": "/icons3d/menu-board.webp",
  "delivery-sales-growth": "/icons3d/delivery-scooter.webp",
  "dine-in-sales-growth": "/icons3d/growth.png",
  "aggregator-ads": "/icons3d/growth-chart.webp",
  "food-photography": "/icons3d/photography.webp",
  "meta-ads": "/icons3d/social-media.png",
  "event-consulting": "/icons3d/eventa.png",
};

const COUNT = services.length;
const STEP = 360 / COUNT;

/** Scroll held at each end, so the first and last card are read at rest. */
const HOLD = 0.06;

const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

const pad = (n: number) => String(n).padStart(2, "0");

/** Ring angle, in degrees, for a 0–1 progress through the pinned scroll. */
function angleFor(progress: number) {
  const turn = Math.min(1, Math.max(0, (progress - HOLD) / (1 - 2 * HOLD)));
  return -turn * 360;
}

/** Where card `i` sits relative to the viewer: 0 is dead front, ±180 behind. */
function relativeAngle(i: number, ringAngle: number) {
  const a = (((i * STEP + ringAngle) % 360) + 540) % 360 - 180;
  return a;
}

function cardStyle(i: number, ringAngle: number): CSSProperties {
  const rel = relativeAngle(i, ringAngle);
  const facing = Math.max(0, Math.cos((rel * Math.PI) / 180));
  return {
    transform: `rotateY(${i * STEP}deg) translateZ(var(--ring-r))`,
    opacity: 0.18 + 0.82 * Math.pow(facing, 1.6),
    pointerEvents: Math.abs(rel) < STEP / 2 ? "auto" : "none",
  };
}

const ringTransform = (angle: number) => `translateZ(calc(var(--ring-r) * -1)) rotateY(${angle}deg)`;

export function ServiceCarousel() {
  const section = useRef<HTMLElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const unregister = registerSection(SECTION_ID, el);

    let last = -1;
    const apply = () => {
      const progress = pinProgress(SECTION_ID);
      const angle = angleFor(progress);

      if (ring.current) ring.current.style.transform = ringTransform(angle);
      if (bar.current) bar.current.style.transform = `scaleX(${-angle / 360})`;

      cards.current.forEach((card, i) => {
        if (!card) return;
        const s = cardStyle(i, angle);
        card.style.opacity = String(s.opacity);
        card.style.pointerEvents = s.pointerEvents as string;
      });

      const front = ((Math.round(-angle / STEP) % COUNT) + COUNT) % COUNT;
      if (front !== last) {
        last = front;
        setActive(front);
      }
    };

    apply();
    const unsubscribe = subscribe(apply);
    return () => {
      unsubscribe();
      unregister();
    };
  }, []);

  /** Tabbing onto a card that is round the back scrolls the ring to it. */
  const bringToFront = (i: number) => {
    const el = section.current;
    if (!el || i === active) return;
    const rect = el.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    const progress = HOLD + (1 - 2 * HOLD) * (i / COUNT);
    window.scrollTo({ top: window.scrollY + rect.top + progress * travel });
  };

  const current = services[active];

  return (
    <section
      ref={section}
      id={SECTION_ID}
      aria-labelledby="services-title"
      className="relative h-[380vh] motion-reduce:h-auto"
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pb-6 pt-24 motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible motion-reduce:py-24">
        {/* Heading row */}
        <div className="container-x flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div className="max-w-2xl">
            <p className="eyebrow">What we do</p>
            <h2
              id="services-title"
              className="mt-4 text-[length:var(--text-display-md)] font-bold leading-[1.05]"
            >
              {NUMBER_WORDS[COUNT] ?? COUNT} services. One outcome.
            </h2>
            <p className="mt-4 hidden max-w-xl leading-relaxed text-cream-300 sm:block [@media(max-height:760px)]:hidden">
              Everything here exists to move the same number: profitable revenue per outlet.
              We sequence them in the order that compounds — operations, then listing, then
              spend.
            </p>
          </div>

          <Link href="/services" className="btn btn-gold hidden lg:inline-flex">
            See how each service works
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {/* The ring */}
        <div
          className="relative min-h-0 flex-1 motion-reduce:hidden"
          style={
            {
              // Card width follows both axes so the ring fits short laptop
              // screens and narrow phones alike.
              "--card-w": "min(300px, 64vw, 40svh)",
              // Just wide enough that neighbouring cards never overlap.
              "--ring-r": `calc(var(--card-w) * ${(0.5 / Math.tan(Math.PI / COUNT) + 0.2).toFixed(3)})`,
              perspective: "calc(var(--card-w) * 5.5)",
            } as CSSProperties
          }
        >
          {/* Floor glow under the ring */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[62%] h-40 w-[min(900px,90vw)] -translate-x-1/2 rounded-[50%] opacity-60 blur-3xl"
            style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--color-gold-500) 22%, transparent), transparent)" }}
          />

          <div
            ref={ring}
            className="absolute left-1/2 top-1/2 h-[calc(var(--card-w)*1.3)] w-[var(--card-w)] -translate-x-1/2 -translate-y-1/2 will-change-transform"
            style={{ transformStyle: "preserve-3d", transform: ringTransform(0) }}
          >
            {services.map((service, i) => (
              <Link
                key={service.slug}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                href={`/services#${service.slug}`}
                onFocus={() => bringToFront(i)}
                className="group absolute inset-0 flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-gold-400/30 bg-ink-850 p-6 shadow-[var(--shadow-warm-md)] transition-[border-color,box-shadow] duration-500 [backface-visibility:hidden] hover:border-gold-400/70 hover:shadow-[var(--shadow-gold-glow)]"
                style={cardStyle(i, 0)}
              >
                {/* Accent glow behind the artwork */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
                  style={{ background: `radial-gradient(circle at 50% 35%, ${service.accent}40, transparent 70%)` }}
                />

                <span className="relative flex items-start justify-between">
                  <span className="h-1.5 w-10 rounded-full" style={{ background: service.accent }} />
                  <span className="font-display text-xs font-semibold text-cream-500">
                    {pad(i + 1)}
                  </span>
                </span>

                <span className="relative mt-3 flex min-h-0 flex-1 items-center justify-center">
                  {ART[service.slug] ? (
                    <Image
                      src={ART[service.slug]!}
                      alt=""
                      width={200}
                      height={200}
                      // Lazy loading can't see into a 3D-transformed ring, so
                      // cards round the back would arrive blank. They're small.
                      loading="eager"
                      className="h-full max-h-[calc(var(--card-w)*0.42)] w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                    />
                  ) : (
                    <ServiceIcon icon={service.icon} accent={service.accent} size="lg" />
                  )}
                </span>

                <span className="relative mt-3 block font-display text-lg font-semibold leading-snug text-cream-50 transition-colors group-hover:text-gold-300">
                  {service.name}
                </span>
                <span className="relative mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-cream-400">
                  {service.summary}
                </span>
                <span className="relative mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 transition-transform duration-300 group-hover:translate-x-1">
                  Explore
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Progress: which service is at the front, and how far round we are */}
        <div className="container-x motion-reduce:hidden">
          <div className="mx-auto flex max-w-md items-center gap-4">
            <span className="font-display text-sm font-semibold tabular-nums text-gold-400">
              {pad(active + 1)}
              <span className="text-cream-500"> / {pad(COUNT)}</span>
            </span>
            <div className="relative h-px flex-1 overflow-hidden bg-cream-100/15">
              <div
                ref={bar}
                className="absolute inset-0 origin-left bg-gold-400"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
            <span className="max-w-[45%] truncate text-sm text-cream-300">{current.shortName}</span>
          </div>
          <div className="mt-4 flex justify-center lg:hidden">
            <Link href="/services" className="btn btn-gold btn-sm">
              See how each service works
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Reduced motion: the same services as a plain grid */}
        <div className="container-x hidden motion-reduce:block">
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services#${service.slug}`}
                className="card card-hover flex h-full flex-col p-7"
              >
                <ServiceIcon icon={service.icon} accent={service.accent} />
                <span className="mt-6 font-display text-lg font-semibold text-cream-50">
                  {service.name}
                </span>
                <span className="mt-3 flex-1 text-sm leading-relaxed text-cream-400">
                  {service.summary}
                </span>
              </Link>
            ))}
          </div>
          <Link href="/services" className="btn btn-gold mt-10 lg:hidden">
            See how each service works
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
