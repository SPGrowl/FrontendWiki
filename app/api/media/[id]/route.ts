import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import {
  deleteMediaAsset,
  findMediaById,
  updateMediaTitle,
} from "@/lib/db/media";
import { findUserById, updateUserAvatar } from "@/lib/db/users";
import { deleteUploadFile } from "@/lib/media/storage";
import { normalizeMediaTitle } from "@/lib/media/validate-upload";
import { isUuid } from "@/lib/wiki/entry-path";
import type {
  MediaErrorResponse,
  MediaResponse,
} from "@/type/media-api";
import type { MediaAsset } from "@/type/media";
import type { User } from "@/type/user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AuthOk = {
  userId: string;
  user: User;
  asset: MediaAsset & { storageKey: string };
};

async function requireMediaOwnerOrAdmin(
  mediaId: string
): Promise<AuthOk | { error: NextResponse }> {
  const userId = await getSessionUserId();
  if (!userId) {
    return {
      error: NextResponse.json<MediaErrorResponse>(
        { error: "请先登录" },
        { status: 401 }
      ),
    };
  }

  const user = await findUserById(userId);
  if (!user) {
    return {
      error: NextResponse.json<MediaErrorResponse>(
        { error: "用户不存在或会话已失效" },
        { status: 401 }
      ),
    };
  }

  if (!isUuid(mediaId)) {
    return {
      error: NextResponse.json<MediaErrorResponse>(
        { error: "媒体 ID 无效" },
        { status: 400 }
      ),
    };
  }

  const asset = await findMediaById(mediaId);
  if (!asset) {
    return {
      error: NextResponse.json<MediaErrorResponse>(
        { error: "媒体不存在" },
        { status: 404 }
      ),
    };
  }

  const isAdmin = user.role === "admin";
  if (!isAdmin && asset.uploader.id !== userId) {
    return {
      error: NextResponse.json<MediaErrorResponse>(
        { error: "只能管理自己上传的图片" },
        { status: 403 }
      ),
    };
  }

  return { userId, user, asset };
}

function isAuthError(
  result: AuthOk | { error: NextResponse }
): result is { error: NextResponse } {
  return "error" in result;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const auth = await requireMediaOwnerOrAdmin(id);
  if (isAuthError(auth)) {
    return auth.error;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<MediaErrorResponse>(
      { error: "请求体必须是 JSON" },
      { status: 400 }
    );
  }

  const payload =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null;

  if (!payload || !("title" in payload)) {
    return NextResponse.json<MediaErrorResponse>(
      { error: "请提供 title" },
      { status: 400 }
    );
  }

  const title = normalizeMediaTitle(payload.title);
  if (title === null) {
    return NextResponse.json<MediaErrorResponse>(
      { error: "title 无效" },
      { status: 400 }
    );
  }

  try {
    const asset = await updateMediaTitle(id, title);
    if (!asset) {
      return NextResponse.json<MediaErrorResponse>(
        { error: "媒体不存在" },
        { status: 404 }
      );
    }
    return NextResponse.json<MediaResponse>({ asset });
  } catch (error) {
    console.error("[PATCH /api/media/:id]", error);
    return NextResponse.json<MediaErrorResponse>(
      { error: "更新失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const auth = await requireMediaOwnerOrAdmin(id);
  if (isAuthError(auth)) {
    return auth.error;
  }

  const { asset } = auth;

  try {
    const deleted = await deleteMediaAsset(id);
    if (!deleted) {
      return NextResponse.json<MediaErrorResponse>(
        { error: "媒体不存在" },
        { status: 404 }
      );
    }

    await deleteUploadFile(deleted.storageKey).catch((error) => {
      console.error("[DELETE /api/media/:id] file", error);
    });

    const owner = await findUserById(asset.uploader.id);
    if (owner?.avatar && owner.avatar === asset.url) {
      await updateUserAvatar(owner.id, "").catch((error) => {
        console.error("[DELETE /api/media/:id] clear avatar", error);
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/media/:id]", error);
    return NextResponse.json<MediaErrorResponse>(
      { error: "删除失败" },
      { status: 500 }
    );
  }
}
