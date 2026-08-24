/** 上传用途：头像不进公共配图库；正文图默认公开可复用 */
export type MediaPurpose = "avatar" | "entry";

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
  uploader: { id: string; name: string };
}

/** 列表结果（相对单条多 items + nextOffset） */
export interface MediaListResult {
  items: MediaAsset[];
  /** 下一页 offset；无更多时为 null */
  nextOffset: number | null;
}

/** 服务端读写磁盘、鉴权时扩展 */
export type MediaAssetWithStorage = MediaAsset & { storageKey: string };

/** POST /api/uploads 客户端入参 */
export interface UploadMediaInput {
  file: File;
  purpose: MediaPurpose;
  /** entry 必填；avatar 可选 */
  title?: string;
  setAsAvatar?: boolean;
}

/** PATCH /api/media/:id 请求体 */
export interface UpdateMediaTitleBody {
  title: string;
}

/** 单条成功 JSON（传输层；lib/api 解包后返回 MediaAsset） */
export interface MediaAssetPayload {
  asset: MediaAsset;
}
