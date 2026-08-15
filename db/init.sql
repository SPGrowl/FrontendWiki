-- Frontend Wiki 表结构
-- 用法: psql -U postgres -d frontend_wiki -f db/init.sql

BEGIN;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  password    TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  avatar      TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 已有库迁移：补 password 列
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT '';

-- 已有库迁移：password_hash 合并至 password 后删除旧列
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'password_hash'
  ) THEN
    UPDATE users
    SET password = password_hash
    WHERE password = '' AND password_hash IS NOT NULL AND password_hash <> '';

    ALTER TABLE users DROP COLUMN password_hash;
  END IF;
END $$;

-- 用户名唯一（注册时依赖此约束）
CREATE UNIQUE INDEX IF NOT EXISTS users_name_unique ON users (name);

-- ---------------------------------------------------------------------------
-- entries（current_version_id 外键在 entry_versions 建表后添加）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                TEXT NOT NULL CHECK (type IN ('common', 'blog', 'stub')),
  parent_id           UUID REFERENCES entries (id) ON DELETE SET NULL,
  slug                TEXT NOT NULL,
  name                TEXT NOT NULL,
  /** 规范阅读路径，如 /entry/js 或 /entry/blog/foo；全局唯一，供直查 */
  href                TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'published'
                      CHECK (status IN ('published', 'archived')),
  current_version_id  UUID,
  creator_id          UUID NOT NULL REFERENCES users (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 已有库升级：补 href 列并回填（新库 CREATE 已含该列，ADD 为 no-op）
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
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entries' AND column_name = 'href' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE entries ALTER COLUMN href SET NOT NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS entries_href_unique ON entries (href);

-- 旧索引：根级 slug 曾跨 common/blog 共用，拆分后删除
DROP INDEX IF EXISTS entries_root_slug_unique;

-- common 根级：parent_id IS NULL AND type = common 时 slug 唯一
CREATE UNIQUE INDEX IF NOT EXISTS entries_common_root_slug_unique
  ON entries (slug)
  WHERE parent_id IS NULL AND type = 'common';

-- blog 一级：parent_id IS NULL AND type = blog 时 slug 唯一（与 common 根可同名）
CREATE UNIQUE INDEX IF NOT EXISTS entries_blog_slug_unique
  ON entries (slug)
  WHERE parent_id IS NULL AND type = 'blog';

-- 子级词条：同一 parent 下 slug 唯一（仅 common）
CREATE UNIQUE INDEX IF NOT EXISTS entries_child_slug_unique
  ON entries (parent_id, slug)
  WHERE parent_id IS NOT NULL AND type = 'common';

-- blog 禁止挂父级
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

CREATE INDEX IF NOT EXISTS idx_entries_parent ON entries (parent_id);
CREATE INDEX IF NOT EXISTS idx_entries_creator ON entries (creator_id);
CREATE INDEX IF NOT EXISTS idx_entries_status ON entries (status);

-- ---------------------------------------------------------------------------
-- entry_versions（append-only）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entry_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id        UUID NOT NULL REFERENCES entries (id) ON DELETE CASCADE,
  version_no      INT NOT NULL CHECK (version_no > 0),
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  contributor_id  UUID NOT NULL REFERENCES users (id),
  message         TEXT NOT NULL DEFAULT '',
  toc_json        JSONB,
  content_hash    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (entry_id, version_no)
);

CREATE INDEX IF NOT EXISTS idx_entry_versions_entry
  ON entry_versions (entry_id, version_no DESC);

CREATE INDEX IF NOT EXISTS idx_entry_versions_contributor
  ON entry_versions (contributor_id);

-- entries ↔ entry_versions 循环外键
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_entries_current_version'
  ) THEN
    ALTER TABLE entries
      ADD CONSTRAINT fk_entries_current_version
      FOREIGN KEY (current_version_id) REFERENCES entry_versions (id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- entry_slug_redirects
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entry_slug_redirects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id    UUID NOT NULL REFERENCES entries (id) ON DELETE CASCADE,
  old_path    TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entry_slug_redirects_entry
  ON entry_slug_redirects (entry_id);

-- ---------------------------------------------------------------------------
-- entry_drafts（用户私有草稿，每词条可有多条）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entry_drafts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  entry_id    UUID REFERENCES entries (id) ON DELETE CASCADE,
  draft_type  TEXT NOT NULL CHECK (draft_type IN ('new', 'edit')),
  name        TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  message     TEXT NOT NULL DEFAULT '',
  entry_type  TEXT CHECK (entry_type IN ('common', 'blog')),
  parent_id   UUID REFERENCES entries (id) ON DELETE SET NULL,
  slug        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT entry_drafts_new_requires_meta CHECK (
    draft_type <> 'new' OR entry_type IS NOT NULL
  ),
  CONSTRAINT entry_drafts_edit_requires_entry CHECK (
    draft_type <> 'edit' OR entry_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_entry_drafts_user_updated
  ON entry_drafts (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_entry_drafts_user_entry
  ON entry_drafts (user_id, entry_id, updated_at DESC)
  WHERE entry_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- entry_comments（词条/博客讨论，暂无回复）
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- media_assets（上传图片元数据；文件在 storage/uploads）
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media_assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id  UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  storage_key  TEXT NOT NULL UNIQUE,
  purpose      TEXT NOT NULL CHECK (purpose IN ('avatar', 'entry')),
  title        TEXT NOT NULL DEFAULT '',
  mime         TEXT NOT NULL,
  size_bytes   INT NOT NULL CHECK (size_bytes > 0),
  width        INT CHECK (width IS NULL OR width > 0),
  height       INT CHECK (height IS NULL OR height > 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_uploader_created
  ON media_assets (uploader_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_assets_purpose_created
  ON media_assets (purpose, created_at DESC);

COMMIT;
