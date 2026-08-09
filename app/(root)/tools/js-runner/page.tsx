"use client";

import { useEffect } from "react";
import { useJsRunner } from "@/components/tools/js-runner/js-runner-context";

export default function JsRunnerPage() {
  const { openRunner } = useJsRunner();

  useEffect(() => {
    openRunner();
  }, [openRunner]);

  return (
    <div className="rounded-lg border border-border/60 bg-card p-6 text-sm shadow-sm ring-1 ring-foreground/5">
      <h1 className="text-lg font-semibold">JS 运行器</h1>
      <p className="mt-2 text-muted-foreground">
        运行器面板已打开。若未看到浮层，请点击侧栏「JS 运行器」或使用下方按钮。
      </p>
      <button type="button" onClick={openRunner} className="wiki-btn-primary mt-4">
        打开运行器
      </button>
    </div>
  );
}
