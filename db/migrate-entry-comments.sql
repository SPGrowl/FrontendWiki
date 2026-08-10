-- 词条/博客讨论表（已有库执行本迁移即可）
-- 用法: psql "$DATABASE_URL" -f db/migrate-entry-comments.sql

BEGIN;

CREATE TABLE IF NOT EXISTS entry_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id    UUID NOT NULL REFERENCES entries (id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT entry_comments_content_not_blank CHECK (length(trim(content)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_entry_comments_entry_created
  ON entry_comments (entry_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_entry_comments_author
  ON entry_comments (author_id);

COMMIT;
