import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "platefulconsulting.com" },
      { protocol: "https", hostname: "**.platefulconsulting.com" },
    ],
  },
  // three.js ships untranspiled ESM examples; keep them in the server bundle graph.
  transpilePackages: ["three"],
  async redirects() {
    return [
      // Legacy WordPress artefacts -> canonical destinations.
      { source: "/1169-2", destination: "/swiggy-dineout-vs-zomato-dine-in", permanent: true },
      { source: "/elementor-1422", destination: "/blogs", permanent: true },
      { source: "/maintenance-page", destination: "/", permanent: true },
      { source: "/blog", destination: "/blogs", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/contact", destination: "/contact-us", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
