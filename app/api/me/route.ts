import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { findUserById, updateUserAvatar } from "@/lib/db/users";
import { normalizeAvatarUrl } from "@/lib/media/validate-upload";
import type { AuthErrorResponse, AuthResponse } from "@/type/user";

/** GET /api/me — 当前登录用户 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<AuthErrorResponse>(
      { error: "请先登录" },
      { status: 401 }
    );
  }

  const user = await findUserById(userId);
  if (!user) {
    return NextResponse.json<AuthErrorResponse>(
      { error: "用户不存在或会话已失效" },
      { status: 401 }
    );
  }

  return NextResponse.json<AuthResponse>({ user });
}

/**
 * PATCH /api/me
 * body: { avatar?: string }  空字符串清空；仅允许 /uploads/avatar/...
 */
export async function PATCH(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<AuthErrorResponse>(
      { error: "请先登录" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<AuthErrorResponse>(
      { error: "请求体必须是 JSON" },
      { status: 400 }
    );
  }

  const payload =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null;

  if (!payload || !("avatar" in payload)) {
    return NextResponse.json<AuthErrorResponse>(
      { error: "请提供 avatar 字段" },
      { status: 400 }
    );
  }

  const avatar = normalizeAvatarUrl(payload.avatar);
  if (avatar === null) {
    return NextResponse.json<AuthErrorResponse>(
      {
        error:
          "avatar 须为空或本站头像路径（/uploads/avatar/...），请先上传 purpose=avatar",
      },
      { status: 400 }
    );
  }

  try {
    const user = await updateUserAvatar(userId, avatar);
    if (!user) {
      return NextResponse.json<AuthErrorResponse>(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    return NextResponse.json<AuthResponse>({ user });
  } catch (error) {
    console.error("[PATCH /api/me]", error);
    return NextResponse.json<AuthErrorResponse>(
      { error: "更新资料失败" },
      { status: 500 }
    );
  }
}
