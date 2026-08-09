"use client";

import * as React from "react";
import { CheckIcon, CopyIcon, PlayIcon } from "@phosphor-icons/react";
import { useJsRunner } from "@/components/tools/js-runner/js-runner-context";
import { isRunnableJsLanguage } from "@/lib/wiki/is-runnable-js";
import { cn } from "@/lib/utils";

interface MarkdownCodeBlockProps {
  language: string;
  code: string;
}

export function MarkdownCodeBlock({ language, code }: MarkdownCodeBlockProps) {
  const { openRunner } = useJsRunner();
  const [copied, setCopied] = React.useState(false);
  const runnable = isRunnableJsLanguage(language);
  const label = language || "text";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // 剪贴板不可用时静默失败
    }
  };

  return (
    <div className="wiki-code-block my-3 overflow-hidden rounded-md border border-border/50 bg-wiki-code-bg">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-1.5">
        <span className="truncate text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className={cn(
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]",
              "text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            )}
          >
            {copied ? (
              <CheckIcon className="size-3" weight="bold" aria-hidden />
            ) : (
              <CopyIcon className="size-3" aria-hidden />
            )}
            {copied ? "已复制" : "复制"}
          </button>
          {runnable && (
            <button
              type="button"
              onClick={() => openRunner({ code })}
              className={cn(
                "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]",
                "text-wiki-link transition-colors",
                "hover:bg-wiki-accent-muted hover:text-wiki-accent",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              )}
            >
              <PlayIcon className="size-3" weight="fill" aria-hidden />
              在沙盒中运行
            </button>
          )}
        </div>
      </div>
      <pre className="m-0 overflow-x-auto p-3 text-[0.8125rem] leading-relaxed">
        <code className="bg-transparent p-0 font-mono whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}
