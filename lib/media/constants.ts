import type { MediaPurpose } from "@/type/media";

export const MEDIA_TITLE_MAX = 120;

export const MEDIA_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type MediaAllowedMime = (typeof MEDIA_ALLOWED_MIME)[number];

export const MEDIA_MAX_BYTES: Record<MediaPurpose, number> = {
  avatar: 2 * 1024 * 1024,
  entry: 5 * 1024 * 1024,
};

export const MEDIA_LIST_DEFAULT_LIMIT = 24;
export const MEDIA_LIST_MAX_LIMIT = 60;

export const MIME_TO_EXT: Record<MediaAllowedMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
