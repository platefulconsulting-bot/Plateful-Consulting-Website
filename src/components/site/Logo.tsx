import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Brand lockup.
 *
 * Uses the real PFC diamond monogram (gold, transparent background) supplied by
 * the client, paired with the "Plateful Consulting" wordmark set in the site's
 * display face. Height is driven by the `className` (e.g. `h-10`); the mark and
 * type scale from it.
 */

export function Logo({
  className,
  showTagline = false,
  markOnly = false,
}: {
  className?: string;
  showTagline?: boolean;
  markOnly?: boolean;
}) {
  const mark = (
    <Image
      src="/brand/PFC-LOGO.webp"
      alt=""
      width={512}
      height={512}
      priority
      className="h-full w-auto shrink-0 object-contain"
    />
  );

  if (markOnly) {
    return <span className={cn("block", className)}>{mark}</span>;
  }

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {mark}

      <span className="flex flex-col justify-center leading-none">
        <span className="font-display text-[1.05em] font-bold tracking-[-0.02em] text-cream-50">
          Plateful
        </span>
        <span className="mt-[0.15em] font-display text-[0.5em] font-semibold uppercase tracking-[0.34em] text-gold-400">
          Consulting
        </span>
        {showTagline && (
          <span className="mt-[0.35em] text-[0.36em] font-medium uppercase tracking-[0.22em] text-cream-500">
            Client Focused &nbsp;|&nbsp; Result Driven
          </span>
        )}
      </span>
    </span>
  );
}
