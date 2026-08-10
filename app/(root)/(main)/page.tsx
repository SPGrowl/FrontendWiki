import { HomePageContent } from "@/components/wiki/HomePageContent";
import { homePageData } from "@/lib/wiki/home-page-data";

export default function RootPage() {
  return <HomePageContent data={homePageData} />;
}
