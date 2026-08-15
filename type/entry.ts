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
  /** 规范阅读路径（库内唯一），如 /entry/js 或 /entry/blog/foo */
  href: string;
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


/** 路径树上的展示节点：跳转用 href，展示用 name，段标识用 slug */
export interface BreadcrumbItem {
  name: string;
  href: string;
  slug: string;
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
  /** 空字符串表示无头像，前端回退占位 */
  contributorAvatar: string;
  createdAt: string;
  isCurrent: boolean;
  /** 时间序上的上一版（更旧）；首版为 null */
  previousVersionId: string | null;
}

/** 版本历史页读模型 */
export interface EntryHistoryPageData {
  entryId: string;
  entryName: string;
  title: string;
  readPath: string;
  breadcrumbs: BreadcrumbItem[];
  versions: EntryVersionListItem[];
}

/** 单侧版本（对比用） */
export interface EntryVersionDiffSide {
  id: string;
  versionNo: number;
  title: string;
  content: string;
  message: string;
  contributorId: string;
  contributorName: string;
  createdAt: string;
  isCurrent: boolean;
}

/** 版本对比页读模型 */
export interface EntryDiffPageData {
  entryId: string;
  entryName: string;
  readPath: string;
  historyPath: string;
  breadcrumbs: BreadcrumbItem[];
  /** 较旧一侧 */
  from: EntryVersionDiffSide;
  /** 较新一侧 */
  to: EntryVersionDiffSide;
}

/** 首页近期贡献（仅百科词条编辑，不含博客） */
export interface RecentContributionItem {
  versionId: string;
  entryId: string;
  entryName: string;
  entryHref: string;
  message: string;
  contributorId: string;
  contributorName: string;
  createdAt: string;
}

/** 用户主页：该用户发布的博客摘要 */
export interface UserBlogItem {
  entryId: string;
  title: string;
  href: string;
  updatedAt: string;
}

/** 首页近期博客 */
export interface RecentBlogItem {
  entryId: string;
  title: string;
  href: string;
  authorId: string;
  authorName: string;
  updatedAt: string;
}

/** 讨论评论（单体，暂无回复） */
export interface EntryComment {
  id: string;
  entryId: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  /** 空字符串表示无头像，前端回退占位 */
  authorAvatar: string;
}

/** 讨论页读模型 */
export interface EntryDiscussPageData {
  entryId: string;
  entryName: string;
  title: string;
  readPath: string;
  breadcrumbs: BreadcrumbItem[];
  comments: EntryComment[];
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
