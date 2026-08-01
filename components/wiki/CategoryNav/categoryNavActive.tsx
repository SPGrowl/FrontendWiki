"use client";

import { usePathname } from "next/navigation";
import type { WikiCategory } from "@/lib/wiki/placeholder-data";
import { CategoryNav } from "./categoryNav";

function resolveActiveSlug(pathname: string, categories: WikiCategory[]) {
  const home = categories.find((category) => category.href === "/");
  if (pathname === "/") {
    return home?.content ?? "";
  }

  const match = categories.find(
    (category) =>
      category.href !== "/" &&
      (pathname === category.href || pathname.startsWith(`${category.href}/`))
  );

  return match?.content ?? home?.content ?? "";
}

export function CategoryNavActive({
  categories,
}: {
  categories: WikiCategory[];
}) {
  const pathname = usePathname();
  return (
    <CategoryNav
      categories={categories}
      activeSlug={resolveActiveSlug(pathname, categories)}
    />
  );
}
