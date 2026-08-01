import { notFound } from "next/navigation";
import { NavigationPageContent } from "@/components/wiki/NavigationPageContent";
import { getNavigationPage } from "@/lib/wiki/navigation-data";

export default function RootPage() {
  const page = getNavigationPage("home");

  if (!page) {
    notFound();
  }

  return <NavigationPageContent data={page} />;
}
