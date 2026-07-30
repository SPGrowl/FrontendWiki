"use client";
import { Sidebar, SidebarContent, SidebarHeader} from "@/components/ui/sidebar";

// wiki-sidebar.tsx — Client
export default function sidebarContainer({ children }: { children: React.ReactNode }) {
    return (
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>{/* Logo 占位 */}</SidebarHeader>
        <SidebarContent>{children}</SidebarContent>
      </Sidebar>
    );
  }