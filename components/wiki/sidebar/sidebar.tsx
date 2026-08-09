"use client";

import * as React from "react";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SidebarGithub } from "./SidebarGithub";

const SIDEBAR_WIDTH = "12rem";
/** 侧栏开合：略减速 + ease-out 曲线，比 linear 更自然 */
const SIDEBAR_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SIDEBAR_DURATION_MS = 320;

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
        "fixed top-1/2 z-60 flex h-14 w-5 -translate-y-1/2 items-center justify-center",
        "rounded-r-lg border border-l-0 border-sidebar-border bg-sidebar/95 text-sidebar-foreground/70 shadow-sm backdrop-blur-sm",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md",
        "active:scale-[0.96]",
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
        open
          ? "left-(--sidebar-width) max-md:left-[min(18rem,85vw)]"
          : "left-0",
        className
      )}
      style={{
        transitionProperty: "left, color, background-color, box-shadow, transform",
        transitionDuration: `${SIDEBAR_DURATION_MS}ms`,
        transitionTimingFunction: SIDEBAR_EASE,
      }}
    >
      <CaretLeftIcon
        className={cn(
          "size-3.5 transition-transform",
          !open && "rotate-180"
        )}
        style={{
          transitionDuration: `${SIDEBAR_DURATION_MS}ms`,
          transitionTimingFunction: SIDEBAR_EASE,
        }}
        weight="bold"
        aria-hidden
      />
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

  const motionStyle = {
    transitionDuration: `${SIDEBAR_DURATION_MS}ms`,
    transitionTimingFunction: SIDEBAR_EASE,
  } as const;

  return (
    <div
      className={cn("contents", className)}
      style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
    >
      <div
        aria-hidden
        className={cn(
          "hidden shrink-0 transition-[width] md:block",
          open ? "w-(--sidebar-width)" : "w-0"
        )}
        style={motionStyle}
      />

      <aside
        aria-label="Wiki 导航"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-svh w-72 max-w-[85vw] flex-col border-r bg-sidebar text-sidebar-foreground",
          "transition-transform md:w-(--sidebar-width) md:max-w-none",
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
        style={motionStyle}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          <SidebarGithub />
        </div>
      </aside>

      <SidebarToggle open={open} onClick={toggle} />

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        style={motionStyle}
        onClick={close}
        aria-hidden
      />
    </div>
  );
}
