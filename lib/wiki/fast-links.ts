import type { LinkItem } from "@/components/wiki/FastLink/FastLink";
import { getNavigationPage } from "./navigation-data";

export async function getFastLinks(path = "home"): Promise<LinkItem[]> {
  const page = getNavigationPage(path) ?? getNavigationPage("home");
  return page?.fastLinks ?? [];
}
