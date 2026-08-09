import { NextResponse } from "next/server";
import { searchEntriesByName } from "@/lib/db/entries";
import type { EntryErrorResponse, EntrySearchResponse } from "@/type/entry-api";

const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  if (!q) {
    return NextResponse.json<EntrySearchResponse>({ items: [] });
  }

  try {
    const items = await searchEntriesByName(q, limit);
    return NextResponse.json<EntrySearchResponse>({ items });
  } catch (error) {
    console.error("[GET /api/entries/search]", error);
    return NextResponse.json<EntryErrorResponse>(
      { error: "搜索词条失败" },
      { status: 500 }
    );
  }
}
