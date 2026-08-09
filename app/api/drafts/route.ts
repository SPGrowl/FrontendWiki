import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { createDraft, listDraftsByUser } from "@/lib/db/drafts";
import {
  normalizeDraftContent,
  normalizeDraftEntryId,
  normalizeDraftEntryType,
  normalizeDraftMessage,
  normalizeDraftName,
  normalizeDraftParentId,
  normalizeDraftSlug,
  normalizeDraftType,
} from "@/lib/wiki/validate-draft-input";
import type {
  CreateDraftRequest,
  DraftErrorResponse,
  DraftListResponse,
  DraftResponse,
} from "@/type/draft-api";

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "请先登录" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const entryId = searchParams.get("entryId")?.trim() || undefined;

  try {
    const items = await listDraftsByUser(userId, { entryId });
    return NextResponse.json<DraftListResponse>({ items });
  } catch (error) {
    console.error("[GET /api/drafts]", error);
    return NextResponse.json<DraftErrorResponse>(
      { error: "获取草稿列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "请先登录后再保存草稿" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<DraftErrorResponse>(
      { error: "请求体必须是 JSON" },
      { status: 400 }
    );
  }

  const payload =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null;

  const draftType = normalizeDraftType(payload?.draftType);
  const name = normalizeDraftName(payload?.name);
  const content = normalizeDraftContent(payload?.content);
  const message = normalizeDraftMessage(payload?.message);
  const entryId = normalizeDraftEntryId(payload?.entryId);
  const entryType = normalizeDraftEntryType(payload?.entryType);
  const parentId = normalizeDraftParentId(payload?.parentId);
  const slug = normalizeDraftSlug(payload?.slug);

  if (!draftType) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "draftType 必须是 new 或 edit" },
      { status: 400 }
    );
  }

  if (!name) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "草稿名称无效" },
      { status: 400 }
    );
  }

  if (content === null) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "草稿正文无效或过长" },
      { status: 400 }
    );
  }

  if (draftType === "edit" && !entryId) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "编辑草稿必须提供 entryId" },
      { status: 400 }
    );
  }

  if (draftType === "new") {
    if (entryType === null || entryType === undefined) {
      return NextResponse.json<DraftErrorResponse>(
        { error: "新建草稿必须提供 entryType" },
        { status: 400 }
      );
    }

    if (parentId === undefined) {
      return NextResponse.json<DraftErrorResponse>(
        { error: "parentId 格式无效" },
        { status: 400 }
      );
    }
  }

  try {
    const draft = await createDraft({
      userId,
      draftType,
      name,
      content,
      message,
      entryId: draftType === "edit" ? entryId : null,
      entryType: draftType === "new" ? entryType ?? undefined : undefined,
      parentId: draftType === "new" ? (parentId ?? null) : undefined,
      slug: slug ?? null,
    });

    return NextResponse.json<DraftResponse>({ draft }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message) {
      return NextResponse.json<DraftErrorResponse>(
        { error: error.message },
        { status: 400 }
      );
    }

    throw error;
  }
}
