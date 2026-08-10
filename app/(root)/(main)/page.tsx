import { HomePageContent } from "@/components/wiki/HomePageContent";
import { listRecentContributions } from "@/lib/db/entries";
import { homePageData } from "@/lib/wiki/home-page-data";

export default async function RootPage() {
  const contributions = await listRecentContributions(10);

  return (
    <HomePageContent data={homePageData} contributions={contributions} />
  );
}
