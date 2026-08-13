import { NextResponse } from "next/server";
import {
  readUploadFile,
  resolveSafeStorageKey,
} from "@/lib/media/storage";
import { MIME_TO_EXT } from "@/lib/media/constants";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const EXT_TO_MIME = Object.fromEntries(
  Object.entries(MIME_TO_EXT).map(([mime, ext]) => [ext, mime])
) as Record<string, string>;

/**
 * GET /uploads/* — 提供 storage/uploads 下的静态图片
 * （不放 public/，避免提交二进制；URL 仍为 /uploads/...）
 */
export async function GET(_request: Request, context: RouteContext) {
  const { path: segments } = await context.params;
  const key = resolveSafeStorageKey(segments);
  if (!key) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const bytes = await readUploadFile(key);
  if (!bytes) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const contentType = EXT_TO_MIME[ext] ?? "application/octet-stream";

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
