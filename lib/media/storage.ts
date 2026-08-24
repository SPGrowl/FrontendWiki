import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { MediaPurpose } from "@/type/media";
import {
  MIME_TO_EXT,
  type MediaAllowedMime,
} from "@/lib/media/constants";

const UPLOADS_ROOT = path.join(process.cwd(), "storage", "uploads");

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** 生成相对 storage/uploads 的 key，如 entry/2026/08/uuid.jpg */
export function buildStorageKey(
  purpose: MediaPurpose,
  mime: MediaAllowedMime,
  now = new Date()
): string {
  const yyyy = now.getUTCFullYear();
  const mm = pad2(now.getUTCMonth() + 1);
  const ext = MIME_TO_EXT[mime];
  return `${purpose}/${yyyy}/${mm}/${randomUUID()}.${ext}`;
}

export function publicUrlForKey(storageKey: string): string {
  return `/uploads/${storageKey.split(path.sep).join("/")}`;
}

/** 根据key生成绝对路径*/
export function absolutePathForKey(storageKey: string): string {
  return path.join(UPLOADS_ROOT, ...storageKey.split("/"));
}

/**
 * 解析 URL 路径段为 storage_key；拒绝 .. 与绝对路径逃逸。
 * 成功返回相对 key，失败返回 null。
 */
export function resolveSafeStorageKey(pathSegments: string[]): string | null {
  if (pathSegments.length === 0) return null;
  if (pathSegments.some((s) => !s || s === "." || s === ".." || s.includes("\0"))) {
    return null;
  }

  const key = pathSegments.join("/");
  const absolute = absolutePathForKey(key);
  const rootResolved = path.resolve(UPLOADS_ROOT);
  const fileResolved = path.resolve(absolute);

  if (
    fileResolved !== rootResolved &&
    !fileResolved.startsWith(rootResolved + path.sep)
  ) {
    return null;
  }

  return key;
}

export async function writeUploadFile(
  storageKey: string,
  bytes: Buffer
): Promise<void> {
  const absolute = absolutePathForKey(storageKey);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, bytes);
}

export async function deleteUploadFile(storageKey: string): Promise<void> {
  const absolute = absolutePathForKey(storageKey);
  try {
    await fs.unlink(absolute);
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code?: string }).code
        : undefined;
    if (code !== "ENOENT") throw error;
  }
}

export async function readUploadFile(
  storageKey: string
): Promise<Buffer | null> {
  try {
    return await fs.readFile(absolutePathForKey(storageKey));
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code?: string }).code
        : undefined;
    if (code === "ENOENT") return null;
    throw error;
  }
}
