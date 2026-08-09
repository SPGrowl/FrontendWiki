-- 迁移：blog / common 根级 slug 命名空间拆分
-- 用法: psql -U postgres -d frontend_wiki -f db/migrate-blog-slug-namespace.sql

BEGIN;

DROP INDEX IF EXISTS entries_root_slug_unique;

CREATE UNIQUE INDEX IF NOT EXISTS entries_common_root_slug_unique
  ON entries (slug)
  WHERE parent_id IS NULL AND type = 'common';

CREATE UNIQUE INDEX IF NOT EXISTS entries_blog_slug_unique
  ON entries (slug)
  WHERE parent_id IS NULL AND type = 'blog';

DROP INDEX IF EXISTS entries_child_slug_unique;

CREATE UNIQUE INDEX IF NOT EXISTS entries_child_slug_unique
  ON entries (parent_id, slug)
  WHERE parent_id IS NOT NULL AND type = 'common';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'entries_blog_no_parent'
  ) THEN
    ALTER TABLE entries
      ADD CONSTRAINT entries_blog_no_parent
      CHECK (type <> 'blog' OR parent_id IS NULL);
  END IF;
END $$;

COMMIT;
