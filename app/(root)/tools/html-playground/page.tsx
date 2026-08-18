"use client";

import { useEffect } from "react";
import { useHtmlPlayground } from "@/components/tools/html-playground/html-playground-context";

export default function HtmlPlaygroundPage() {
  const { openPlayground } = useHtmlPlayground();

  useEffect(() => {
    openPlayground();
  }, [openPlayground]);

  return (
    <div className="rounded-lg border border-border/60 bg-card p-6 text-sm shadow-sm ring-1 ring-foreground/5">
      <h1 className="text-lg font-semibold">HTML Playground</h1>
      <p className="mt-2 text-muted-foreground">
        实验性功能：左栏编辑完整 HTML，右栏预览渲染效果。拖动中间分隔条可改变预览宽度，便于查看媒体查询。
      </p>
      <button
        type="button"
        onClick={() => openPlayground()}
        className="wiki-btn-primary mt-4"
      >
        打开 Playground
      </button>
    </div>
  );
}
