import { hashRatio } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Generated cover art.
 *
 * The migrated articles have no featured images. Rather than dropping in stock
 * photography of food that is not theirs, each post gets a deterministic
 * abstract cover derived from its slug — the same "ranking ladder" motif as the
 * hero, tinted by category. Same slug always yields the same artwork, so the
 * blog index looks composed rather than random, and it costs zero requests.
 *
 * Pure SVG, rendered on the server. A real cover image, once uploaded through
 * the Studio, takes precedence over this.
 */

export function PostCover({
  slug,
  accent = "#B47A17",
  className,
  compact = false,
}: {
  slug: string;
  accent?: string;
  className?: string;
  compact?: boolean;
}) {
  const seed = hashRatio(slug);
  const seed2 = hashRatio(`${slug}-b`);

  // Which bar is the "winner" — the one drawn in the accent colour.
  const rows = compact ? 4 : 5;
  const winner = Math.floor(seed * rows);

  const bars = Array.from({ length: rows }, (_, i) => {
    const r = hashRatio(`${slug}-${i}`);
    return {
      width: 32 + r * 44,
      isWinner: i === winner,
    };
  });

  const glowX = 20 + seed2 * 60;
  const rotation = -12 + seed * 24;

  return (
    // The artwork stays dark in both themes, the way a photograph would, so
    // its ground and vignette are fixed rather than theme variables.
    <div className={cn("relative overflow-hidden", className)} style={{ backgroundColor: "#100d09" }}>
      <svg
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`g-${slug}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#17120d" />
            <stop offset="100%" stopColor="#0a0806" />
          </linearGradient>
          <radialGradient id={`glow-${slug}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.42" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <pattern id={`grid-${slug}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#FFF9DF" strokeOpacity="0.05" strokeWidth="0.4" />
          </pattern>
        </defs>

        <rect width="200" height="120" fill={`url(#g-${slug})`} />
        <rect width="200" height="120" fill={`url(#grid-${slug})`} />
        <ellipse cx={glowX} cy="40" rx="80" ry="60" fill={`url(#glow-${slug})`} />

        <g transform={`translate(30, ${60 - (rows * 13) / 2}) rotate(${rotation} 70 ${(rows * 13) / 2})`}>
          {bars.map((bar, i) => (
            <g key={i} transform={`translate(0, ${i * 13})`}>
              <rect
                width={bar.width}
                height="8"
                rx="4"
                fill={bar.isWinner ? accent : "#2a2118"}
                opacity={bar.isWinner ? 0.95 : 0.8}
              />
              {/* Thumbnail square, echoing the listing cards in the hero. */}
              <rect
                x="-13"
                width="9"
                height="8"
                rx="2.5"
                fill={bar.isWinner ? accent : "#241e17"}
                opacity={bar.isWinner ? 0.7 : 0.85}
              />
            </g>
          ))}
        </g>
      </svg>

      {/* Warm vignette so overlaid text always has contrast. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(10,8,6,0.92), rgba(10,8,6,0.25) 55%, transparent)",
        }}
      />
    </div>
  );
}
