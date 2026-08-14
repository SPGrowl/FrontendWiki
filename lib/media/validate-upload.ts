import type { MediaPurpose } from "@/type/media";
import {
  MEDIA_ALLOWED_MIME,
  MEDIA_MAX_BYTES,
  MEDIA_TITLE_MAX,
  type MediaAllowedMime,
} from "@/lib/media/constants";

export function normalizeMediaPurpose(value: unknown): MediaPurpose | null {
  if (value === "avatar" || value === "entry") return value;
  return null;
}

export function normalizeMediaTitle(value: unknown): string | null {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, MEDIA_TITLE_MAX);
  return trimmed;
}

/** 非空说明（相册 / entry 配图必填） */
export function normalizeRequiredMediaTitle(value: unknown): string | null {
  const title = normalizeMediaTitle(value);
  if (title === null || title === "") return null;
  return title;
}

function sniffMime(bytes: Buffer): MediaAllowedMime | null {
  if (bytes.length < 12) return null;

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39)
  ) {
    return "image/gif";
  }

  const riff = bytes.toString("ascii", 0, 4);
  const webp = bytes.toString("ascii", 8, 12);
  if (riff === "RIFF" && webp === "WEBP") {
    return "image/webp";
  }

  return null;
}

export interface ValidatedUpload {
  purpose: MediaPurpose;
  mime: MediaAllowedMime;
  bytes: Buffer;
  title: string;
  maxBytes: number;
}

export async function validateUploadFormData(
  formData: FormData
): Promise<{ ok: true; value: ValidatedUpload } | { ok: false; error: string }> {
  const purpose = normalizeMediaPurpose(formData.get("purpose"));
  if (!purpose) {
    return { ok: false, error: "purpose 必须是 avatar 或 entry" };
  }

  const titleRaw = normalizeMediaTitle(formData.get("title"));
  if (titleRaw === null) {
    return { ok: false, error: "说明无效" };
  }

  // entry 配图必须带可检索说明；avatar 可用文件名兜底
  let title = titleRaw;
  if (purpose === "entry") {
    if (!title) {
      return { ok: false, error: "上传配图时必须填写说明（message）" };
    }
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "请使用 file 字段上传图片" };
  }

  const maxBytes = MEDIA_MAX_BYTES[purpose];
  if (file.size <= 0) {
    return { ok: false, error: "文件为空" };
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return {
      ok: false,
      error: `文件过大：${purpose === "avatar" ? "头像" : "配图"}不超过 ${mb}MB`,
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffMime(buffer);
  if (!sniffed || !MEDIA_ALLOWED_MIME.includes(sniffed)) {
    return {
      ok: false,
      error: "仅支持 JPEG / PNG / WebP / GIF",
    };
  }

  // 客户端 Content-Type 不可信；若声明了则须与魔数一致
  if (file.type && file.type !== sniffed && file.type !== "application/octet-stream") {
    return { ok: false, error: "文件类型与内容不符" };
  }

  if (purpose === "avatar" && !title) {
    title = file.name
      ? file.name.replace(/\.[^.]+$/, "").slice(0, MEDIA_TITLE_MAX)
      : "";
  }

  return {
    ok: true,
    value: {
      purpose,
      mime: sniffed,
      bytes: buffer,
      title,
      maxBytes,
    },
  };
}

/** 仅允许本站 /uploads/ 头像 URL，或空字符串清空 */
export function normalizeAvatarUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (trimmed.length > 512) return null;
  if (!trimmed.startsWith("/uploads/avatar/")) return null;
  if (trimmed.includes("..") || trimmed.includes("\\")) return null;
  return trimmed;
}
