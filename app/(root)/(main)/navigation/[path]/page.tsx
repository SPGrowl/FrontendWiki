import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NavigationPageContent } from "@/components/wiki/NavigationPageContent";
import {
  getNavigationPage,
  navigationPaths,
} from "@/lib/wiki/navigation-data";

type Props = {
  params: Promise<{ path: string }>;
};

export function generateStaticParams() {
  return navigationPaths
    .filter((path) => path !== "home")
    .map((path) => ({ path }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const page = getNavigationPage(path);

  if (!page) {
    return { title: "页面未找到" };
  }

  return {
    title: `${page.categoryLabel} | Frontend Wiki`,
  };
}


export default async function NavigationPage({ params }: Props) {
  const { path } = await params;
  const page = getNavigationPage(path);

  if (!page || path === "home") {
    notFound();
  }

  return <NavigationPageContent data={page} />;
}
