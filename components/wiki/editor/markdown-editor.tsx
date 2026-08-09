"use client";

import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createMarkdownEditorExtensions } from "@/lib/wiki/codemirror/markdown-extensions";
import {
  clampEditorHeightPx,
  resolveEditorHeightBoundsPx,
} from "@/lib/wiki/codemirror/editor-height";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  adaptiveHeight?: boolean;
  onHeightChange?: (heightPx: number) => void;
}

export function MarkdownEditor({
  id,
  value,
  onChange,
  placeholder = "在此编写 Markdown 正文…",
  disabled = false,
  className,
  minHeight = "24rem",
  maxHeight = "125vh",
  adaptiveHeight = false,
  onHeightChange,
}: MarkdownEditorProps) {
  const viewRef = useRef<EditorView | null>(null);
  const [heightPx, setHeightPx] = useState<number | null>(null);

  const syncHeight = useCallback(
    (view: EditorView) => {
      const { minPx, maxPx } = resolveEditorHeightBoundsPx(minHeight, maxHeight);
      const next = clampEditorHeightPx(view.contentHeight, minPx, maxPx);

      setHeightPx((previous) => {
        if (previous === next) return previous;
        onHeightChange?.(next);
        return next;
      });
    },
    [maxHeight, minHeight, onHeightChange]
  );

  useEffect(() => {
    if (!adaptiveHeight) return;

    const handleResize = () => {
      if (viewRef.current) {
        syncHeight(viewRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adaptiveHeight, syncHeight]);

  const extensions = useMemo(() => {
    const base = [createMarkdownEditorExtensions(), EditorView.lineWrapping];

    if (!adaptiveHeight) {
      return base;
    }

    return [
      ...base,
      EditorView.updateListener.of((update) => {
        if (update.docChanged || update.geometryChanged) {
          syncHeight(update.view);
        }
      }),
    ];
  }, [adaptiveHeight, syncHeight]);

  const height = adaptiveHeight
    ? heightPx !== null
      ? `${heightPx}px`
      : minHeight
    : minHeight;

  return (
    <div
      id={id}
      className={cn(
        "wiki-markdown-editor overflow-hidden rounded-none border border-input bg-background",
        "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50",
        "dark:bg-input/30",
        adaptiveHeight && "wiki-markdown-editor--adaptive",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <CodeMirror
        value={value}
        height={height}
        theme="none"
        basicSetup={false}
        editable={!disabled}
        readOnly={disabled}
        placeholder={placeholder}
        extensions={extensions}
        onChange={onChange}
        onCreateEditor={(view) => {
          viewRef.current = view;
          if (adaptiveHeight) {
            syncHeight(view);
          }
        }}
        className="text-xs [&_.cm-editor]:outline-none [&_.cm-editor.cm-focused]:outline-none"
      />
    </div>
  );
}
