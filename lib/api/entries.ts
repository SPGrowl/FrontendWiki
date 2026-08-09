import type {
  CreateEntryRequest,
  CreateEntryResponse,
  EntryErrorResponse,
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
