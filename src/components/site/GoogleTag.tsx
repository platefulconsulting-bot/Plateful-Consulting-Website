import Script from "next/script";
import { GA4_ID, GOOGLE_TAG_ID } from "@/lib/analytics";

/**
 * Google tag (gtag.js), configured for Google Ads remarketing and Google
 * Analytics 4. GA4 records the landing page and later client-side navigations
 * itself; contact, lead and tool events are sent through `track()` alongside
 * the Meta Pixel.
 */
export function GoogleTag() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;gtag('js',new Date());gtag('config','${GOOGLE_TAG_ID}');gtag('config','${GA4_ID}');`}
      </Script>
    </>
  );
}
