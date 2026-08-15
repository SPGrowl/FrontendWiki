"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CaretRightIcon } from "@phosphor-icons/react";
import type { BreadcrumbItem } from "@/type/entry";
import { cn } from "@/lib/utils";

interface EntryBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function EntryBreadcrumb({ items, className }: EntryBreadcrumbProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    const end = endRef.current;
    if (!container || !end) return;

    container.scrollLeft = container.scrollWidth;
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className={cn(
        "min-w-0 flex-1 overflow-x-auto border-b border-border bg-muted/25",
        "[scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5",
        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
        className
      )}
      aria-label="面包屑导航"
    >
      <ol className="flex min-w-max items-center justify-end gap-1 px-3 py-1.5 text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.href} className="flex shrink-0 items-center gap-1">
              {index > 0 ? (
                <CaretRightIcon
                  className="size-3 shrink-0 text-muted-foreground/70"
                  aria-hidden
                />
              ) : null}
              {isLast ? (
                <span
                  ref={endRef}
                  aria-current="page"
                  className="font-medium text-foreground"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-wiki-link hover:underline"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
