import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { jsonLd, organizationSchema, websiteSchema } from "@/lib/seo";
import { SmoothScroll } from "@/components/scroll/SmoothScroll";

/**
 * The public site's chrome.
 *
 * Shared by the `(site)` route group and the root `not-found`, which renders
 * outside that group and would otherwise appear with no header or footer.
 */
export function SiteFrame({ children }: { children: ReactNode }) {
  const schema = jsonLd(organizationSchema(), websiteSchema());

  return (
    <>
      <script
        type="application/ld+json"
        // Site-wide entity graph. Page-level schema is emitted per route.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SmoothScroll />
      <Header />
      <main id="main" className="pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
