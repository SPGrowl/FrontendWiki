import type { DraftListItem, DraftType, EntryDraft } from "@/type/draft";
import type { EntryType } from "@/type/entry";
import type { CreateEntryResponse } from "@/type/entry-api";

export interface DraftErrorResponse {
  error: string;
}

export interface DraftListResponse {
  items: DraftListItem[];
}

export interface DraftResponse {
  draft: EntryDraft;
}

export interface CreateDraftRequest {
  draftType: DraftType;
  name: string;
  content: string;
  message?: string;
  entryId?: string;
  entryType?: EntryType;
  parentId?: string | null;
  slug?: string | null;
}

export interface UpdateDraftRequest {
  name?: string;
  content?: string;
  message?: string;
  entryType?: EntryType;
  parentId?: string | null;
  slug?: string | null;
}

export type PublishDraftResponse = CreateEntryResponse & {
  draftId: string;
};
