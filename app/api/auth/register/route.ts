import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import {
  normalizeAvatar,
  normalizeName,
  normalizePassword,
} from "@/lib/auth/validate-auth-input";
import { createUser, isNameTaken } from "@/lib/db/users";
import type { AuthErrorResponse, AuthResponse } from "@/type/user";

export async function POST(request: Request) {
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

  const name = normalizeName(payload?.name);
  const password = normalizePassword(payload?.password);
  const avatar = normalizeAvatar(payload?.avatar);

  if (!name || !password) {
    return NextResponse.json<AuthErrorResponse>(
      {
        error: `用户名长度 ${2}-${32} 字符，密码长度 ${6}-${128} 字符`,
      },
      { status: 400 }
    );
  }

  if (await isNameTaken(name)) {
    return NextResponse.json<AuthErrorResponse>(
      { error: "用户名已被占用" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await createUser({ name, passwordHash, avatar });
    await setSessionCookie(user.id);
    return NextResponse.json<AuthResponse>({ user }, { status: 201 });
  } catch (error) {
    const pgCode =
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code;

    if (pgCode === "23505") {
      return NextResponse.json<AuthErrorResponse>(
        { error: "用户名已被占用" },
        { status: 409 }
      );
    }

    throw error;
  }
}
