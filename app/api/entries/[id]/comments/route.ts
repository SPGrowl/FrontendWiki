import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import {
  createComment,
  listCommentsByEntryId,
} from "@/lib/db/comments";
import {
  COMMENT_CONTENT_MAX,
  normalizeCommentContent,
} from "@/lib/wiki/comment-input";
import { findEntryById } from "@/lib/db/entries";
import { findUserById } from "@/lib/db/users";
import { isUuid } from "@/lib/wiki/entry-path";
import type { EntryComment } from "@/type/entry";
import type { EntryErrorResponse } from "@/type/entry-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export interface EntryCommentsResponse {
  items: EntryComment[];
}

export interface CreateCommentResponse {
  comment: EntryComment;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "词条 ID 无效" },
      { status: 400 }
    );
  }

  const entry = await findEntryById(id);
  if (!entry || entry.status !== "published") {
    return NextResponse.json<EntryErrorResponse>(
      { error: "词条不存在" },
      { status: 404 }
    );
  }

  try {
    const items = await listCommentsByEntryId(id);
    return NextResponse.json<EntryCommentsResponse>({ items });
  } catch (error) {
    console.error("[GET /api/entries/:id/comments]", error);
    return NextResponse.json<EntryErrorResponse>(
      { error: "获取讨论失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "请先登录后再发表讨论" },
      { status: 401 }
    );
  }

  const user = await findUserById(userId);
  if (!user) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "用户不存在或会话已失效" },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "词条 ID 无效" },
      { status: 400 }
    );
  }

  const entry = await findEntryById(id);
  if (!entry || entry.status !== "published") {
    return NextResponse.json<EntryErrorResponse>(
      { error: "词条不存在或不可讨论" },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<EntryErrorResponse>(
      { error: "请求体必须是 JSON" },
      { status: 400 }
    );
  }

  const payload =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null;
  const content = normalizeCommentContent(payload?.content);
  if (!content) {
    return NextResponse.json<EntryErrorResponse>(
      {
        error: `评论内容不能为空，且不超过 ${COMMENT_CONTENT_MAX} 字`,
      },
      { status: 400 }
    );
  }

  try {
    const comment = await createComment({
      entryId: id,
      authorId: userId,
      content,
    });
    return NextResponse.json<CreateCommentResponse>({ comment }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/entries/:id/comments]", error);
    return NextResponse.json<EntryErrorResponse>(
      { error: "发表讨论失败" },
      { status: 500 }
    );
  }
}
