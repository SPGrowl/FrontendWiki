/** 搜索列表 / 悬停预览共用的正文缩略长度 */
export const ENTRY_EXCERPT_MAX_LEN = 200;
/** 搜索列表默认折叠展示时可再截短（CSS line-clamp 为主，此作兜底） */
export const ENTRY_EXCERPT_SEARCH_PREVIEW_LEN = 100;

/**
 * 将 Markdown 粗略转为纯文本，供摘要展示（非完整解析器）。
 */
export function markdownToPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 从词条正文生成缩略文案（不落库、无独立 summary 字段）。
 */
export function buildEntryExcerpt(
  content: string,
  maxLen = ENTRY_EXCERPT_MAX_LEN
): string {
  const plain = markdownToPlainText(content);
  if (!plain) return "";
  if (plain.length <= maxLen) return plain;

  const sliced = plain.slice(0, maxLen);
  const softened = sliced.replace(/\s+\S*$/, "");
  return `${softened || sliced}…`;
}
