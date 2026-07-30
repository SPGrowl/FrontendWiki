"use client";
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "../../ui/sidebar";
// wiki-sidebar.tsx — Client
export function WikiSidebar({ children}: { children: React.ReactNode}) {
    return (
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>{/* Logo 占位 */}</SidebarHeader>
        <SidebarContent>
         {children}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    );
  }
