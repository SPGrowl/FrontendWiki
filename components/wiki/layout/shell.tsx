"use client";
import { SidebarProvider } from "@/components/ui/sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "12rem",
          "--sidebar-width-icon": "2.5rem",
        } as React.CSSProperties
      }
    >
      {children}
    </SidebarProvider>
  );
}