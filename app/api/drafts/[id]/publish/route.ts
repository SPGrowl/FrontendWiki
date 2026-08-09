import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { publishDraft } from "@/lib/db/drafts";
import type {
  DraftErrorResponse,
  PublishDraftResponse,
} from "@/type/draft-api";
import type { EntryErrorResponse } from "@/type/entry-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<DraftErrorResponse>(
      { error: "请先登录后再发布草稿" },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  try {
    const result = await publishDraft(id, userId);

    if (!result) {
      return NextResponse.json<DraftErrorResponse>(
        { error: "草稿不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json<PublishDraftResponse>(result);
  } catch (error) {
    if (error instanceof Error && error.message === "没有可保存的变更") {
      return NextResponse.json<EntryErrorResponse>(
        { error: error.message },
        { status: 400 }
      );
    }

    const pgCode =
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code;

    if (pgCode === "23505") {
      return NextResponse.json<DraftErrorResponse>(
        { error: "同级路径下已存在相同 URL 别名，请修改后重试" },
        { status: 409 }
      );
    }

    if (error instanceof Error && error.message) {
      return NextResponse.json<DraftErrorResponse>(
        { error: error.message },
        { status: 400 }
      );
    }

    throw error;
  }
}
