import { Introduction } from "@/components/wiki/card/inroduction";
import type { NavigationPageData } from "@/lib/wiki/navigation-data";

export function NavigationPageContent({ data }: { data: NavigationPageData }) {
  return <Introduction cards={data.introductions} />;
}
