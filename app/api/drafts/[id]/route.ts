import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import {
  deleteDraft,
  findDraftById,
  updateDraft,
} from "@/lib/db/drafts";
import {
  normalizeDraftContent,
  normalizeDraftEntryType,
  normalizeDraftMessage,
  normalizeDraftName,
  normalizeDraftParentId,
  normalizeDraftSlug,
} from "@/lib/wiki/validate-draft-input";
import type {
  DraftErrorResponse,
  DraftResponse,
  UpdateDraftRequest,
} from "@/type/draft-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "请先登录" },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const draft = await findDraftById(id, userId);

  if (!draft) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "草稿不存在" },
      { status: 404 }
    );
  }

  return NextResponse.json<DraftResponse>({ draft });
}

export async function PATCH(request: Request, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "请先登录后再更新草稿" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

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

  const name =
    payload?.name !== undefined ? normalizeDraftName(payload.name) : undefined;
  const content =
    payload?.content !== undefined
      ? normalizeDraftContent(payload.content)
      : undefined;
  const message =
    payload?.message !== undefined
      ? normalizeDraftMessage(payload.message)
      : undefined;
  const entryType = normalizeDraftEntryType(payload?.entryType);
  const parentId = normalizeDraftParentId(payload?.parentId);
  const slug = normalizeDraftSlug(payload?.slug);

  if (payload?.name !== undefined && !name) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "草稿名称无效" },
      { status: 400 }
    );
  }

  if (payload?.content !== undefined && content === null) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "草稿正文无效或过长" },
      { status: 400 }
    );
  }

  if (payload?.entryType !== undefined && entryType === null) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "entryType 无效" },
      { status: 400 }
    );
  }

  if (payload?.parentId !== undefined && parentId === undefined) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "parentId 格式无效" },
      { status: 400 }
    );
  }

  try {
    const draft = await updateDraft(id, userId, {
      name: name ?? undefined,
      content: content ?? undefined,
      message,
      entryType: entryType ?? undefined,
      parentId,
      slug,
    });

    if (!draft) {
      return NextResponse.json<DraftErrorResponse>(
        { error: "草稿不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json<DraftResponse>({ draft });
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

export async function DELETE(_request: Request, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "请先登录后再删除草稿" },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const deleted = await deleteDraft(id, userId);

  if (!deleted) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "草稿不存在" },
      { status: 404 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
