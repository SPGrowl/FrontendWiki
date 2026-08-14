import type { ComponentProps } from "react";
import { parseMarkdownImageSrc } from "@/lib/wiki/markdown-image";
import { cn } from "@/lib/utils";

type MarkdownImageProps = ComponentProps<"img">;

/**
 * 正文 / 预览共用的图片渲染：
 * - 独占一行、居中（CSS 块级）
 * - 仅等比缩放（height: auto）
 * - URL `#scale=1`～`100` 表示相对正文栏宽度的百分比
 *
 * 使用 span 而非 figure，避免 react-markdown 包在 <p> 内时触发非法嵌套告警。
 */
export function MarkdownImage({
  src,
  alt,
  title,
  className,
  ...props
}: MarkdownImageProps) {
  const { src: cleanSrc, scalePercent } = parseMarkdownImageSrc(
    typeof src === "string" ? src : undefined
  );

  if (!cleanSrc) return null;

  const caption = (alt ?? "").trim();

  return (
    <span className="wiki-md-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...props}
        src={cleanSrc}
        alt={caption}
        title={title}
        loading="lazy"
        decoding="async"
        className={cn(
          "wiki-md-image",
          scalePercent != null && "wiki-md-image--scaled",
          className
        )}
        style={
          scalePercent != null
            ? { width: `${scalePercent}%`, maxWidth: "100%", height: "auto" }
            : undefined
        }
      />
      {caption ? (
        <span className="wiki-md-figcaption">{caption}</span>
      ) : null}
    </span>
  );
}
