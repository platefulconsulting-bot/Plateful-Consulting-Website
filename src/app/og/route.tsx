import { ImageResponse } from "next/og";

/**
 * Branded 1200×630 share card.
 *
 * Used as the og:image / twitter:image for every page that has no uploaded
 * cover, so WhatsApp, LinkedIn and Instagram links always show a preview, and
 * as the Article schema image. Lives at /og (not /api) because robots.txt
 * blocks /api/ and social crawlers honour that.
 *
 *   /og                                  → default brand card
 *   /og?title=...&label=Ads%20%26%20ROAS → article card
 */

export const runtime = "edge";

const DEFAULT_TITLE = "Swiggy & Zomato Sales Consultant in India";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || DEFAULT_TITLE).slice(0, 140);
  const label = (searchParams.get("label") || "Restaurant Growth Playbook").slice(0, 40);
  const size = title.length > 90 ? 52 : title.length > 60 ? 60 : 70;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0a0806 0%, #1c140a 60%, #2a1c08 100%)",
          color: "#fdfaf2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 18,
              height: 18,
              transform: "rotate(45deg)",
              background: "#d9a441",
            }}
          />
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>Plateful Consulting</div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 22,
              color: "#d9a441",
              border: "2px solid #d9a44166",
              borderRadius: 999,
              padding: "8px 22px",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {label}
          </div>
        </div>

        <div style={{ fontSize: size, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1.5, maxWidth: 1040 }}>
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 24, color: "#cbbfa8" }}>
          <div style={{ display: "flex", color: "#FC8019", fontWeight: 700 }}>Swiggy</div>
          <div style={{ display: "flex", color: "#E23744", fontWeight: 700 }}>Zomato</div>
          <div style={{ display: "flex" }}>· 650+ restaurants scaled · platefulconsulting.com</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
    },
  );
}
