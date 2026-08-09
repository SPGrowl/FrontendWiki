import { getEntryPageDataBySegments } from "@/lib/db/entries";

export interface WikiEntryData {
  id: string;
  title: string;
  content: string;
}

/** @deprecated 优先使用 getEntryPageDataBySegments */
export async function getEntryById(id: string): Promise<WikiEntryData | null> {
  const entry = await getEntryPageDataBySegments([id]);
  if (!entry) return null;
  return { id: entry.id, title: entry.title, content: entry.content };
}

export function getAllEntryIds(): string[] {
  return [];
}
