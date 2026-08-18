"use client";

import * as React from "react";
import { XIcon } from "@phosphor-icons/react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { cn } from "@/lib/utils";
import { DEFAULT_HTML } from "@/lib/tools/html-playground/default-html";
import { useHtmlPlayground } from "./html-playground-context";

export function HtmlPlaygroundPanel() {
  const { open, closePlayground, pendingHtml, clearPendingHtml } =
    useHtmlPlayground();
  const [source, setSource] = React.useState(DEFAULT_HTML);
  const [previewHtml, setPreviewHtml] = React.useState(DEFAULT_HTML);
  const [iframeKey, setIframeKey] = React.useState(0);
  const [previewWidth, setPreviewWidth] = React.useState<number | null>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || pendingHtml == null) return;
    setSource(pendingHtml);
    setPreviewHtml("");
    setIframeKey((key) => key + 1);
    clearPendingHtml();
  }, [open, pendingHtml, clearPendingHtml]);

  React.useEffect(() => {
    const el = previewRef.current;
    if (!open || !el) return;

    const observer = new ResizeObserver(([entry]) => {
      setPreviewWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  const handleRun = React.useCallback(() => {
    setPreviewHtml(source);
    setIframeKey((key) => key + 1);
  }, [source]);

  const handleClear = () => {
    setSource("");
    setPreviewHtml("");
    setIframeKey((key) => key + 1);
  };

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        handleRun();
      }
      if (event.key === "Escape") {
        closePlayground();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleRun, closePlayground]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="关闭 HTML Playground"
        className="absolute inset-0 bg-black/40"
        onClick={closePlayground}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="html-playground-title"
        className={cn(
          "relative flex h-[min(800px,92vh)] w-full max-w-6xl flex-col overflow-hidden",
          "rounded-lg border border-border bg-card shadow-xl ring-1 ring-foreground/10"
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 id="html-playground-title" className="text-sm font-semibold">
              HTML Playground
            </h2>
            <p className="text-xs text-muted-foreground">
              隔离沙盒 · Ctrl/⌘ + Enter 运行 · Esc 关闭 · 拖动中间分隔条改变预览宽度
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              预览宽度 {previewWidth ?? "—"}px
            </span>
            <button
              type="button"
              aria-label="关闭"
              onClick={closePlayground}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col p-3">
          <Group
            orientation="horizontal"
            className="h-full min-h-0 flex-1 overflow-hidden rounded-md border border-border"
          >
            <Panel defaultSize="50%" minSize="20%" className="min-w-0">
              <textarea
                value={source}
                onChange={(event) => setSource(event.target.value)}
                spellCheck={false}
                className={cn(
                  "h-full w-full resize-none border-0 bg-background p-3",
                  "font-mono text-xs leading-relaxed text-foreground outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                )}
                placeholder="输入完整 HTML 文档…"
              />
            </Panel>

            <Separator
              className={cn(
                "w-1.5 bg-border transition-colors",
                "hover:bg-foreground/20 focus-visible:bg-foreground/30 focus-visible:outline-none"
              )}
            />

            <Panel defaultSize="50%" minSize="15%" className="min-w-0">
              <div ref={previewRef} className="h-full w-full bg-white">
                <iframe
                  key={iframeKey}
                  title="HTML 预览"
                  className="h-full w-full border-0 bg-white"
                  sandbox="allow-scripts allow-modals"
                  srcDoc={previewHtml}
                />
              </div>
            </Panel>
          </Group>
        </div>

        <footer className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={handleRun}
            className="wiki-btn-primary px-5"
          >
            运行
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="wiki-btn-secondary px-5"
          >
            清空
          </button>
          <button
            type="button"
            onClick={closePlayground}
            className="wiki-btn-secondary px-5"
          >
            关闭
          </button>
          <span className="ml-auto text-xs text-muted-foreground sm:hidden">
            预览 {previewWidth ?? "—"}px
          </span>
        </footer>
      </section>
    </div>
  );
}
