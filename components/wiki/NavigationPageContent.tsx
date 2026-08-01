import { FastLink } from "@/components/wiki/FastLink/FastLink";
import { Introduction } from "@/components/wiki/card/inroduction";
import type { NavigationPageData } from "@/lib/wiki/navigation-data";

export function NavigationPageContent({ data }: { data: NavigationPageData }) {
  return (
    <div className="flex flex-col gap-2">
      <FastLink items={data.fastLinks} />
      <Introduction cards={data.introductions} />
    </div>
  );
}
