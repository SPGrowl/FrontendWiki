import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { deleteComment, findCommentById } from "@/lib/db/comments";
import { findUserById } from "@/lib/db/users";
import { isUuid } from "@/lib/wiki/entry-path";
import type { EntryErrorResponse } from "@/type/entry-api";

type RouteContext = {
  params: Promise<{ id: string; commentId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "请先登录后再删除评论" },
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

  const { id: entryId, commentId } = await context.params;
  if (!isUuid(entryId) || !isUuid(commentId)) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "参数无效" },
      { status: 400 }
    );
  }

  const existing = await findCommentById(commentId);
  if (!existing || existing.entryId !== entryId) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "评论不存在" },
      { status: 404 }
    );
  }

  const isAdmin = user.role === "admin";
  if (!isAdmin && existing.authorId !== userId) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "只能删除自己的评论" },
      { status: 403 }
    );
  }

  try {
    const ok = await deleteComment({
      commentId,
      entryId,
      requesterId: userId,
      isAdmin,
    });
    if (!ok) {
      return NextResponse.json<EntryErrorResponse>(
        { error: "删除失败" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/entries/:id/comments/:commentId]", error);
    return NextResponse.json<EntryErrorResponse>(
      { error: "删除评论失败" },
      { status: 500 }
    );
  }
}
