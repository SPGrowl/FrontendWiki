import { CategoryNavActive } from "@/components/wiki/CategoryNav/categoryNavActive";
import { MainContainer } from "@/components/wiki/MainContainer/main";
import { wikiCategories } from "@/lib/wiki/placeholder-data";

export default function MainGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 bg-[#e6eff4] px-4">
      <CategoryNavActive categories={wikiCategories} />
      <MainContainer>{children}</MainContainer>
    </div>
  );
}
