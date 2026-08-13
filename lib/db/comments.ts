import { query } from "@/lib/db";
import { getEntryPageDataBySegments } from "@/lib/db/entries";
import { isUuid } from "@/lib/wiki/entry-path";
import type { EntryComment, EntryDiscussPageData } from "@/type/entry";

export {
  COMMENT_CONTENT_MAX,
  normalizeCommentContent,
} from "@/lib/wiki/comment-input";

interface CommentRow {
  id: string;
  entry_id: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  created_at: Date;
}

function mapComment(row: CommentRow): EntryComment {
  return {
    id: row.id,
    entryId: row.entry_id,
    content: row.content,
    createdAt: row.created_at.toISOString(),
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar ?? "",
  };
}

export async function listCommentsByEntryId(
  entryId: string
): Promise<EntryComment[]> {
  if (!isUuid(entryId)) return [];

  const { rows } = await query<CommentRow>(
    `SELECT c.id, c.entry_id, c.author_id, c.content, c.created_at,
            u.name AS author_name, u.avatar AS author_avatar
     FROM entry_comments c
     INNER JOIN users u ON u.id = c.author_id
     WHERE c.entry_id = $1
     ORDER BY c.created_at ASC`,
    [entryId]
  );

  return rows.map(mapComment);
}

export async function getEntryDiscussPageDataBySegments(
  rawSlugs: string[]
): Promise<EntryDiscussPageData | null> {
  const entry = await getEntryPageDataBySegments(rawSlugs);
  if (!entry) return null;

  const comments = await listCommentsByEntryId(entry.id);

  return {
    entryId: entry.id,
    entryName: entry.title,
    title: entry.title,
    readPath: entry.path,
    breadcrumbs: entry.breadcrumbs,
    comments,
  };
}

export async function createComment(input: {
  entryId: string;
  authorId: string;
  content: string;
}): Promise<EntryComment> {
  const { rows } = await query<CommentRow>(
    `WITH inserted AS (
       INSERT INTO entry_comments (entry_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, entry_id, author_id, content, created_at
     )
     SELECT i.id, i.entry_id, i.author_id, i.content, i.created_at,
            u.name AS author_name, u.avatar AS author_avatar
     FROM inserted i
     INNER JOIN users u ON u.id = i.author_id`,
    [input.entryId, input.authorId, input.content]
  );

  return mapComment(rows[0]);
}

export async function findCommentById(
  commentId: string
): Promise<EntryComment | null> {
  if (!isUuid(commentId)) return null;

  const { rows } = await query<CommentRow>(
    `SELECT c.id, c.entry_id, c.author_id, c.content, c.created_at,
            u.name AS author_name, u.avatar AS author_avatar
     FROM entry_comments c
     INNER JOIN users u ON u.id = c.author_id
     WHERE c.id = $1
     LIMIT 1`,
    [commentId]
  );

  return rows[0] ? mapComment(rows[0]) : null;
}

/** 仅作者可删（或 admin）；返回是否删除成功 */
export async function deleteComment(input: {
  commentId: string;
  entryId: string;
  requesterId: string;
  isAdmin?: boolean;
}): Promise<boolean> {
  if (!isUuid(input.commentId) || !isUuid(input.entryId)) return false;

  const { rowCount } = await query(
    input.isAdmin
      ? `DELETE FROM entry_comments
         WHERE id = $1 AND entry_id = $2`
      : `DELETE FROM entry_comments
         WHERE id = $1 AND entry_id = $2 AND author_id = $3`,
    input.isAdmin
      ? [input.commentId, input.entryId]
      : [input.commentId, input.entryId, input.requesterId]
  );

  return (rowCount ?? 0) > 0;
}
