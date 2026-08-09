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

export type EntryPublishTarget = "root" | "child" | "blog";

export interface CreateEntryRequest {
  name: string;
  content: string;
  parentId?: string | null;
  slug?: string | null;
  /** common：根级或子词条；blog：博客。默认无 parentId 时为 blog（兼容旧客户端） */
  type?: EntryType;
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
