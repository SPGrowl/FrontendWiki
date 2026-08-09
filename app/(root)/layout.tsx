import { WikiSidebar } from "@/components/wiki/sidebar/sidebar";
import { WikiHeader } from "@/components/wiki/header/wiki-header";
import { sidebarNavGroups } from "@/lib/wiki/placeholder-data";
import { SidebarNav } from "@/components/wiki/sidebar/sidebarnav";
import { JsRunnerProvider } from "@/components/tools/js-runner/js-runner-context";
import { JsRunnerPanel } from "@/components/tools/js-runner/JsRunnerPanel";

export default function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <JsRunnerProvider>
      <div className="flex h-svh min-h-0 w-full overflow-hidden">
        <WikiSidebar>
          <SidebarNav groups={sidebarNavGroups} />
        </WikiSidebar>

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
          <WikiHeader />

          <div className="flex min-h-0 flex-1 basis-0 flex-col overflow-y-auto">
            {children}
          </div>
        </main>
      </div>

      <JsRunnerPanel />
    </JsRunnerProvider>
  );
}
