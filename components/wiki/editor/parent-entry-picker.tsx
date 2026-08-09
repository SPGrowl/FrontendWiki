"use client";

import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchEntries } from "@/lib/api/entries";
import { cn } from "@/lib/utils";
import type { EntrySearchItem } from "@/type/entry-api";

interface ParentEntryPickerProps {
  value: EntrySearchItem | null;
  onChange: (value: EntrySearchItem | null) => void;
  excludeEntryId?: string;
}

export function ParentEntryPicker({
  value,
  onChange,
  excludeEntryId,
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
        const { items } = await searchEntries(trimmed);
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
    onChange(item);
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

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="parent-entry-search" className="text-xs font-medium">
        父词条
      </label>
      <p className="text-xs text-muted-foreground">
        选择「子词条」时，在此搜索并指定父级词条
      </p>

      {value ? (
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
            aria-label="清除父词条"
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
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder="按词条名搜索父级…"
          autoComplete="off"
        />

        {open && query.trim() ? (
          <div className="absolute top-full z-50 mt-1 w-full border border-border bg-popover shadow-md">
            {loading ? (
              <p className="px-2.5 py-3 text-xs text-muted-foreground">搜索中…</p>
            ) : results.length === 0 ? (
              <p className="px-2.5 py-3 text-xs text-muted-foreground">
                未找到匹配词条
              </p>
            ) : (
              <ul className="max-h-56 overflow-y-auto">
                {results.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 px-2.5 py-2 text-left text-xs",
                        "hover:bg-muted"
                      )}
                      onClick={() => handleSelect(item)}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.breadcrumbPath}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
