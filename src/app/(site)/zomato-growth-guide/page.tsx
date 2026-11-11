import { TopicHubPage, topicHubMetadata } from "@/components/site/TopicHubPage";
import { topicHubBySlug } from "@/lib/site";

export const revalidate = 3600;

const hub = topicHubBySlug("zomato-growth-guide")!;

export const metadata = topicHubMetadata(hub);

export default function Page() {
  return <TopicHubPage hub={hub} />;
}
