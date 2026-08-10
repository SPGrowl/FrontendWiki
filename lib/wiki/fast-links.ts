import type { LinkItem } from "@/components/wiki/FastLink/FastLink";
import { homePageData } from "@/lib/wiki/home-page-data";

export async function getFastLinks(): Promise<LinkItem[]> {
  return homePageData.fastLinks;
}
