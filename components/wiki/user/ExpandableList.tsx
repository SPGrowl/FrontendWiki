"use client";

import { useState, type ReactNode } from "react";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { cn } from "@/lib/utils";

const DEFAULT_PREVIEW = 5;

interface ExpandableListProps {
  title: string;
  itemCount: number;
  emptyText: string;
  previewCount?: number;
  className?: string;
  children: (visibleRange: { start: number; end: number; expanded: boolean }) => ReactNode;
}

/**
 * 默认展示前 N 条；展开后在固定高度内滚动查看全部。
 * children 收到可见区间，由调用方 slice 数据渲染。
 */
export function ExpandableList({
  title,
  itemCount,
  emptyText,
  previewCount = DEFAULT_PREVIEW,
  className,
  children,
}: ExpandableListProps) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = itemCount > previewCount;
  const end = expanded || !canExpand ? itemCount : previewCount;

  return (
    <WikiCard padding="lg" className={cn("flex min-w-0 flex-col gap-3", className)}>
      <h2 className="text-sm font-semibold">{title}</h2>

      {itemCount === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <>
          <div
            className={cn(
              expanded && canExpand && "max-h-64 overflow-y-auto pr-1"
            )}
          >
            {children({ start: 0, end, expanded })}
          </div>

          {canExpand ? (
            <button
              type="button"
              className="self-start text-xs text-wiki-link hover:underline"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "收起" : `展开全部（${itemCount}）`}
            </button>
          ) : null}
        </>
      )}
    </WikiCard>
  );
}
