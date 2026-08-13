import type {
  MediaErrorResponse,
  MediaListResponse,
  MediaResponse,
  MediaUploadResponse,
  UpdateMediaRequest,
} from "@/type/media-api";
import type { AuthResponse } from "@/type/user";
import type { MediaPurpose } from "@/type/media";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T;
  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as MediaErrorResponse).error === "string"
        ? (data as MediaErrorResponse).error
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
): Promise<MediaListResponse> {
  const search = new URLSearchParams();
  if (params.purpose) search.set("purpose", params.purpose);
  if (params.uploaderId) search.set("uploaderId", params.uploaderId);
  if (params.q) search.set("q", params.q);
  if (params.offset != null) search.set("offset", String(params.offset));
  if (params.limit != null) search.set("limit", String(params.limit));

  const query = search.toString();
  const response = await fetch(`/api/media${query ? `?${query}` : ""}`);
  return parseJsonResponse<MediaListResponse>(response);
}

export async function uploadMedia(input: {
  file: File;
  purpose: MediaPurpose;
  title?: string;
  setAsAvatar?: boolean;
}): Promise<MediaUploadResponse> {
  const fd = new FormData();
  fd.append("file", input.file);
  fd.append("purpose", input.purpose);
  if (input.title) fd.append("title", input.title);
  if (input.setAsAvatar) fd.append("setAsAvatar", "1");

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: fd,
  });
  return parseJsonResponse<MediaUploadResponse>(response);
}

export async function updateMedia(
  id: string,
  body: UpdateMediaRequest
): Promise<MediaResponse> {
  const response = await fetch(`/api/media/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse<MediaResponse>(response);
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
