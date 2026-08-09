// components/wiki/card/WikiCard.tsx
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WikiCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: "none" | "sm" | "md" | "lg";
  as?: "div" | "section" | "article";
}

const paddingMap = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
} as const;

export function WikiCard({
  children,
  className,
  style,
  padding = "md",
  as: Tag = "section",
}: WikiCardProps) {
  return (
    <Tag
      style={style}
      className={cn(
        "box-border m-0 w-auto min-h-0 rounded-lg border border-border/60 bg-card text-card-foreground shadow-sm ring-1 ring-foreground/5 transition-shadow duration-200 hover:shadow-md",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </Tag>
  );
}