import type { MediaAsset, MediaPurpose } from "@/type/media";

export interface MediaErrorResponse {
  error: string;
}

export interface MediaUploadResponse {
  asset: MediaAsset;
}

export interface MediaListResponse {
  items: MediaAsset[];
  /** 下一页 offset；无更多时为 null */
  nextOffset: number | null;
}

export interface MediaResponse {
  asset: MediaAsset;
}

export interface UpdateMediaRequest {
  title?: string;
}

export interface UpdateMeRequest {
  avatar?: string;
}

export interface MeResponse {
  user: import("@/type/user").User;
}

export type { MediaPurpose };
