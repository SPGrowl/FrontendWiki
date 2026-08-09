"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const searchHistory = [
  { id: "1", title: "JavaScript", subtitle: "脚本语言" },
  { id: "2", title: "TypeScript", subtitle: "脚本语言" },
  { id: "3", title: "Vite", subtitle: "工具链" },
];

function SearchShortcut({
  children,
  className,
  variant = "muted",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "muted" | "outline";
}) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 items-center justify-center rounded border px-1.5 font-mono text-[10px] font-medium uppercase tracking-wide",
        variant === "outline"
          ? "border-border/70 bg-transparent text-muted-foreground/80"
          : "min-w-5 border-border bg-muted text-muted-foreground",
        className
      )}
    >
      {children}
    </kbd>
  );
}

export function WikiSearch() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="搜索 Frontend Wiki"
        className={cn(
          "inline-flex h-8 shrink-0 items-center gap-2.5 rounded-md px-1.5 text-sm text-muted-foreground/90",
          "transition-colors hover:bg-muted/50 hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        )}
      >
        <MagnifyingGlassIcon className="size-[18px] shrink-0" aria-hidden />
        <span className="text-[13px]">搜索</span>
        <SearchShortcut variant="outline" className="h-[22px] px-2">
          Ctrl K
        </SearchShortcut>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="搜索 Frontend Wiki"
        description="搜索词条与文档"
        className="overflow-hidden rounded-lg sm:max-w-xl"
        showCloseButton={false}
      >
        <Command
          className="rounded-lg [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
          shouldFilter={false}
        >
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <MagnifyingGlassIcon
              className="size-5 shrink-0 text-wiki-accent"
              aria-hidden
            />
            <CommandPrimitive.Input
              placeholder="搜索 Frontend Wiki"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <CommandList className="max-h-80">
            <CommandEmpty className="py-8 text-muted-foreground">
              输入关键词开始搜索
            </CommandEmpty>
            <CommandGroup heading="搜索历史">
              {searchHistory.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.title}
                  className="mx-2 rounded-md px-3 py-2.5 aria-selected:bg-wiki-accent aria-selected:text-white data-selected:bg-wiki-accent data-selected:text-white"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="text-muted-foreground data-selected:text-white/80">
                    / {item.subtitle}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <SearchShortcut>↵</SearchShortcut>
              选择
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5">
                <SearchShortcut>↓</SearchShortcut>
                <SearchShortcut>↑</SearchShortcut>
              </span>
              切换
            </span>
            <span className="inline-flex items-center gap-1.5">
              <SearchShortcut>esc</SearchShortcut>
              关闭
            </span>
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}
