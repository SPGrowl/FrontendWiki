"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchEntries } from "@/lib/api/entries";
import { cn } from "@/lib/utils";
import type { EntrySearchItem } from "@/type/entry-api";

/** 顶级词条哨兵：选中表示 parentId = null */
export const ROOT_PARENT_SENTINEL_ID = "__root__";

export const ROOT_PARENT_OPTION: EntrySearchItem = {
  id: ROOT_PARENT_SENTINEL_ID,
  name: "顶级词条",
  href: "/entry",
  breadcrumbs: [],
  breadcrumbPath: "/",
  excerpt: "",
};

interface ParentEntryPickerProps {
  value: EntrySearchItem | null;
  /** null = 顶级（无父节点） */
  onChange: (value: EntrySearchItem | null) => void;
  excludeEntryId?: string;
  /** 是否要求必须有选择（含顶级）；默认显示已选卡片 */
  label?: string;
  hint?: string;
}

function isRootSelection(value: EntrySearchItem | null): boolean {
  return value === null || value.id === ROOT_PARENT_SENTINEL_ID;
}

export function ParentEntryPicker({
  value,
  onChange,
  excludeEntryId,
  label = "父词条",
  hint = "搜索并选择父级；列表底部「顶级词条」表示无父节点",
}: ParentEntryPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EntrySearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const { items } = await searchEntries(trimmed, { type: "common" });
        setResults(
          excludeEntryId
            ? items.filter((item) => item.id !== excludeEntryId)
            : items
        );
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, excludeEntryId]);

  function handleSelect(item: EntrySearchItem) {
    if (item.id === ROOT_PARENT_SENTINEL_ID) {
      onChange(null);
    } else {
      onChange(item);
    }
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function handleClearParent() {
    onChange(null);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  const showDropdown = open;
  const hasQuery = Boolean(query.trim());

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="parent-entry-search" className="text-xs font-medium">
        {label}
      </label>
      <p className="text-xs text-muted-foreground">{hint}</p>

      {isRootSelection(value) ? (
        <div className="flex items-center gap-2 rounded-none border border-border bg-muted/30 px-2.5 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <div className="font-medium">{ROOT_PARENT_OPTION.name}</div>
            <div className="truncate text-muted-foreground">
              {ROOT_PARENT_OPTION.breadcrumbPath}
              <span className="ml-1 text-muted-foreground/80">
                （无父节点）
              </span>
            </div>
          </div>
        </div>
      ) : value ? (
        <div className="flex items-center gap-2 rounded-none border border-border bg-muted/30 px-2.5 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <div className="font-medium">{value.name}</div>
            <div className="truncate text-muted-foreground">
              {value.breadcrumbPath}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="改为顶级词条"
            onClick={handleClearParent}
          >
            <XIcon />
          </Button>
        </div>
      ) : null}

      <div className="relative">
        <Input
          id="parent-entry-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          placeholder="按词条名搜索父级…"
          autoComplete="off"
        />

        {showDropdown ? (
          <div className="absolute top-full z-50 mt-1 w-full border border-border bg-popover shadow-md">
            {hasQuery && loading ? (
              <p className="px-2.5 py-3 text-xs text-muted-foreground">搜索中…</p>
            ) : (
              <ul className="max-h-56 overflow-y-auto">
                {hasQuery && !loading && results.length === 0 ? (
                  <li className="px-2.5 py-2 text-xs text-muted-foreground">
                    未找到匹配词条
                  </li>
                ) : null}
                {results.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 px-2.5 py-2 text-left text-xs",
                        "hover:bg-muted"
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelect(item)}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.breadcrumbPath}
                      </span>
                    </button>
                  </li>
                ))}
                <li className="border-t border-border">
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 px-2.5 py-2 text-left text-xs",
                      "hover:bg-muted",
                      isRootSelection(value) && "bg-muted/60"
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(ROOT_PARENT_OPTION)}
                  >
                    <span className="font-medium">
                      {ROOT_PARENT_OPTION.name}
                    </span>
                    <span className="text-muted-foreground">
                      / · 没有父节点的顶级词条
                    </span>
                  </button>
                </li>
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
