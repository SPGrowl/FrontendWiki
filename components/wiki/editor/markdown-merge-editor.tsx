"use client";

import { MergeView } from "@codemirror/merge";
import { useEffect, useRef } from "react";
import {
  createEditableMarkdownEditorExtensions,
  createReadOnlyMarkdownEditorExtensions,
} from "@/lib/wiki/codemirror/markdown-extensions";
import { cn } from "@/lib/utils";

interface MarkdownMergeEditorProps {
  baseline: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  baselineLabel?: string;
  editLabel?: string;
  className?: string;
}

export function MarkdownMergeEditor({
  baseline,
  value,
  onChange,
  disabled = false,
  baselineLabel = "现版本",
  editLabel = "编辑中",
  className,
}: MarkdownMergeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mergeRef = useRef<MergeView | null>(null);
  const onChangeRef = useRef(onChange);
  const syncingRef = useRef(false);

  onChangeRef.current = onChange;

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const merge = new MergeView({
      a: {
        doc: baseline,
        extensions: createReadOnlyMarkdownEditorExtensions(),
      },
      b: {
        doc: value,
        extensions: [
          ...createEditableMarkdownEditorExtensions({
            onDocChange: (nextValue) => {
              if (syncingRef.current) return;
              onChangeRef.current(nextValue);
            },
          }),
        ],
      },
      parent,
      highlightChanges: true,
      gutter: true,
      collapseUnchanged: { margin: 3, minSize: 4 },
      revertControls: "a-to-b",
    });

    mergeRef.current = merge;

    return () => {
      merge.destroy();
      mergeRef.current = null;
    };
    // Mount once; external updates sync through dedicated effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const merge = mergeRef.current;
    if (!merge) return;

    const current = merge.b.state.doc.toString();
    if (current === value) return;

    syncingRef.current = true;
    merge.b.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
    syncingRef.current = false;
  }, [value]);

  useEffect(() => {
    const merge = mergeRef.current;
    if (!merge) return;

    const current = merge.a.state.doc.toString();
    if (current === baseline) return;

    syncingRef.current = true;
    merge.a.dispatch({
      changes: { from: 0, to: current.length, insert: baseline },
    });
    syncingRef.current = false;
  }, [baseline]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="grid grid-cols-2 gap-3 text-xs font-medium">
        <span>{baselineLabel}</span>
        <span>{editLabel}</span>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "wiki-markdown-merge-editor overflow-hidden rounded-none border border-input bg-background",
          "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50",
          "dark:bg-input/30",
          disabled && "pointer-events-none opacity-50"
        )}
      />
    </div>
  );
}
