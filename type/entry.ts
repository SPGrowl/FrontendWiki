import type { User} from "@/type/user";

/** 词条类型，对应 entries.type CHECK 约束 */
export type EntryType = "common" | "blog" | "stub";

/** 发布状态，对应 entries.status CHECK 约束 */
export type EntryStatus = "published" | "archived";

/**
 * 词条表（entries）
 * 仅存本体与外键；正文内容在 EntryVersion，派生导航数据在 EntryView
 */
export interface Contributor extends User{
  // 本条目中编辑次数
  editCount: number;
  // 最近编辑本条目的时间
  lastContributedAt: string;
}
export interface Entry {
  id: string;
  type: EntryType;
  name:string
  parentId: string | null;
  /** 本级 URL 片段，同级唯一；完整路径由祖先 slug 拼接 */
  slug: string;
  status: EntryStatus;
  currentVersionId: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
//参考的外站链接，如vue.js.com,建议嵌入正文内容
  // reference:Array<{
  //   name: string;
  //   href: string;
  // }>
}

/**
 * 词条版本表（entry_versions，append-only）
 * tocJson / contentHash 在写入时由后端预计算
 */
export interface EntryVersion {
  // 标题来源于版本
  id: string;
  title:string;
  entryId: string;
  /** 词条内自增序号，从 1 开始 */
  versionNo: number;
  /** Markdown 正文 */
  content: string;
  contributorId: string;
  // 类似 git commit message
  message: string
  createdAt: string;
}

/** 词条关联表（entry_links） */
export interface  RelatedEntryies {
  parentEntry:EntryLink | null,
  SiblingEntry:EntryLink[] | null,
  LinkedEntries:EntryLink[] | null;
}

/** slug 变更重定向（entry_slug_redirects） */
export interface EntrySlugRedirect {
  id: string;
  entryId: string;
  oldPath: string;
  createdAt: string;
}

/** 目录项，与 lib/wiki/extract-headings 输出结构一致 */
export interface TocItem {
  id: string;
  text: string;
  depth: number;
}

export interface EntryLink {
  id: string;
  entryId: string;
  name: string;
  href: string;
}


export interface BreadcrumbItem {
  id: string;
  slug: string;
  name: string;
  href: string;
}

/** 词条阅读页读模型 */
export interface EntryPageData {
  id: string;
  type: EntryType;
  title: string;
  content: string;
  path: string;
  breadcrumbs: BreadcrumbItem[];
  relatedEntries: RelatedEntryies;
  contributors: Contributor[];
}

/**
 * 词条详情读模型（一次请求返回的完整数据）
 * 扩展 Entry，附加当前版本与关联派生字段
 */
export interface EntryView extends Entry {
  // 视图层可切换至其他版本
  version: EntryVersion;
  /** canonical 路径，如 /entry/scripting-languages/javascript */
  path: string;
  creator: Contributor;
  contributors: Contributor[];
  relatedEntries: RelatedEntryies;
  breadcrumbs: BreadcrumbItem[];
}

/** 版本历史列表项 */
export interface EntryVersionListItem {
  id: string;
  versionNo: number;
  title: string;
  message: string;
  contributorId: string;
  contributorName: string;
  createdAt: string;
  isCurrent: boolean;
}

/** 版本历史页读模型 */
export interface EntryHistoryPageData {
  entryId: string;
  entryName: string;
  readPath: string;
  breadcrumbs: BreadcrumbItem[];
  relatedEntries: RelatedEntryies;
  versions: EntryVersionListItem[];
}

/** 指定版本阅读页读模型 */
export interface EntryVersionPageData extends EntryPageData {
  versionNo: number;
  versionMessage: string;
  contributorId: string;
  contributorName: string;
  versionCreatedAt: string;
  isCurrent: boolean;
}
