import { WikiSidebar } from "@/components/wiki/sidebar/sidebar";
import { sidebarNavGroups } from "@/lib/wiki/placeholder-data";
import { SidebarNav } from "@/components/wiki/sidebar/sidebarnav";

export default function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh w-full">
      <WikiSidebar>
        <SidebarNav groups={sidebarNavGroups} />
      </WikiSidebar>

      <main className="relative flex min-w-0 flex-1 flex-col bg-background">
        <header className="flex h-12 shrink-0 items-center border-b px-4">
          <span className="font-semibold">Frontend Wiki</span>
        </header>

        {children}
      </main>
    </div>
  );
}
