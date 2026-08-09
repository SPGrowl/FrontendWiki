"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SidebarGithub } from "./SidebarGithub";

const SIDEBAR_WIDTH = "12rem";

interface WikiSidebarProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

function SidebarToggle({
  open,
  onClick,
  className,
}: {
  open: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "折叠侧栏" : "展开侧栏"}
      aria-expanded={open}
      className={cn(
        "fixed top-1/2 z-[60] flex size-6 -translate-y-1/2 items-center justify-center rounded-r-md",
        "border border-sidebar-border bg-sidebar text-xs text-sidebar-foreground shadow-sm",
        "transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
        open
          ? "left-[calc(var(--sidebar-width)-0.75rem)] max-md:left-[calc(min(18rem,85vw)-0.75rem)]"
          : "left-0",
        className
      )}
    >
      {open ? "<" : ">"}
    </button>
  );
}

export function WikiSidebar({
  children,
  defaultOpen = false,
  className,
}: WikiSidebarProps) {
  const [open, setOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    setOpen(
      window.matchMedia("(min-width: 768px)").matches && defaultOpen
    );
  }, [defaultOpen]);

  const toggle = () => setOpen((value) => !value);
  const close = () => setOpen(false);

  return (
    <div
      className={cn("contents", className)}
      style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
    >
      <div
        aria-hidden
        className={cn(
          "hidden shrink-0 transition-[width] duration-200 ease-linear md:block",
          open ? "w-(--sidebar-width)" : "w-0"
        )}
      />

      <aside
        aria-label="Wiki 导航"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-svh w-72 max-w-[85vw] flex-col border-r bg-sidebar text-sidebar-foreground",
          "transition-transform duration-200 ease-linear md:w-(--sidebar-width) md:max-w-none",
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          <SidebarGithub />
        </div>
      </aside>

      <SidebarToggle open={open} onClick={toggle} />

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden
        />
      )}
    </div>
  );
}
