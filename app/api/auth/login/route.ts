import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
// 字段校验
import { normalizeName, normalizePassword } from "@/lib/auth/validate-auth-input";
import { findUserByName } from "@/lib/db/users";
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

  if (!name || !password) {
    return NextResponse.json<AuthErrorResponse>(
      {
        error: `用户名长度 ${2}-${32} 字符，密码长度 ${6}-${128} 字符`,
      },
      { status: 400 }
    );
  }

  const userRecord = await findUserByName(name);
  if (
    !userRecord ||
    !userRecord.password ||
    !(await verifyPassword(password, userRecord.password))
  ) {
    return NextResponse.json<AuthErrorResponse>(
      { error: "用户名或密码错误" },
      { status: 401 }
    );
  }

  const { password: _password, ...user } = userRecord;
  await setSessionCookie(user.id);

  return NextResponse.json<AuthResponse>({ user });
}
