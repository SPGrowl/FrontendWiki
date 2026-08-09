import type { BreadcrumbItem, Entry, EntryVersion } from "@/type/entry";

export interface EntrySearchItem {
  id: string;
  name: string;
  href: string;
  breadcrumbs: BreadcrumbItem[];
  breadcrumbPath: string;
}

export interface EntrySearchResponse {
  items: EntrySearchItem[];
}

import type { EntryType } from "@/type/entry";

/** 创建时选定的词条类型（创建后不可变） */
export type EntryCreateType = "common" | "blog";

/** @deprecated 使用 EntryCreateType；root/child 已合并进父词条选择器 */
export type EntryPublishTarget = EntryCreateType;

export interface CreateEntryRequest {
  name: string;
  content: string;
  parentId?: string | null;
  slug?: string | null;
  /** common：百科词条（根级或子级）；blog：博客。创建后不可变 */
  type: EntryType;
  message?: string;
}

export interface CreateEntryResponse {
  entry: Entry;
  version: EntryVersion;
  href: string;
  breadcrumbs: BreadcrumbItem[];
  breadcrumbPath: string;
}

export interface UpdateEntryRequest {
  content: string;
  /** 词条名称；仅管理员或创建者可提交 */
  name?: string;
  /** URL 别名；仅管理员或创建者可提交 */
  slug?: string;
  /** 上级词条 ID；null 表示根级；仅管理员或创建者可提交 */
  parentId?: string | null;
  message?: string;
}

export type UpdateEntryResponse = CreateEntryResponse;

export interface EntryErrorResponse {
  error: string;
}
