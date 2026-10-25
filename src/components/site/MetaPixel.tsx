"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { META_PIXEL_ID, track } from "@/lib/analytics";

/**
 * Meta Pixel for the public site: page views (including client-side
 * navigation) and Contact events for phone and WhatsApp taps. Form Lead events
 * fire from the forms themselves, only after a successful submit.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const first = useRef(true);

  // The init snippet already counts the landing page; only count later navigations.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    track("PageView");
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const link = (e.target as HTMLElement | null)?.closest("a");
      const href = link?.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) track("Contact", { method: "phone" });
      else if (/wa\.me|whatsapp\.com/.test(href)) track("Contact", { method: "whatsapp" });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
    </Script>
  );
}
