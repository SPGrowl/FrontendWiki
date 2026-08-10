"use client";

import { MergeView } from "@codemirror/merge";
import { useEffect, useRef } from "react";
import { createReadOnlyMarkdownEditorExtensions } from "@/lib/wiki/codemirror/markdown-extensions";
import { cn } from "@/lib/utils";

interface MarkdownDiffViewerProps {
  left: string;
  right: string;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

/** 只读左右对比，交互与编辑页 MergeView 一致（不可编辑） */
export function MarkdownDiffViewer({
  left,
  right,
  leftLabel = "较旧版本",
  rightLabel = "较新版本",
  className,
}: MarkdownDiffViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const merge = new MergeView({
      a: {
        doc: left,
        extensions: createReadOnlyMarkdownEditorExtensions(),
      },
      b: {
        doc: right,
        extensions: createReadOnlyMarkdownEditorExtensions(),
      },
      parent,
      highlightChanges: true,
      gutter: true,
      collapseUnchanged: { margin: 3, minSize: 4 },
    });

    return () => {
      merge.destroy();
    };
  }, [left, right]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="grid grid-cols-2 gap-3 text-xs font-medium">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div
        ref={containerRef}
        className={cn(
          "wiki-markdown-merge-editor overflow-hidden rounded-none border border-input bg-background",
          "dark:bg-input/30"
        )}
      />
    </div>
  );
}
