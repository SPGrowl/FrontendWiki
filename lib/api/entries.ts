import type {
  CreateEntryRequest,
  CreateEntryResponse,
  EntryErrorResponse,
  EntryPreviewResponse,
  EntrySearchResponse,
  UpdateEntryRequest,
  UpdateEntryResponse,
} from "@/type/entry-api";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T;
  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as EntryErrorResponse).error === "string"
        ? (data as EntryErrorResponse).error
        : `请求失败 (${response.status})`;
    throw new Error(message);
  }
  return data;
}

/** GET /api/entries/search?q=...&type=common|blog */
export async function searchEntries(
  q: string,
  options?: { limit?: number; type?: "common" | "blog" }
): Promise<EntrySearchResponse> {
  const params = new URLSearchParams({ q });
  if (options?.limit !== undefined) {
    params.set("limit", String(options.limit));
  }
  if (options?.type) {
    params.set("type", options.type);
  }

  const response = await fetch(`/api/entries/search?${params.toString()}`);
  return parseJsonResponse<EntrySearchResponse>(response);
}

/**
 * GET /api/entries/preview?href=entry/...
 * 无效链接返回 preview: null + error，不抛错（便于悬停卡展示）。
 */
export async function fetchEntryPreview(
  href: string
): Promise<EntryPreviewResponse> {
  const params = new URLSearchParams({ href });
  const response = await fetch(`/api/entries/preview?${params.toString()}`);
  const data = (await response.json()) as Partial<EntryPreviewResponse> &
    Partial<EntryErrorResponse>;

  if (response.status >= 500) {
    throw new Error(
      typeof data.error === "string" ? data.error : "获取词条预览失败"
    );
  }

  return {
    preview: data.preview ?? null,
    error:
      typeof data.error === "string" ? data.error : undefined,
  };
}

/** POST /api/entries */
export async function createEntry(
  body: CreateEntryRequest
): Promise<CreateEntryResponse> {
  const response = await fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse<CreateEntryResponse>(response);
}

/** PATCH /api/entries/:id */
export async function updateEntry(
  entryId: string,
  body: UpdateEntryRequest
): Promise<UpdateEntryResponse> {
  const response = await fetch(`/api/entries/${entryId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse<UpdateEntryResponse>(response);
}
