"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/type/entry";
import { EntryBreadcrumb } from "./EntryBreadcrumb";

const tabs = [
  { id: "read", label: "阅读" },
  { id: "discuss", label: "讨论" },
  { id: "history", label: "历史" },
  { id: "edit", label: "编辑" },
] as const;

export type EntryToolbarTab = (typeof tabs)[number]["id"];

interface EntryToolbarProps {
  activeTab?: EntryToolbarTab;
  readHref: string;
  editHref: string;
  historyHref: string;
  discussHref: string;
  breadcrumbs: BreadcrumbItem[];
}

export function EntryToolbar({
  activeTab = "read",
  readHref,
  editHref,
  historyHref,
  discussHref,
  breadcrumbs,
}: EntryToolbarProps) {
  const hrefByTab: Partial<Record<EntryToolbarTab, string>> = {
    read: readHref,
    edit: editHref,
    history: historyHref,
    discuss: discussHref,
  };

  return (
    <div className="flex min-w-0 items-end justify-between gap-2">
      <nav
        aria-label="词条功能"
        className="flex shrink-0 flex-wrap items-end gap-0"
      >
        {tabs.map((tab) => {
          const href = hrefByTab[tab.id];
          const isActive = tab.id === activeTab;
          const className = cn(
            "relative -mb-px border border-border px-3 py-1.5 text-sm transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            isActive
              ? "z-10 border-b-transparent bg-card font-medium text-foreground"
              : "border-b-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
          );

          if (href) {
            return (
              <Link key={tab.id} href={href} className={className}>
                {tab.label}
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              disabled
              title="即将推出"
              className={cn(className, "cursor-not-allowed opacity-60")}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <EntryBreadcrumb items={breadcrumbs} className="max-w-[55%]" />
    </div>
  );
}
