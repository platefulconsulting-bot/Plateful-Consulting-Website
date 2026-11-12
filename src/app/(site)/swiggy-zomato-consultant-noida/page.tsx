import { CityLandingPage, cityPageMetadata } from "@/components/site/CityPage";
import { cityPageBySlug } from "@/lib/site";

const page = cityPageBySlug("swiggy-zomato-consultant-noida")!;

export const metadata = cityPageMetadata(page);

export default function Page() {
  return <CityLandingPage page={page} />;
}
