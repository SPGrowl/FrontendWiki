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
        // 视觉层
        "box-border m-0 border border-[#8d8d8d] bg-[#f6f9fa] text-inherit",
        // 尺寸：由内容撑开，不限制内部
        "h-auto w-auto",
        // 内边距
        paddingMap[padding],
        className
      )}
    >
      {children}
    </Tag>
  );
}