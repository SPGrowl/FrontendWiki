import type { ApiErrorResponse } from "@/type/api";
import type {
  MediaAsset,
  MediaAssetPayload,
  MediaListResult,
  MediaPurpose,
  UpdateMediaTitleBody,
  UploadMediaInput,
} from "@/type/media";
import type { AuthResponse } from "@/type/user";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T;
  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as ApiErrorResponse).error === "string"
        ? (data as ApiErrorResponse).error
        : `请求失败 (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export interface ListMediaParams {
  purpose?: MediaPurpose | "all";
  uploaderId?: string | "me";
  q?: string;
  offset?: number;
  limit?: number;
}

export async function listMedia(
  params: ListMediaParams = {}
): Promise<MediaListResult> {
  const search = new URLSearchParams();
  if (params.purpose) search.set("purpose", params.purpose);
  if (params.uploaderId) search.set("uploaderId", params.uploaderId);
  if (params.q) search.set("q", params.q);
  if (params.offset != null) search.set("offset", String(params.offset));
  if (params.limit != null) search.set("limit", String(params.limit));

  const query = search.toString();
  const response = await fetch(`/api/media${query ? `?${query}` : ""}`);
  return parseJsonResponse<MediaListResult>(response);
}

export async function uploadMedia(
  input: UploadMediaInput
): Promise<MediaAsset> {
  if (input.purpose === "entry" && !input.title?.trim()) {
    throw new Error("上传配图时必须填写说明（message）");
  }

  // 二进制传输文件
  const fd = new FormData();
  fd.append("file", input.file);
  fd.append("purpose", input.purpose);
  if (input.title) fd.append("title", input.title);
  if (input.setAsAvatar) fd.append("setAsAvatar", "1");

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: fd,
  });
  const { asset } = await parseJsonResponse<MediaAssetPayload>(response);
  return asset;
}

export async function updateMedia(
  id: string,
  body: UpdateMediaTitleBody
): Promise<MediaAsset> {
  const response = await fetch(`/api/media/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const { asset } = await parseJsonResponse<MediaAssetPayload>(response);
  return asset;
}

export async function deleteMedia(id: string): Promise<{ ok: true }> {
  const response = await fetch(`/api/media/${id}`, { method: "DELETE" });
  return parseJsonResponse<{ ok: true }>(response);
}

export async function updateMyAvatar(avatar: string): Promise<AuthResponse> {
  const response = await fetch("/api/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ avatar }),
  });
  return parseJsonResponse<AuthResponse>(response);
}
