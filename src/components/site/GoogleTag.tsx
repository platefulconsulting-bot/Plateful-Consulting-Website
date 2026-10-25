import Script from "next/script";
import { GOOGLE_TAG_ID } from "@/lib/analytics";

/**
 * Google tag (gtag.js) for Google Ads remarketing. Client-side navigations
 * and contact/lead events are sent through `track()` alongside the Meta Pixel.
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
window.gtag=gtag;gtag('js',new Date());gtag('config','${GOOGLE_TAG_ID}');`}
      </Script>
    </>
  );
}
