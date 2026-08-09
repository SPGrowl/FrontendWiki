"use client";

import { EntryContent } from "@/components/wiki/entry/EntryContent";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { cn } from "@/lib/utils";

interface EntryEditorPreviewPanelProps {
  label: string;
  content: string;
  className?: string;
  minHeight?: string;
}

export function EntryEditorPreviewPanel({
  label,
  content,
  className,
  minHeight = "24rem",
}: EntryEditorPreviewPanelProps) {
  const trimmedContent = content.trim();

  return (
    <div className={cn("flex min-h-0 flex-col gap-1.5", className)}>
      <span className="text-xs font-medium">{label}</span>
      <WikiCard
        padding="md"
        className="max-h-[125vh] min-h-[var(--preview-min-height)] overflow-y-auto"
        style={{ "--preview-min-height": minHeight } as React.CSSProperties}
      >
        {trimmedContent ? (
          <EntryContent content={content} />
        ) : (
          <p className="text-sm text-muted-foreground">暂无内容</p>
        )}
      </WikiCard>
    </div>
  );
}
