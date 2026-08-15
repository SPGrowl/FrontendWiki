-- 迁移：entries.href 作为全局唯一阅读路径查询键
-- 用法: psql "$DATABASE_URL" -f db/migrate-entry-href.sql
-- 保留 parent_id + slug 树形结构；href 为物化路径（改父级/slug 时由应用级联更新）

BEGIN;

ALTER TABLE entries ADD COLUMN IF NOT EXISTS href TEXT;

WITH RECURSIVE paths AS (
  SELECT
    id,
    CASE
      WHEN type = 'blog' THEN '/entry/blog/' || slug
      ELSE '/entry/' || slug
    END AS href
  FROM entries
  WHERE parent_id IS NULL
  UNION ALL
  SELECT
    e.id,
    p.href || '/' || e.slug
  FROM entries e
  INNER JOIN paths p ON e.parent_id = p.id
)
UPDATE entries e
SET href = paths.href
FROM paths
WHERE e.id = paths.id
  AND (e.href IS NULL OR e.href = '');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM entries
    WHERE href IS NULL OR href = ''
  ) THEN
    RAISE EXCEPTION 'entries.href backfill left null/empty rows';
  END IF;
END $$;

ALTER TABLE entries ALTER COLUMN href SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS entries_href_unique ON entries (href);

COMMIT;
