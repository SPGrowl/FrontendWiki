import { NextResponse } from "next/server";
import { searchEntriesByName } from "@/lib/db/entries";
import type { EntryType } from "@/type/entry";
import type { EntryErrorResponse, EntrySearchResponse } from "@/type/entry-api";

const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 10;

function normalizeSearchType(value: string | null): EntryType | undefined {
  if (value === "common" || value === "blog") return value;
  return undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = normalizeSearchType(searchParams.get("type"));
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  if (!q) {
    return NextResponse.json<EntrySearchResponse>({ items: [] });
  }

  try {
    const items = await searchEntriesByName(q, limit, type ? { type } : undefined);
    return NextResponse.json<EntrySearchResponse>({ items });
  } catch (error) {
    console.error("[GET /api/entries/search]", error);
    return NextResponse.json<EntryErrorResponse>(
      { error: "搜索词条失败" },
      { status: 500 }
    );
  }
}
