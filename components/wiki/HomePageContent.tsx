import { RecentBlogs } from "@/components/wiki/home/RecentBlogs";
import { RecentContributions } from "@/components/wiki/home/RecentContributions";
import type { RecentBlogItem, RecentContributionItem } from "@/type/entry";

interface HomePageContentProps {
  blogs: RecentBlogItem[];
  contributions: RecentContributionItem[];
}

export function HomePageContent({
  blogs,
  contributions,
}: HomePageContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <RecentBlogs items={blogs} />
      <RecentContributions items={contributions} />
    </div>
  );
}
