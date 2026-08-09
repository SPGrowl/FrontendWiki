import type { DraftType } from "@/type/draft";
import type { EntryType } from "@/type/entry";

const NAME_MIN = 1;
const NAME_MAX = 128;
const CONTENT_MAX = 512_000;
const MESSAGE_MAX = 500;

export function normalizeDraftName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.normalize("NFC").trim();
  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) return null;
  return trimmed;
}

export function normalizeDraftContent(content: unknown): string | null {
  if (typeof content !== "string") return null;
  if (content.length > CONTENT_MAX) return null;
  return content;
}

export function normalizeDraftMessage(message: unknown): string {
  if (typeof message !== "string") return "";
  return message.normalize("NFC").trim().slice(0, MESSAGE_MAX);
}

export function normalizeDraftType(type: unknown): DraftType | null {
  if (type === "new" || type === "edit") return type;
  return null;
}

export function normalizeDraftEntryType(
  type: unknown
): EntryType | null | undefined {
  if (type === undefined || type === null || type === "") return undefined;
  if (type === "common" || type === "blog") return type;
  return null;
}

export function normalizeDraftSlug(slug: unknown): string | null | undefined {
  if (slug === undefined) return undefined;
  if (slug === null || slug === "") return null;
  if (typeof slug !== "string") return undefined;
  const trimmed = slug.normalize("NFC").trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeDraftParentId(
  parentId: unknown
): string | null | undefined {
  if (parentId === undefined) return undefined;
  if (parentId === null || parentId === "") return null;
  if (typeof parentId !== "string") return undefined;
  const trimmed = parentId.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeDraftEntryId(entryId: unknown): string | null {
  if (typeof entryId !== "string") return null;
  const trimmed = entryId.trim();
  return trimmed.length > 0 ? trimmed : null;
}
