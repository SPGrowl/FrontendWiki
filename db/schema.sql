-- Frontend Wiki — 新建库完整表结构
-- 用法（新库）：psql -U postgres -d frontend_wiki -f db/schema.sql
--
-- 注意：此文件为干净起始结构，不含存量迁移逻辑。
-- 已有库请使用 init.sql（含兼容补丁）+ migrate-*.sql（逐步迁移）。

BEGIN;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  password    TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  avatar      TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 用户名全局唯一（注册时依赖此约束）
CREATE UNIQUE INDEX users_name_unique ON users (name);

-- ---------------------------------------------------------------------------
-- entries — 词条主表
-- 树形结构：parent_id + slug 管理层级；href 为物化阅读路径，全局唯一
-- ---------------------------------------------------------------------------
CREATE TABLE entries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- common：百科词条（可多级）；blog：博客（只有一级）；stub：占位
  type                TEXT NOT NULL CHECK (type IN ('common', 'blog', 'stub')),
  parent_id           UUID REFERENCES entries (id) ON DELETE SET NULL,
  slug                TEXT NOT NULL,
  name                TEXT NOT NULL,
  -- 规范阅读路径，如 /entry/js 或 /entry/blog/foo；全局唯一，供直查
  href                TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'published'
                      CHECK (status IN ('published', 'archived')),
  -- 指向当前发布版本；NULL 表示仅草稿
  current_version_id  UUID,
  creator_id          UUID NOT NULL REFERENCES users (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- blog 不能有父级
  CONSTRAINT entries_blog_no_parent
    CHECK (type <> 'blog' OR parent_id IS NULL)
);

-- 阅读路径：全局唯一，O(1) 命中
CREATE UNIQUE INDEX entries_href_unique
  ON entries (href);

-- common 根级（parent_id IS NULL）slug 唯一
CREATE UNIQUE INDEX entries_common_root_slug_unique
  ON entries (slug)
  WHERE parent_id IS NULL AND type = 'common';

-- blog 一级 slug 唯一（与 common 根可同名，命名空间隔离）
CREATE UNIQUE INDEX entries_blog_slug_unique
  ON entries (slug)
  WHERE parent_id IS NULL AND type = 'blog';

-- 同一 parent 下 slug 唯一（仅 common 子级）
CREATE UNIQUE INDEX entries_child_slug_unique
  ON entries (parent_id, slug)
  WHERE parent_id IS NOT NULL AND type = 'common';

CREATE INDEX idx_entries_parent  ON entries (parent_id);
CREATE INDEX idx_entries_creator ON entries (creator_id);
CREATE INDEX idx_entries_status  ON entries (status);

-- ---------------------------------------------------------------------------
-- entry_versions — 版本快照（append-only；不更新，只追加）
-- ---------------------------------------------------------------------------
CREATE TABLE entry_versions (
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

CREATE INDEX idx_entry_versions_entry
  ON entry_versions (entry_id, version_no DESC);

CREATE INDEX idx_entry_versions_contributor
  ON entry_versions (contributor_id);

-- entries.current_version_id 循环外键（建表后添加）
ALTER TABLE entries
  ADD CONSTRAINT fk_entries_current_version
  FOREIGN KEY (current_version_id) REFERENCES entry_versions (id)
  ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- entry_slug_redirects — 旧路径重定向
-- 改 slug / parent 时由 cascadeEntryHrefs 写入；读路径查两次（href → redirect）
-- ---------------------------------------------------------------------------
CREATE TABLE entry_slug_redirects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id    UUID NOT NULL REFERENCES entries (id) ON DELETE CASCADE,
  old_path    TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entry_slug_redirects_entry
  ON entry_slug_redirects (entry_id);

-- ---------------------------------------------------------------------------
-- entry_drafts — 用户私有草稿（每词条可有多条，编辑页取最新一条）
-- ---------------------------------------------------------------------------
CREATE TABLE entry_drafts (
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
  CONSTRAINT entry_drafts_new_requires_meta  CHECK (draft_type <> 'new'  OR entry_type IS NOT NULL),
  CONSTRAINT entry_drafts_edit_requires_entry CHECK (draft_type <> 'edit' OR entry_id IS NOT NULL)
);

CREATE INDEX idx_entry_drafts_user_updated
  ON entry_drafts (user_id, updated_at DESC);

CREATE INDEX idx_entry_drafts_user_entry
  ON entry_drafts (user_id, entry_id, updated_at DESC)
  WHERE entry_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- entry_comments — 词条讨论（暂无回复层级）
-- ---------------------------------------------------------------------------
CREATE TABLE entry_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id    UUID NOT NULL REFERENCES entries (id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT entry_comments_content_not_blank CHECK (length(trim(content)) > 0)
);

CREATE INDEX idx_entry_comments_entry_created
  ON entry_comments (entry_id, created_at ASC);

CREATE INDEX idx_entry_comments_author
  ON entry_comments (author_id);

-- ---------------------------------------------------------------------------
-- media_assets — 上传图片元数据（实体文件在 storage/uploads/）
-- ---------------------------------------------------------------------------
CREATE TABLE media_assets (
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

CREATE INDEX idx_media_assets_uploader_created
  ON media_assets (uploader_id, created_at DESC);

CREATE INDEX idx_media_assets_purpose_created
  ON media_assets (purpose, created_at DESC);

COMMIT;
