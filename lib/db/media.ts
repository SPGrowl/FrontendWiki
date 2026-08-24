import { query } from "@/lib/db";
import { isUuid } from "@/lib/wiki/entry-path";
import type {
  MediaAsset,
  MediaAssetWithStorage,
  MediaListResult,
  MediaPurpose,
} from "@/type/media";
import {
  MEDIA_LIST_DEFAULT_LIMIT,
  MEDIA_LIST_MAX_LIMIT,
} from "@/lib/media/constants";

interface MediaRow {
  id: string;
  uploader_id: string;
  uploader_name: string;
  url: string;
  storage_key: string;
  purpose: MediaPurpose;
  title: string;
  mime: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  created_at: Date;
}

function mapMedia(row: MediaRow): MediaAsset {
  return {
    id: row.id,
    url: row.url,
    purpose: row.purpose,
    title: row.title,
    mime: row.mime,
    sizeBytes: row.size_bytes,
    width: row.width,
    height: row.height,
    createdAt: row.created_at.toISOString(),
    uploader: {
      id: row.uploader_id,
      name: row.uploader_name,
    },
  };
}

const MEDIA_SELECT = `
  m.id, m.uploader_id, m.url, m.storage_key, m.purpose, m.title,
  m.mime, m.size_bytes, m.width, m.height, m.created_at,
  u.name AS uploader_name
`;

export interface CreateMediaAssetInput {
  uploaderId: string;
  url: string;
  storageKey: string;
  purpose: MediaPurpose;
  title: string;
  mime: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
}

export async function createMediaAsset(
  input: CreateMediaAssetInput
): Promise<MediaAsset> {
  const { rows } = await query<MediaRow>(
    `WITH inserted AS (
       INSERT INTO media_assets (
         uploader_id, url, storage_key, purpose, title,
         mime, size_bytes, width, height
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, uploader_id, url, storage_key, purpose, title,
                 mime, size_bytes, width, height, created_at
     )
     SELECT i.*, u.name AS uploader_name
     FROM inserted i
     INNER JOIN users u ON u.id = i.uploader_id`,
    [
      input.uploaderId,
      input.url,
      input.storageKey,
      input.purpose,
      input.title,
      input.mime,
      input.sizeBytes,
      input.width ?? null,
      input.height ?? null,
    ]
  );

  return mapMedia(rows[0]);
}

export async function findMediaById(id: string): Promise<MediaAssetWithStorage | null> {
  if (!isUuid(id)) return null;

  const { rows } = await query<MediaRow>(
    `SELECT ${MEDIA_SELECT}
     FROM media_assets m
     INNER JOIN users u ON u.id = m.uploader_id
     WHERE m.id = $1
     LIMIT 1`,
    [id]
  );

  const row = rows[0];
  if (!row) return null;
  return { ...mapMedia(row), storageKey: row.storage_key };
}

export interface ListMediaOptions {
  /** 默认仅 entry（公共配图库）；传 avatar 或 all 时放宽 */
  purpose?: MediaPurpose | "all";
  uploaderId?: string;
  q?: string;
  offset?: number;
  limit?: number;
}

export async function listMediaAssets(
  options: ListMediaOptions = {}
): Promise<MediaListResult> {
  const purpose = options.purpose ?? "entry";
  const offset = Math.max(0, options.offset ?? 0);
  let limit = options.limit ?? MEDIA_LIST_DEFAULT_LIMIT;
  limit = Math.min(MEDIA_LIST_MAX_LIMIT, Math.max(1, limit));

  const params: unknown[] = [];
  const where: string[] = [];

  if (purpose !== "all") {
    params.push(purpose);
    where.push(`m.purpose = $${params.length}`);
  }

  if (options.uploaderId) {
    if (!isUuid(options.uploaderId)) {
      return { items: [], nextOffset: null };
    }
    params.push(options.uploaderId);
    where.push(`m.uploader_id = $${params.length}`);
  }

  const q = options.q?.trim();
  if (q) {
    params.push(`%${q}%`);
    where.push(`m.title ILIKE $${params.length}`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  params.push(limit + 1);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const { rows } = await query<MediaRow>(
    `SELECT ${MEDIA_SELECT}
     FROM media_assets m
     INNER JOIN users u ON u.id = m.uploader_id
     ${whereSql}
     ORDER BY m.created_at DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: pageRows.map(mapMedia),
    nextOffset: hasMore ? offset + limit : null,
  };
}

export async function updateMediaTitle(
  id: string,
  title: string
): Promise<MediaAsset | null> {
  if (!isUuid(id)) return null;

  const { rows } = await query<MediaRow>(
    `WITH updated AS (
       UPDATE media_assets
       SET title = $2
       WHERE id = $1
       RETURNING id, uploader_id, url, storage_key, purpose, title,
                 mime, size_bytes, width, height, created_at
     )
     SELECT u.*, usr.name AS uploader_name
     FROM updated u
     INNER JOIN users usr ON usr.id = u.uploader_id`,
    [id, title]
  );

  return rows[0] ? mapMedia(rows[0]) : null;
}

export async function deleteMediaAsset(id: string): Promise<{
  storageKey: string;
} | null> {
  if (!isUuid(id)) return null;

  const { rows } = await query<{ storage_key: string }>(
    `DELETE FROM media_assets
     WHERE id = $1
     RETURNING storage_key`,
    [id]
  );

  const row = rows[0];
  return row ? { storageKey: row.storage_key } : null;
}
