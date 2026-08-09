import { NextResponse } from "next/server";
import { canEditEntryMetadata } from "@/lib/auth/entry-permissions";
import { getSessionUserId } from "@/lib/auth/session";
import { findEntryById, updateEntry } from "@/lib/db/entries";
import { findUserById } from "@/lib/db/users";
import {
  normalizeEntryContent,
  normalizeEntryName,
  normalizeEntrySlugInput,
  normalizeParentId,
} from "@/lib/wiki/validate-entry-input";
import type {
  EntryErrorResponse,
  UpdateEntryResponse,
} from "@/type/entry-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "请先登录后再编辑词条" },
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

  const content = normalizeEntryContent(payload?.content);
  const name = normalizeEntryName(payload?.name);
  const slugInput = normalizeEntrySlugInput(payload?.slug);
  const parentId = normalizeParentId(payload?.parentId);
  const message =
    typeof payload?.message === "string" ? payload.message.trim() : undefined;

  if (!content) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "正文不能为空" },
      { status: 400 }
    );
  }

  const entry = await findEntryById(id);
  if (!entry || entry.status !== "published") {
    return NextResponse.json<EntryErrorResponse>(
      { error: "词条不存在或不可编辑" },
      { status: 404 }
    );
  }

  const metadataAllowed = canEditEntryMetadata(user, entry.creatorId);

  if (
    !metadataAllowed &&
    (payload?.name !== undefined ||
      payload?.slug !== undefined ||
      payload?.parentId !== undefined)
  ) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "无权修改词条名称、URL 别名或上级词条" },
      { status: 403 }
    );
  }

  if (metadataAllowed) {
    if (payload?.name !== undefined && !name) {
      return NextResponse.json<EntryErrorResponse>(
        { error: "词条名称无效" },
        { status: 400 }
      );
    }

    if (payload?.slug !== undefined) {
      if (slugInput === undefined || !slugInput) {
        return NextResponse.json<EntryErrorResponse>(
          { error: "URL 别名无效" },
          { status: 400 }
        );
      }
    }

    if (payload?.parentId !== undefined && parentId === undefined) {
      return NextResponse.json<EntryErrorResponse>(
        { error: "parentId 格式无效" },
        { status: 400 }
      );
    }
  }

  try {
    const result = await updateEntry({
      entryId: id,
      contributorId: userId,
      canEditMetadata: metadataAllowed,
      content,
      name: metadataAllowed && name ? name : undefined,
      slug:
        metadataAllowed && payload?.slug !== undefined && slugInput
          ? slugInput
          : undefined,
      parentId:
        metadataAllowed && payload?.parentId !== undefined
          ? parentId
          : undefined,
      message,
    });

    return NextResponse.json<UpdateEntryResponse>(result);
  } catch (error) {
    if (error instanceof Error && error.message === "词条不存在或不可编辑") {
      return NextResponse.json<EntryErrorResponse>(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message === "没有可保存的变更") {
      return NextResponse.json<EntryErrorResponse>(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("无权")) {
      return NextResponse.json<EntryErrorResponse>(
        { error: error.message },
        { status: 403 }
      );
    }

    const pgCode =
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code;

    if (pgCode === "23505") {
      return NextResponse.json<EntryErrorResponse>(
        { error: "同级路径下已存在相同 URL 别名" },
        { status: 409 }
      );
    }

    if (error instanceof Error && error.message) {
      return NextResponse.json<EntryErrorResponse>(
        { error: error.message },
        { status: 400 }
      );
    }

    throw error;
  }
}
