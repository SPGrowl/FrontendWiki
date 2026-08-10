import { Introduction } from "@/components/wiki/card/inroduction";
import type { HomePageData } from "@/lib/wiki/home-page-data";

export function HomePageContent({ data }: { data: HomePageData }) {
  return <Introduction cards={data.introductions} />;
}
