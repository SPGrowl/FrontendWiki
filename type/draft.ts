import type { EntryType } from "@/type/entry";

export type DraftType = "new" | "edit";

export interface EntryDraft {
  id: string;
  userId: string;
  entryId: string | null;
  draftType: DraftType;
  name: string;
  content: string;
  message: string;
  entryType: EntryType | null;
  parentId: string | null;
  slug: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DraftListItem extends EntryDraft {
  entryLabel: string;
  editHref: string;
  entryHref: string | null;
}
