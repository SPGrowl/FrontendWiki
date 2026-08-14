import { query } from "@/lib/db";

export interface WikiStats {
  /** 已发布百科词条（common） */
  entryCount: number;
  /** 已发布博客 */
  blogCount: number;
  /** 注册用户 */
  userCount: number;
}

export async function getWikiStats(): Promise<WikiStats> {
  const { rows } = await query<{
    entry_count: number;
    blog_count: number;
    user_count: number;
  }>(
    `SELECT
       (SELECT COUNT(*)::int FROM entries
         WHERE type = 'common' AND status = 'published') AS entry_count,
       (SELECT COUNT(*)::int FROM entries
         WHERE type = 'blog' AND status = 'published') AS blog_count,
       (SELECT COUNT(*)::int FROM users) AS user_count`
  );

  const row = rows[0];
  return {
    entryCount: row?.entry_count ?? 0,
    blogCount: row?.blog_count ?? 0,
    userCount: row?.user_count ?? 0,
  };
}
