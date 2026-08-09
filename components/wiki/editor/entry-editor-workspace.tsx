"use client";

import { useState } from "react";
import { EntryContent } from "@/components/wiki/entry/EntryContent";
import { MarkdownEditor } from "@/components/wiki/editor/markdown-editor";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { cn } from "@/lib/utils";

interface EntryEditorWorkspaceProps {
  content: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  contentId?: string;
  contentLabel?: string;
  previewLabel?: string;
  className?: string;
}

export function EntryEditorWorkspace({
  content,
  onChange,
  disabled = false,
  contentId = "entry-content",
  contentLabel = "正文（Markdown）",
  previewLabel = "预览",
  className,
}: EntryEditorWorkspaceProps) {
  const trimmedContent = content.trim();
  const [editorHeightPx, setEditorHeightPx] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start",
        className
      )}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor={contentId} className="text-xs font-medium">
          {contentLabel}
        </label>
        <MarkdownEditor
          id={contentId}
          value={content}
          onChange={onChange}
          disabled={disabled}
          adaptiveHeight
          maxHeight="125vh"
          onHeightChange={setEditorHeightPx}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">{previewLabel}</span>
        <WikiCard
          padding="md"
          className="max-h-[125vh] overflow-y-auto"
          style={{
            height: editorHeightPx ? `${editorHeightPx}px` : "24rem",
          }}
        >
          {trimmedContent ? (
            <EntryContent content={content} />
          ) : (
            <p className="text-sm text-muted-foreground">
              正文预览将显示在此处
            </p>
          )}
        </WikiCard>
      </div>
    </div>
  );
}
