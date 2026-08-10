import { Introduction } from "@/components/wiki/card/inroduction";
import { RecentContributions } from "@/components/wiki/home/RecentContributions";
import type { HomePageData } from "@/lib/wiki/home-page-data";
import type { RecentContributionItem } from "@/type/entry";

interface HomePageContentProps {
  data: HomePageData;
  contributions: RecentContributionItem[];
}

export function HomePageContent({
  data,
  contributions,
}: HomePageContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <Introduction cards={data.introductions} />
      <RecentContributions items={contributions} />
    </div>
  );
}
