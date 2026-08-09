"use client";

import type { EntryCreateType } from "@/type/entry-api";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{
  value: EntryCreateType;
  label: string;
  description: string;
}> = [
  {
    value: "common",
    label: "百科词条",
    description: "挂在词条树下；可选顶级或指定父词条",
  },
  {
    value: "blog",
    label: "博客",
    description: "固定路径 /entry/blog/{别名}，创建后类型不可改",
  },
];

interface EntryTypePickerProps {
  value: EntryCreateType;
  onChange: (value: EntryCreateType) => void;
  disabled?: boolean;
}

/** 创建时选定词条类型（创建后不可变） */
export function EntryPublishTargetPicker({
  value,
  onChange,
  disabled,
}: EntryTypePickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">词条类型</span>
      <div className="grid gap-2 sm:grid-cols-2">
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
