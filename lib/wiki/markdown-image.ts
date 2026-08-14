/** 正文图片缩放：仅等比缩放，用 URL hash 约定 `#scale=1`～`#scale=100`（可写 `%`） */

const SCALE_PARAM = /^scale=(\d{1,3})%?$/i;

export const MARKDOWN_IMAGE_SCALE_MIN = 1;
export const MARKDOWN_IMAGE_SCALE_MAX = 100;
/** 图库插入时的默认比例 */
export const MARKDOWN_IMAGE_DEFAULT_SCALE = 75;

export interface ParsedMarkdownImageSrc {
  /** 去掉 scale 参数后的实际请求地址 */
  src: string;
  /** 相对正文栏宽度的百分比；未写则为 null（走默认样式） */
  scalePercent: number | null;
}

function clampScale(value: number): number {
  if (!Number.isFinite(value)) return MARKDOWN_IMAGE_DEFAULT_SCALE;
  return Math.min(
    MARKDOWN_IMAGE_SCALE_MAX,
    Math.max(MARKDOWN_IMAGE_SCALE_MIN, Math.round(value))
  );
}

/**
 * 从 Markdown 图片 URL 解析缩放。
 * 例：`/uploads/a.webp#scale=50`、`/uploads/a.webp#scale=50%`
 * 其它 hash 片段会保留在 src 上。
 */
export function parseMarkdownImageSrc(
  raw: string | null | undefined
): ParsedMarkdownImageSrc {
  if (!raw) return { src: "", scalePercent: null };

  const hashIndex = raw.indexOf("#");
  if (hashIndex === -1) {
    return { src: raw, scalePercent: null };
  }

  const base = raw.slice(0, hashIndex);
  const hash = raw.slice(hashIndex + 1);
  if (!hash) {
    return { src: base, scalePercent: null };
  }

  const parts = hash.split("&").filter(Boolean);
  let scalePercent: number | null = null;
  const kept: string[] = [];

  for (const part of parts) {
    const match = SCALE_PARAM.exec(part);
    if (match) {
      scalePercent = clampScale(Number.parseInt(match[1], 10));
      continue;
    }
    kept.push(part);
  }

  const src = kept.length > 0 ? `${base}#${kept.join("&")}` : base;
  return { src, scalePercent };
}

/** 把等比缩放写回 URL（覆盖已有 scale） */
export function withMarkdownImageScale(
  url: string,
  scalePercent: number
): string {
  const { src } = parseMarkdownImageSrc(url);
  const scale = clampScale(scalePercent);
  return `${src}#scale=${scale}`;
}
