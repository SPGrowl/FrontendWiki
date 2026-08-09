import type {
  CreateDraftRequest,
  DraftErrorResponse,
  DraftListResponse,
  DraftResponse,
  PublishDraftResponse,
  UpdateDraftRequest,
} from "@/type/draft-api";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T;
  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as DraftErrorResponse).error === "string"
        ? (data as DraftErrorResponse).error
        : `请求失败 (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export async function listDrafts(entryId?: string): Promise<DraftListResponse> {
  const params = new URLSearchParams();
  if (entryId) {
    params.set("entryId", entryId);
  }

  const query = params.toString();
  const response = await fetch(`/api/drafts${query ? `?${query}` : ""}`);
  return parseJsonResponse<DraftListResponse>(response);
}

export async function getDraft(draftId: string): Promise<DraftResponse> {
  const response = await fetch(`/api/drafts/${draftId}`);
  return parseJsonResponse<DraftResponse>(response);
}

export async function createDraft(
  body: CreateDraftRequest
): Promise<DraftResponse> {
  const response = await fetch("/api/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse<DraftResponse>(response);
}

export async function updateDraft(
  draftId: string,
  body: UpdateDraftRequest
): Promise<DraftResponse> {
  const response = await fetch(`/api/drafts/${draftId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse<DraftResponse>(response);
}

export async function deleteDraft(draftId: string): Promise<void> {
  const response = await fetch(`/api/drafts/${draftId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseJsonResponse<DraftErrorResponse>(response);
  }
}

export async function publishDraft(
  draftId: string
): Promise<PublishDraftResponse> {
  const response = await fetch(`/api/drafts/${draftId}/publish`, {
    method: "POST",
  });
  return parseJsonResponse<PublishDraftResponse>(response);
}
