import Image from "next/image";
import { clients } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Client logo wall.
 *
 * Each supplied logo is a self-contained circular badge with its own
 * background colour, so they are masked to circles at a common size rather
 * than dropped onto plates — that keeps a purple, a mint and a navy badge
 * looking like one deliberate set instead of ten mismatched images.
 *
 * Logos are full colour, not greyed out. These brands are the strongest proof
 * on the page and fading them to 40% opacity — the usual "logo soup" default —
 * throws that away.
 */

function ClientLogo({
  client,
  size = "md",
}: {
  client: (typeof clients)[number];
  size?: "sm" | "md" | "lg";
}) {
  const box = { sm: "h-14 w-14", md: "h-20 w-20", lg: "h-24 w-24" }[size];

  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-full ring-1 ring-cream-100/12",
        "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        box,
      )}
    >
      <Image
        src={client.logo}
        alt={`${client.name} logo`}
        fill
        sizes="96px"
        className="object-cover"
      />
    </span>
  );
}

/** Continuous scrolling strip — used directly under the hero. */
export function ClientMarquee({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="mask-fade-x flex overflow-hidden">
        {/* Duplicated once so the -50% translate loops seamlessly. */}
        <ul className="flex shrink-0 animate-[marquee_46s_linear_infinite] items-center gap-10 pr-10">
          {[...clients, ...clients].map((client, i) => (
            <li key={`${client.name}-${i}`} className="flex items-center gap-3.5">
              <ClientLogo client={client} size="sm" />
              <span className="whitespace-nowrap font-display text-base font-semibold tracking-tight text-cream-300">
                {client.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * The emphasised "brands we've scaled" block: two rows of named logos that
 * drift in opposite directions. Hovering a row pauses it so a name can be read;
 * reduced-motion users get the rows still (globals.css stops animations).
 */
export function ClientGrid({ className }: { className?: string }) {
  const half = Math.ceil(clients.length / 2);
  const rows = [clients.slice(0, half), clients.slice(half)];

  return (
    <div className={cn("relative flex flex-col gap-10", className)}>
      {rows.map((row, r) => (
        <div key={r} className="mask-fade-x flex overflow-hidden">
          {/* Duplicated once so the -50% translate loops seamlessly. */}
          <ul
            className={cn(
              "flex shrink-0 items-start gap-6 pr-6 hover:[animation-play-state:paused] sm:gap-10 sm:pr-10",
              r === 0
                ? "animate-[marquee_60s_linear_infinite]"
                : "animate-[marquee_60s_linear_infinite_reverse]",
            )}
          >
            {[...row, ...row].map((client, i) => (
              <li
                key={`${client.name}-${i}`}
                aria-hidden={i >= row.length ? true : undefined}
                className="group flex w-36 shrink-0 flex-col items-center text-center sm:w-44"
              >
                <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5">
                  <ClientLogo client={client} size="lg" />
                </span>
                <span className="mt-4 font-display text-sm font-semibold leading-snug text-cream-100">
                  {client.name}
                </span>
                <span className="mt-1 text-xs leading-snug text-cream-500">{client.type}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
