/** 评论正文最大长度（前后端共用） */
export const COMMENT_CONTENT_MAX = 5000;

export function normalizeCommentContent(content: unknown): string | null {
  if (typeof content !== "string") return null;
  const trimmed = content.trim();
  if (trimmed.length < 1 || trimmed.length > COMMENT_CONTENT_MAX) return null;
  return trimmed;
}
