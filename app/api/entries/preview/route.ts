import { NextResponse } from "next/server";
import { getEntryPreviewByHref } from "@/lib/db/entries";
import {
  isInternalEntryHref,
  normalizeInternalEntryHref,
} from "@/lib/wiki/resolve-entry-link";
import type {
  EntryErrorResponse,
  EntryPreviewResponse,
} from "@/type/entry-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const href = searchParams.get("href")?.trim() ?? "";

  if (!href) {
    return NextResponse.json<EntryPreviewResponse>(
      { preview: null, error: "缺少链接参数" },
      { status: 400 }
    );
  }

  if (!isInternalEntryHref(href)) {
    return NextResponse.json<EntryPreviewResponse>({
      preview: null,
      error: "不是有效的站内词条链接（应为 entry/... ）",
    });
  }

  const normalized = normalizeInternalEntryHref(href);
  if (!normalized || normalized === "/entry") {
    return NextResponse.json<EntryPreviewResponse>({
      preview: null,
      error: "链接不完整或无效",
    });
  }

  try {
    const preview = await getEntryPreviewByHref(normalized);
    if (!preview) {
      return NextResponse.json<EntryPreviewResponse>({
        preview: null,
        error: "词条不存在或尚未发布",
      });
    }

    return NextResponse.json<EntryPreviewResponse>({ preview });
  } catch (error) {
    console.error("[GET /api/entries/preview]", error);
    return NextResponse.json<EntryErrorResponse>(
      { error: "获取词条预览失败" },
      { status: 500 }
    );
  }
}
