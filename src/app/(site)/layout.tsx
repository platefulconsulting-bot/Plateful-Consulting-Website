import type { ReactNode } from "react";
import { SiteFrame } from "@/components/site/SiteFrame";

/** Public marketing site: header, footer and site-wide structured data. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
