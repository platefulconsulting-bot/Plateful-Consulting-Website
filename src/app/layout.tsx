import type { Metadata, Viewport } from "next";
import { Sora, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

import { site } from "@/lib/site";
import { THEME_SCRIPT } from "@/lib/theme";

// Display face — geometric, slightly technical, holds up at very large sizes.
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

// Reading face.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Editorial italic, used sparingly for pull quotes and the brand line.
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Swiggy & Zomato Sales Consultant in India | Plateful Consulting",
    template: "%s | Plateful Consulting",
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    "Swiggy consultant",
    "Zomato consultant",
    "restaurant consultant India",
    "Swiggy Zomato sales growth",
    "restaurant menu optimization",
    "cloud kitchen consultant",
    "aggregator ads management",
    "restaurant growth Delhi NCR",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: "Swiggy & Zomato Sales Consultant in India | Plateful Consulting",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiggy & Zomato Sales Consultant in India",
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  // Follows the OS setting for the browser chrome. The in-page toggle overrides
  // the site itself; this only tints the address bar.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0806" },
    { media: "(prefers-color-scheme: light)", color: "#fdfaf2" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${sora.variable} ${inter.variable} ${instrument.variable}`}
      // `data-theme` is written by the bootstrap script below before paint.
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
