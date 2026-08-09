// components/wiki/card/WikiCard.tsx
import { cn } from "@/lib/utils";

interface WikiCardProps {
  children: React.ReactNode;
  className?: string;
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

  padding = "md",
  as: Tag = "section",
}: WikiCardProps) {
  return (
    <Tag
    // 根据传入的参数切换类名
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