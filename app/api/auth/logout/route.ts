import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

export async function POST() {
  await clearSessionCookie();

  const response = NextResponse.json({ ok: true });
  // 在 Response 上再清一次，确保 Set-Cookie 一定回到浏览器
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
