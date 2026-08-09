import type { EntryType } from "@/type/entry";

const NAME_MIN = 1;
const NAME_MAX = 128;
const CONTENT_MIN = 1;
const CONTENT_MAX = 512_000;

export function normalizeEntryName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.normalize("NFC").trim();
  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) return null;
  return trimmed;
}

export function normalizeEntrySlugInput(
  slug: unknown
): string | null | undefined {
  if (slug === undefined) return undefined;
  if (slug === null || slug === "") return null;
  if (typeof slug !== "string") return undefined;
  const trimmed = slug.normalize("NFC").trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeEntryContent(content: unknown): string | null {
  if (typeof content !== "string") return null;
  const trimmed = content.trim();
  if (trimmed.length < CONTENT_MIN || trimmed.length > CONTENT_MAX) return null;
  return trimmed;
}

export function normalizeParentId(parentId: unknown): string | null | undefined {
  if (parentId === undefined || parentId === null || parentId === "") {
    return null;
  }
  if (typeof parentId !== "string") return undefined;
  const trimmed = parentId.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeEntryType(
  type: unknown
): EntryType | null | undefined {
  if (type === undefined) return undefined;
  if (type === null || type === "") return null;
  if (type === "common" || type === "blog") return type;
  return undefined;
}
