"use client";

import * as React from "react";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { formatDisplayValue, formatLogArgs } from "@/lib/tools/js-runner/format-value";
import { runInSandbox } from "@/lib/tools/js-runner/run-in-sandbox";
import type { LogEntry } from "@/lib/tools/js-runner/types";
import { useJsRunner } from "./js-runner-context";

const DEFAULT_CODE = `// 使用 console.log 输出结果，最后一行的返回值也会显示
console.log(typeof null);
console.log([] + {});
console.log(NaN === NaN);

// 示例：手写 bind
Function.prototype.myBind = function (ctx, ...args) {
  const fn = this;
  return function (...rest) {
    return fn.apply(ctx, [...args, ...rest]);
  };
};
`;

type OutputLine =
  | { kind: "log"; entry: LogEntry }
  | { kind: "return"; value: unknown }
  | { kind: "error"; message: string };

const logTypeClass: Record<LogEntry["type"], string> = {
  log: "text-foreground",
  info: "text-wiki-link",
  warn: "text-amber-600 dark:text-amber-400",
  error: "text-destructive",
};

export function JsRunnerPanel() {
  const { open, closeRunner } = useJsRunner();
  const [code, setCode] = React.useState(DEFAULT_CODE);
  const [output, setOutput] = React.useState<OutputLine[]>([]);
  const [running, setRunning] = React.useState(false);
  const outputRef = React.useRef<HTMLPreElement>(null);

  const handleRun = React.useCallback(async () => {
    setRunning(true);
    setOutput([]);

    const result = await runInSandbox(code);

    const lines: OutputLine[] = result.logs.map((entry) => ({
      kind: "log",
      entry,
    }));

    if (result.success) {
      lines.push({ kind: "return", value: result.returnValue });
    } else if (result.error) {
      lines.push({ kind: "error", message: result.error });
    }

    setOutput(lines);
    setRunning(false);
  }, [code]);

  const handleClear = () => {
    setCode("");
    setOutput([]);
  };

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        void handleRun();
      }
      if (event.key === "Escape") {
        closeRunner();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleRun, closeRunner]);

  React.useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [output]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="关闭 JS 运行器"
        className="absolute inset-0 bg-black/40"
        onClick={closeRunner}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="js-runner-title"
        className={cn(
          "relative flex h-[min(640px,90vh)] w-full max-w-3xl flex-col overflow-hidden",
          "rounded-lg border border-border bg-card shadow-xl ring-1 ring-foreground/10"
        )}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 id="js-runner-title" className="text-sm font-semibold">
              JS 运行器
            </h2>
            <p className="text-xs text-muted-foreground">
              隔离沙盒 · Ctrl/⌘ + Enter 运行 · Esc 关闭
            </p>
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={closeRunner}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            spellCheck={false}
            className={cn(
              "min-h-[180px] flex-1 resize-none rounded-md border border-border bg-background p-3",
              "font-mono text-xs leading-relaxed text-foreground outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring"
            )}
            placeholder="// 输入 JavaScript 代码…"
          />

          <pre
            ref={outputRef}
            className={cn(
              "max-h-40 min-h-24 overflow-auto rounded-md border border-border bg-muted/40 p-3",
              "font-mono text-xs leading-relaxed whitespace-pre-wrap"
            )}
          >
            {output.length === 0 ? (
              <span className="text-muted-foreground">运行结果将显示在这里…</span>
            ) : (
              output.map((line, index) => {
                if (line.kind === "log") {
                  return (
                    <div key={index} className={logTypeClass[line.entry.type]}>
                      <span className="text-muted-foreground">
                        [{line.entry.type}]{" "}
                      </span>
                      {formatLogArgs(line.entry.args)}
                    </div>
                  );
                }

                if (line.kind === "return") {
                  return (
                    <div key={index} className="text-wiki-accent">
                      <span className="text-muted-foreground">=&gt; </span>
                      {formatDisplayValue(line.value)}
                    </div>
                  );
                }

                return (
                  <div key={index} className="text-destructive">
                    Error: {line.message}
                  </div>
                );
              })
            )}
          </pre>
        </div>

        <footer className="flex shrink-0 gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={() => void handleRun()}
            disabled={running}
            className="wiki-btn-primary px-5 disabled:opacity-50"
          >
            {running ? "运行中…" : "运行"}
          </button>
          <button type="button" onClick={handleClear} className="wiki-btn-secondary px-5">
            清空
          </button>
          <button type="button" onClick={closeRunner} className="wiki-btn-secondary px-5">
            关闭
          </button>
        </footer>
      </section>
    </div>
  );
}
