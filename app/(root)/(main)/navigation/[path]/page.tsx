import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NavigationPageContent } from "@/components/wiki/NavigationPageContent";
import {
  getNavigationPage,
  navigationPages,
} from "@/lib/wiki/navigation-data";

type Props = {
  params: Promise<{ path: string }>;
};

export function generateStaticParams() {
  return Object.keys(navigationPages)
    .filter((path) => path !== "home")
    .map((path) => ({ path }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const page = getNavigationPage(path);
  return { title: page?.categoryLabel ?? "分类未找到" };
}

export default async function NavigationCategoryPage({ params }: Props) {
  const { path } = await params;

  if (path === "home") {
    notFound();
  }

  const page = getNavigationPage(path);
  if (!page) {
    notFound();
  }

  return <NavigationPageContent data={page} />;
}
