"use client";

import { useRef, useState } from "react";
import { ImageIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  EditorViewModeToggle,
  type EditorViewMode,
} from "@/components/wiki/editor/editor-view-mode-toggle";
import { EntryEditorPreviewPanel } from "@/components/wiki/editor/entry-editor-preview-panel";
import { ImageAssetPicker } from "@/components/wiki/editor/image-asset-picker";
import {
  MarkdownEditor,
  type MarkdownEditorHandle,
} from "@/components/wiki/editor/markdown-editor";
import { MarkdownMergeEditor } from "@/components/wiki/editor/markdown-merge-editor";
import { cn } from "@/lib/utils";

interface EntryEditorWorkspaceProps {
  content: string;
  onChange: (value: string) => void;
  /** 现版本正文；提供时启用左右 diff 编辑 */
  baselineContent?: string;
  disabled?: boolean;
  contentId?: string;
  contentLabel?: string;
  previewLabel?: string;
  className?: string;
}

export function EntryEditorWorkspace({
  content,
  onChange,
  baselineContent,
  disabled = false,
  contentId = "entry-content",
  contentLabel = "正文（Markdown）",
  previewLabel = "预览",
  className,
}: EntryEditorWorkspaceProps) {
  const [viewMode, setViewMode] = useState<EditorViewMode>("source");
  const [pickerOpen, setPickerOpen] = useState(false);
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const isDiffMode = baselineContent !== undefined;

  function handleInsertMarkdown(markdown: string) {
    editorRef.current?.insertAtCursor(markdown);
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={disabled || viewMode !== "source"}
          title={
            viewMode !== "source"
              ? "请切换到编辑模式后再插入图片"
              : "打开图库选择图片"
          }
          onClick={() => setPickerOpen(true)}
        >
          <ImageIcon className="size-3.5" aria-hidden />
          插入图片
        </Button>
        <EditorViewModeToggle
          value={viewMode}
          onChange={setViewMode}
          disabled={disabled}
        />
      </div>

      {viewMode === "source" ? (
        isDiffMode ? (
          <MarkdownMergeEditor
            ref={editorRef}
            baseline={baselineContent}
            value={content}
            onChange={onChange}
            disabled={disabled}
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={contentId} className="text-xs font-medium">
              {contentLabel}
            </label>
            <MarkdownEditor
              ref={editorRef}
              id={contentId}
              value={content}
              onChange={onChange}
              disabled={disabled}
              adaptiveHeight
              maxHeight="125vh"
            />
          </div>
        )
      ) : isDiffMode ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
          <EntryEditorPreviewPanel label="现版本" content={baselineContent} />
          <EntryEditorPreviewPanel label="编辑中" content={content} />
        </div>
      ) : (
        <EntryEditorPreviewPanel label={previewLabel} content={content} />
      )}

      <ImageAssetPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        disabled={disabled}
        onInsert={handleInsertMarkdown}
      />
    </div>
  );
}
