-- 迁移：新增 media_assets（上传图片元数据）
-- 用法: psql -U postgres -d frontend_wiki -f db/migrate-media-assets.sql

BEGIN;

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
