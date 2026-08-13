"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  xs: "size-5 text-[9px]",
  sm: "size-6 text-[10px]",
  md: "size-7 text-[10px]",
  lg: "size-8 text-xs",
  xl: "size-16 text-xl",
} as const;

export type UserAvatarSize = keyof typeof SIZE_CLASS;

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  size?: UserAvatarSize;
  className?: string;
}

function Placeholder({
  name,
  size,
  className,
}: {
  name: string;
  size: UserAvatarSize;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold uppercase text-muted-foreground",
        SIZE_CLASS[size],
        className
      )}
    >
      {name.slice(0, 1) || "?"}
    </span>
  );
}

/** 有有效 URL 时显示图片；加载失败或空值时回退字母占位 */
export function UserAvatar({
  name,
  avatar,
  size = "md",
  className,
}: UserAvatarProps) {
  const src = avatar?.trim() || "";
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <Placeholder name={name} size={size} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={cn(
        "shrink-0 rounded-full object-cover",
        SIZE_CLASS[size],
        className
      )}
      onError={() => setFailed(true)}
    />
  );
}
