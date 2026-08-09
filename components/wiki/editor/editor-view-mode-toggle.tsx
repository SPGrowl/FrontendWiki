"use client";

import { cn } from "@/lib/utils";

export type EditorViewMode = "source" | "preview";

interface EditorViewModeToggleProps {
  value: EditorViewMode;
  onChange: (value: EditorViewMode) => void;
  disabled?: boolean;
}

const modes: { value: EditorViewMode; label: string }[] = [
  { value: "source", label: "源码" },
  { value: "preview", label: "预览" },
];

export function EditorViewModeToggle({
  value,
  onChange,
  disabled = false,
}: EditorViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="编辑视图"
      className="inline-flex rounded-none border border-border bg-muted p-0.5"
    >
      {modes.map((mode) => {
        const isActive = value === mode.value;

        return (
          <button
            key={mode.value}
            type="button"
            disabled={disabled}
            aria-pressed={isActive}
            onClick={() => onChange(mode.value)}
            className={cn(
              "rounded-none px-2.5 py-1 text-xs transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              isActive
                ? "bg-background font-medium text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
