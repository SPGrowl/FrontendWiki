import {
  getBlogEntryPageData,
  getCommonEntryPageData,
} from "@/lib/db/entries";

export interface WikiEntryData {
  id: string;
  title: string;
  content: string;
}

/** @deprecated 优先使用 getCommonEntryPageData / getBlogEntryPageData */
export async function getEntryById(id: string): Promise<WikiEntryData | null> {
  const common = await getCommonEntryPageData([id]);
  if (common) {
    return { id: common.id, title: common.title, content: common.content };
  }

  const blog = await getBlogEntryPageData(id);
  if (blog) {
    return { id: blog.id, title: blog.title, content: blog.content };
  }

  return null;
}

export function getAllEntryIds(): string[] {
  return [];
}
