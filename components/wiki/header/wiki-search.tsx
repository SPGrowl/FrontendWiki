"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import {
  CaretDownIcon,
  CaretUpIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchEntries } from "@/lib/api/entries";
import { cn } from "@/lib/utils";
import type { EntrySearchItem } from "@/type/entry-api";

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

function SearchResultItem({
  item,
  expanded,
  onToggleExpand,
  onSelect,
}: {
  item: EntrySearchItem;
  expanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
}) {
  const hasExcerpt = Boolean(item.excerpt?.trim());
  const canExpand = hasExcerpt && item.excerpt.length > 80;

  return (
    <CommandItem
      value={`${item.name} ${item.breadcrumbPath}`}
      onSelect={onSelect}
      className="mx-2 flex flex-col items-stretch gap-1 rounded-md px-3 py-2.5 aria-selected:bg-wiki-accent/10 data-selected:bg-wiki-accent/10"
    >
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="truncate font-medium text-foreground">{item.name}</span>
        {item.breadcrumbPath ? (
          <span className="truncate text-xs text-muted-foreground">
            {item.breadcrumbPath}
          </span>
        ) : null}
      </div>
      {hasExcerpt ? (
        <div className="flex items-start gap-2">
          <p
            className={cn(
              "min-w-0 flex-1 text-[13px] leading-snug text-muted-foreground",
              !expanded && "line-clamp-1"
            )}
          >
            {item.excerpt}
          </p>
          {canExpand ? (
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-[11px] text-wiki-accent hover:bg-wiki-accent/10"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleExpand();
              }}
              onPointerDown={(event) => {
                // 避免 cmdk 抢占选中
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              {expanded ? (
                <>
                  收起
                  <CaretUpIcon className="size-3" aria-hidden />
                </>
              ) : (
                <>
                  展开
                  <CaretDownIcon className="size-3" aria-hidden />
                </>
              )}
            </button>
          ) : null}
        </div>
      ) : null}
    </CommandItem>
  );
}

export function WikiSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<EntrySearchItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set()
  );

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

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setItems([]);
      setExpandedIds(new Set());
      setLoading(false);
    }
  }, [open]);

  React.useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const { items: next } = await searchEntries(trimmed, { limit: 12 });
        setItems(next);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [query]);

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function goToEntry(href: string) {
    setOpen(false);
    router.push(href);
  }

  const trimmedQuery = query.trim();
  const emptyLabel = !trimmedQuery
    ? "输入词条或博客名称开始搜索"
    : loading
      ? "搜索中…"
      : "未找到匹配的词条";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="搜索 Frontend Atlas"
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
        title="搜索 Frontend Atlas"
        description="按词条或博客名称搜索"
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
              value={query}
              onValueChange={setQuery}
              placeholder="搜索词条或博客名称"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <CommandList className="max-h-80">
            <CommandEmpty className="py-8 text-muted-foreground">
              {emptyLabel}
            </CommandEmpty>
            {items.length > 0 ? (
              <CommandGroup heading="搜索结果">
                {items.map((item) => (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    expanded={expandedIds.has(item.id)}
                    onToggleExpand={() => toggleExpanded(item.id)}
                    onSelect={() => goToEntry(item.href)}
                  />
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <SearchShortcut>↵</SearchShortcut>
              打开
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
