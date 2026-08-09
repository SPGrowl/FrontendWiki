"use client";

import type { EntryPublishTarget } from "@/type/entry-api";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{
  value: EntryPublishTarget;
  label: string;
  description: string;
}> = [
  {
    value: "root",
    label: "根级词条",
    description: "与 JavaScript 同级，如 /entry/css",
  },
  {
    value: "child",
    label: "子词条",
    description: "挂在已有词条下，如 /entry/javascript/es6",
  },
  {
    value: "blog",
    label: "博客",
    description: "发布到博客模块，路径为 /entry/blog/词条ID",
  },
];

interface EntryPublishTargetPickerProps {
  value: EntryPublishTarget;
  onChange: (value: EntryPublishTarget) => void;
  disabled?: boolean;
}

export function EntryPublishTargetPicker({
  value,
  onChange,
  disabled,
}: EntryPublishTargetPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">发布位置</span>
      <div className="grid gap-2 sm:grid-cols-3">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col items-start gap-1 border px-2.5 py-2 text-left text-xs transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted/50",
                disabled && "pointer-events-none opacity-50"
              )}
            >
              <span className="font-medium">{option.label}</span>
              <span className="text-muted-foreground">{option.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
