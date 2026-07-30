import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { CategoryNav } from "@/components/wiki/CategoryNav/categoryNav";
import { Shell } from "@/components/wiki/layout/shell";
import { MainContainer } from "@/components/wiki/MainContainer/main";
import { WikiSidebar } from "@/components/wiki/sidebar/sidebar";
import { sidebarNavItems, wikiCategories } from "@/lib/wiki/placeholder-data";
import { SidebarNav } from "@/components/wiki/sidebar/sidebarnav";

export default function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Shell>
      <WikiSidebar>
        <SidebarNav items={sidebarNavItems} />
      </WikiSidebar>

      <SidebarInset className="min-w-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="font-semibold">Frontend Wiki</span>
        </header>

        <div className="flex min-w-0 flex-1 flex-col gap-2 bg-[#e6eff4] px-4">
          <CategoryNav categories={wikiCategories} activeSlug="minecraft" />
          <MainContainer>{children}</MainContainer>
        </div>
      </SidebarInset>
    </Shell>
  );
}
