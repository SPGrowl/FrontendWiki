import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { listMediaAssets } from "@/lib/db/media";
import { isUuid } from "@/lib/wiki/entry-path";
import type { ApiErrorResponse } from "@/type/api";
import type { MediaListResult, MediaPurpose } from "@/type/media";

/**
 * GET /api/media
 * Query:
 * - purpose=entry|avatar|all  默认 entry（公共配图，不含头像）
 * - uploaderId=uuid | me
 * - q=标题关键词
 * - offset, limit
 */
export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "请先登录" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);

  const purposeRaw = searchParams.get("purpose")?.trim() || "entry";
  let purpose: MediaPurpose | "all" = "entry";
  if (purposeRaw === "avatar" || purposeRaw === "entry" || purposeRaw === "all") {
    purpose = purposeRaw;
  } else {
    return NextResponse.json<ApiErrorResponse>(
      { error: "purpose 必须是 entry、avatar 或 all" },
      { status: 400 }
    );
  }

  // 头像库仅允许看自己的（或 all 时仍可按 uploader 过滤）；防扫全站头像
  let uploaderId = searchParams.get("uploaderId")?.trim() || undefined;
  if (uploaderId === "me") {
    uploaderId = userId;
  }
  if (uploaderId && uploaderId !== "me" && !isUuid(uploaderId)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "uploaderId 无效" },
      { status: 400 }
    );
  }

  if (purpose === "avatar") {
    if (!uploaderId) {
      uploaderId = userId;
    } else if (uploaderId !== userId) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "只能查看自己的头像上传记录" },
        { status: 403 }
      );
    }
  }

  if (purpose === "all" && uploaderId && uploaderId !== userId) {
    // all 含头像：只允许看自己的合集
    return NextResponse.json<ApiErrorResponse>(
      { error: "查看全部用途时只能筛选自己" },
      { status: 403 }
    );
  }

  if (purpose === "all" && !uploaderId) {
    uploaderId = userId;
  }

  const q = searchParams.get("q")?.trim() || undefined;
  const offset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw
    ? Number.parseInt(limitRaw, 10)
    : undefined;

  if (Number.isNaN(offset) || offset < 0) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "offset 无效" },
      { status: 400 }
    );
  }
  if (limit !== undefined && (Number.isNaN(limit) || limit < 1)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "limit 无效" },
      { status: 400 }
    );
  }

  try {
    const { items, nextOffset } = await listMediaAssets({
      purpose,
      uploaderId,
      q,
      offset,
      limit,
    });
    return NextResponse.json<MediaListResult>({ items, nextOffset });
  } catch (error) {
    console.error("[GET /api/media]", error);
    return NextResponse.json<ApiErrorResponse>(
      { error: "获取图库失败" },
      { status: 500 }
    );
  }
}
