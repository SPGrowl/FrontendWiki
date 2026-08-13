/** 上传用途：头像不进公共配图库；正文图默认公开可复用 */
export type MediaPurpose = "avatar" | "entry";

/** 上传者摘要（列表展示） */
export interface MediaUploader {
  id: string;
  name: string;
}

/** media_assets 对外读模型 */
export interface MediaAsset {
  id: string;
  url: string;
  purpose: MediaPurpose;
  title: string;
  mime: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  uploader: MediaUploader;
}
