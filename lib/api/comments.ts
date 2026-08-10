import type { EntryComment } from "@/type/entry";
import type { EntryErrorResponse } from "@/type/entry-api";

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

/** POST /api/entries/:id/comments */
export async function createEntryComment(
  entryId: string,
  content: string
): Promise<EntryComment> {
  const response = await fetch(`/api/entries/${entryId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  const data = await parseJsonResponse<{ comment: EntryComment }>(response);
  return data.comment;
}

/** DELETE /api/entries/:id/comments/:commentId */
export async function deleteEntryComment(
  entryId: string,
  commentId: string
): Promise<void> {
  const response = await fetch(
    `/api/entries/${entryId}/comments/${commentId}`,
    { method: "DELETE" }
  );
  await parseJsonResponse<{ ok: boolean }>(response);
}
