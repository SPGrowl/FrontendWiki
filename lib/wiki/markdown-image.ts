/** 正文图片缩放：仅等比缩放，用 URL hash 约定 `#scale=1`～`#scale=100`（可写 `%`） */

/** 整段 hash 必须完全匹配；不支持多参数或其它 fragment */
const SCALE_HASH = /^scale=(\d{1,3})%?$/i;

export const MARKDOWN_IMAGE_SCALE_MIN = 1;
export const MARKDOWN_IMAGE_SCALE_MAX = 100;
/** 图库插入时的默认比例 */
export const MARKDOWN_IMAGE_DEFAULT_SCALE = 75;

export interface ParsedMarkdownImageSrc {
  /** 去掉 scale 参数后的实际请求地址 */
  src: string;
  /** 相对正文栏宽度的百分比；未写或无效则为 null（走默认样式） */
  scalePercent: number | null;
}

function parseScaleHash(hash: string): number | null {
  const match = SCALE_HASH.exec(hash);
  if (!match) return null;

  const n = Number.parseInt(match[1], 10);
  if (n < MARKDOWN_IMAGE_SCALE_MIN || n > MARKDOWN_IMAGE_SCALE_MAX) {
    return null;
  }
  return n;
}

/** 仅用于图库/编辑器写入；保证输出 1～100 */
function normalizeScaleForWrite(value: number): number {
  if (!Number.isFinite(value)) return MARKDOWN_IMAGE_DEFAULT_SCALE;
  return Math.min(
    MARKDOWN_IMAGE_SCALE_MAX,
    Math.max(MARKDOWN_IMAGE_SCALE_MIN, Math.round(value))
  );
}

/**
 * 从 Markdown 图片 URL 解析缩放。
 * 例：`/uploads/a.webp#scale=50`、`/uploads/a.webp#scale=50%`
 * hash 非单独 `scale=1～100` 时整段忽略，按未指定比例渲染。
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

  const scalePercent =
    hash && !hash.includes("&") ? parseScaleHash(hash) : null;

  return { src: base, scalePercent };
}

/** 去掉已有 hash，写入等比缩放（覆盖旧 scale） */
export function withMarkdownImageScale(
  url: string,
  scalePercent: number
): string {
  const hashIndex = url.indexOf("#");
  const base = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const scale = normalizeScaleForWrite(scalePercent);
  return `${base}#scale=${scale}`;
}
