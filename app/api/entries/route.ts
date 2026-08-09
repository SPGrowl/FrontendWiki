import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { createEntry, findParentEntryForCreate } from "@/lib/db/entries";
import { resolveEntrySlug } from "@/lib/wiki/entry-slug";
import {
  normalizeEntryContent,
  normalizeEntryName,
  normalizeEntrySlugInput,
  normalizeEntryType,
  normalizeParentId,
} from "@/lib/wiki/validate-entry-input";
import type {
  CreateEntryResponse,
  EntryErrorResponse,
} from "@/type/entry-api";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "请先登录后再创建词条" },
      { status: 401 }
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

  const name = normalizeEntryName(payload?.name);
  const content = normalizeEntryContent(payload?.content);
  const parentId = normalizeParentId(payload?.parentId);
  const slugInput = normalizeEntrySlugInput(payload?.slug);
  const typeInput = normalizeEntryType(payload?.type);
  const message =
    typeof payload?.message === "string" ? payload.message.trim() : undefined;

  if (!name || !content) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "词条名与正文不能为空" },
      { status: 400 }
    );
  }

  if (parentId === undefined || slugInput === undefined) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "parentId 或 slug 格式无效" },
      { status: 400 }
    );
  }

  if (
    payload?.type !== undefined &&
    typeInput === undefined
  ) {
    return NextResponse.json<EntryErrorResponse>(
      { error: "type 必须是 common 或 blog" },
      { status: 400 }
    );
  }

  const type =
    typeInput === "common" || typeInput === "blog"
      ? typeInput
      : parentId
        ? "common"
        : "blog";

  if (type === "common" && parentId) {
    const parent = await findParentEntryForCreate(parentId);
    if (!parent) {
      return NextResponse.json<EntryErrorResponse>(
        { error: "上级词条不存在或不可作为父级" },
        { status: 400 }
      );
    }
  } else if (type === "blog") {
    if (parentId) {
      return NextResponse.json<EntryErrorResponse>(
        { error: "博客词条不能有父级" },
        { status: 400 }
      );
    }
  }

  const slugResult = resolveEntrySlug(name, slugInput);
  if (!slugResult.ok) {
    return NextResponse.json<EntryErrorResponse>(
      { error: slugResult.error },
      { status: 400 }
    );
  }

  try {
    const result = await createEntry({
      name,
      content,
      parentId: type === "common" ? parentId : null,
      type,
      slug: slugResult.slug,
      creatorId: userId,
      message,
    });

    return NextResponse.json<CreateEntryResponse>(result, { status: 201 });
  } catch (error) {
    const pgCode =
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code;

    if (pgCode === "23505") {
      return NextResponse.json<EntryErrorResponse>(
        { error: "同级路径下已存在相同 URL 别名，请修改标题或 URL 别名" },
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
