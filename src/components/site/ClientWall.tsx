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

/** Full grid with names — the emphasised "brands we've scaled" block. */
export function ClientGrid({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5",
        className,
      )}
    >
      {clients.map((client) => (
        <li key={client.name} className="group flex flex-col items-center text-center">
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
  );
}
