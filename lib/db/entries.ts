import crypto from "node:crypto";
import type { PoolClient } from "pg";
import { getPool, query } from "@/lib/db";
import { extractHeadings } from "@/lib/wiki/extract-headings";
import { buildEntryExcerpt } from "@/lib/wiki/entry-excerpt";
import {
  buildBreadcrumbs,
  buildCommonEntryHref,
  buildEntryHref,
  buildEntryHistoryHref,
  isUuid,
  resolveEntryHref,
  type EntryPathNode,
} from "@/lib/wiki/entry-path";
import {
  classifyMarkdownHref,
  hrefFromEntryParams,
  resolveEntrySlug,
  validateSlug,
} from "@/lib/wiki/entry-slug";
import type {
  BreadcrumbItem,
  Contributor,
  Entry,
  EntryDiffPageData,
  EntryHistoryPageData,
  EntryLink,
  EntryPageData,
  EntryType,
  EntryVersion,
  EntryVersionDiffSide,
  EntryVersionListItem,
  RecentBlogItem,
  RecentContributionItem,
  RelatedEntryies,
  UserBlogItem,
} from "@/type/entry";
import type {
  EntryPreviewData,
  EntrySearchItem,
} from "@/type/entry-api";
import type { UserRole } from "@/type/user";

export type { EntrySearchItem };

interface EntryRow {
  id: string;
  type: EntryType;
  parent_id: string | null;
  slug: string;
  name: string;
  href: string;
  status: Entry["status"];
  current_version_id: string | null;
  creator_id: string;
  created_at: Date;
  updated_at: Date;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  );
}

interface EntryVersionRow {
  id: string;
  entry_id: string;
  version_no: number;
  title: string;
  content: string;
  contributor_id: string;
  message: string;
  created_at: Date;
}

interface ChainRow {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  type: EntryType;
  depth: number;
}

function mapEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    type: row.type,
    parentId: row.parent_id,
    slug: row.slug,
    name: row.name,
    href: row.href,
    status: row.status,
    currentVersionId: row.current_version_id ?? "",
    creatorId: row.creator_id,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function mapEntryVersion(row: EntryVersionRow): EntryVersion {
  return {
    id: row.id,
    entryId: row.entry_id,
    versionNo: row.version_no,
    title: row.title,
    content: row.content,
    contributorId: row.contributor_id,
    message: row.message,
    createdAt: row.created_at.toISOString(),
  };
}

function mapChain(rows: ChainRow[]): EntryPathNode[] {
  return rows
    .sort((a, b) => b.depth - a.depth)
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      type: row.type,
    }));
}

async function fetchEntryChain(
  entryId: string,
  client?: PoolClient
): Promise<EntryPathNode[]> {
  const sql = `
    WITH RECURSIVE chain AS (
      SELECT id, parent_id, slug, name, type, 0 AS depth
      FROM entries
      WHERE id = $1
      UNION ALL
      SELECT e.id, e.parent_id, e.slug, e.name, e.type, c.depth + 1
      FROM entries e
      INNER JOIN chain c ON e.id = c.parent_id
    )
    SELECT id, parent_id, slug, name, type, depth
    FROM chain
  `;

  const result = client
    ? await client.query<ChainRow>(sql, [entryId])
    : await query<ChainRow>(sql, [entryId]);

  return mapChain(result.rows);
}

export async function searchEntriesByName(
  searchQuery: string,
  limit = 10,
  options?: { type?: EntryType }
): Promise<EntrySearchItem[]> {
  const typeFilter = options?.type;
  const { rows } = await query<
    Pick<EntryRow, "id" | "name" | "href"> & { content: string }
  >(
    typeFilter
      ? `SELECT e.id, e.name, e.href, v.content
         FROM entries e
         INNER JOIN entry_versions v ON v.id = e.current_version_id
         WHERE e.status = 'published'
           AND e.type = $3
           AND e.name ILIKE $1
         ORDER BY e.name
         LIMIT $2`
      : `SELECT e.id, e.name, e.href, v.content
         FROM entries e
         INNER JOIN entry_versions v ON v.id = e.current_version_id
         WHERE e.status = 'published'
           AND e.name ILIKE $1
         ORDER BY e.name
         LIMIT $2`,
    typeFilter
      ? [`%${searchQuery}%`, limit, typeFilter]
      : [`%${searchQuery}%`, limit]
  );

  const items: EntrySearchItem[] = [];
  for (const row of rows) {
    const chain = await fetchEntryChain(row.id);
    const breadcrumbs = buildBreadcrumbs(chain);
    items.push({
      id: row.id,
      name: row.name,
      href: row.href,
      breadcrumbs,
      breadcrumbPath: breadcrumbs.map((item) => item.name).join(" / "),
      excerpt: buildEntryExcerpt(row.content),
    });
  }

  return items;
}

/** 按站内 href（`entry/...` 或 `/entry/...`）取悬停预览；无效链接返回 null */
export async function getEntryPreviewByHref(
  href: string
): Promise<EntryPreviewData | null> {
  const entry = await getEntryPageDataByHref(href);
  if (!entry) return null;

  return {
    title: entry.title || entry.path,
    href: entry.path,
    excerpt: buildEntryExcerpt(entry.content),
  };
}

interface EntryPageRow {
  id: string;
  type: EntryType;
  parent_id: string | null;
  slug: string;
  name: string;
  href: string;
  title: string;
  content: string;
}

interface RelatedEntryRow {
  id: string;
  slug: string;
  name: string;
  type: EntryType;
  href: string;
}

function mapRelatedEntryRow(row: RelatedEntryRow): EntryLink {
  return {
    id: row.id,
    entryId: row.id,
    name: row.name,
    href: row.href,
  };
}

async function fetchRelatedEntries(
  entryId: string,
  parentId: string | null,
  entryType: EntryType,
  chain: EntryPathNode[]
): Promise<RelatedEntryies> {
  if (entryType === "blog") {
    const { rows: siblings } = await query<RelatedEntryRow>(
      `SELECT id, slug, name, type, href
       FROM entries
       WHERE type = 'blog'
         AND parent_id IS NULL
         AND status = 'published'
       ORDER BY name`
    );

    return {
      parentEntry: null,
      SiblingEntry: siblings.map(mapRelatedEntryRow),
      // 博客仅一级，不挂子词条树
      LinkedEntries: [],
    };
  }

  let parentEntry: EntryLink | null = null;
  if (parentId && chain.length >= 2) {
    const parentSegment = chain[chain.length - 2];
    parentEntry = {
      id: parentSegment.id,
      entryId: parentSegment.id,
      name: parentSegment.name,
      href: buildCommonEntryHref(chain.slice(0, -1)),
    };
  }

  const [{ rows: siblings }, { rows: children }] = await Promise.all([
    query<RelatedEntryRow>(
      `SELECT id, slug, name, type, href
       FROM entries
       WHERE parent_id IS NOT DISTINCT FROM $1
         AND type = 'common'
         AND status = 'published'
       ORDER BY name`,
      [parentId]
    ),
    query<RelatedEntryRow>(
      `SELECT id, slug, name, type, href
       FROM entries
       WHERE parent_id = $1
         AND type = 'common'
         AND status = 'published'
       ORDER BY name`,
      [entryId]
    ),
  ]);

  return {
    parentEntry,
    SiblingEntry: siblings.map(mapRelatedEntryRow),
    LinkedEntries: children.map(mapRelatedEntryRow),
  };
}

interface ContributorRow {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  created_at: Date;
  edit_count: number;
  last_contributed_at: Date;
}

async function getEntryContributors(entryId: string): Promise<Contributor[]> {
  const { rows } = await query<ContributorRow>(
    `SELECT u.id, u.name, u.role, u.avatar, u.created_at,
            COUNT(*)::int AS edit_count,
            MAX(v.created_at) AS last_contributed_at
     FROM entry_versions v
     JOIN users u ON u.id = v.contributor_id
     WHERE v.entry_id = $1
     GROUP BY u.id, u.name, u.role, u.avatar, u.created_at
     ORDER BY edit_count DESC, last_contributed_at DESC
     LIMIT 10`,
    [entryId]
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    avatar: row.avatar,
    createdAt: row.created_at.toISOString(),
    editCount: row.edit_count,
    lastContributedAt: row.last_contributed_at.toISOString(),
  }));
}

// 根据ID拉取页面数据
async function loadEntryPageData(entryId: string): Promise<EntryPageData | null> {
  const { rows } = await query<EntryPageRow>(
    `SELECT e.id, e.type, e.parent_id, e.slug, e.name, e.href,
            v.title, v.content
     FROM entries e
     INNER JOIN entry_versions v ON v.id = e.current_version_id
     WHERE e.id = $1 AND e.status = 'published'
     LIMIT 1`,
    [entryId]
  );

  const row = rows[0];
  if (!row) return null;

  const chain = await fetchEntryChain(row.id);
  const breadcrumbs = buildBreadcrumbs(chain);
  const [relatedEntries, contributors] = await Promise.all([
    fetchRelatedEntries(row.id, row.parent_id, row.type, chain),
    getEntryContributors(row.id),
  ]);

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    path: row.href,
    breadcrumbs,
    relatedEntries,
    contributors,
  };
}

async function findPublishedEntryIdByHref(
  href: string
): Promise<string | null> {
  const { rows } = await query<{ id: string }>(
    `SELECT id FROM entries
     WHERE href = $1 AND status = 'published'
     LIMIT 1`,
    [href]
  );
  return rows[0]?.id ?? null;
}

async function findRedirectEntryIdByPath(
  oldPath: string
): Promise<string | null> {
  const { rows } = await query<{ entry_id: string }>(
    `SELECT entry_id FROM entry_slug_redirects
     WHERE old_path = $1
     LIMIT 1`,
    [oldPath]
  );
  return rows[0]?.entry_id ?? null;
}

/** @deprecated 优先使用 getEntryPageDataByHref（按物化 href 直查） */
export async function getCommonEntryPageData(
  slugs: string[]
): Promise<EntryPageData | null> {
  if (slugs.length === 0) return null;
  if (slugs[0] === "blog") return null;

  let parentId: string | null = null;
  let entryId: string | null = null;

  for (const slug of slugs) {
    const matchedId = await findCommonEntryIdBySlug(slug, parentId);
    if (!matchedId) return null;
    entryId = matchedId;
    parentId = matchedId;
  }

  return loadEntryPageData(entryId!);
}

/**
 * 按明文词条 href（`/entry/...`）加载阅读页数据。
 * 优先查 entries.href；未命中再查 redirects。
 */
export async function getEntryPageDataByHref(
  href: string
): Promise<EntryPageData | null> {
  const parsed = classifyMarkdownHref(href);
  if (parsed.kind !== "entry") return null;

  const byHref = await findPublishedEntryIdByHref(parsed.href);
  if (byHref) return loadEntryPageData(byHref);

  const byRedirect = await findRedirectEntryIdByPath(parsed.href);
  if (byRedirect) {

    return loadEntryPageData(byRedirect);
  }

  return null;
}

/**
 * Next `params.slug` → 明文 href 再加载（catch-all 路由入口）。
 */
export async function getEntryPageDataByParams(
  paramsSlug: string[]
): Promise<EntryPageData | null> {
  const href = hrefFromEntryParams(paramsSlug);
  if (!href) return null;
  return getEntryPageDataByHref(href);
}

/** @deprecated 使用 getEntryPageDataByParams */
export async function getEntryPageDataBySegments(
  rawSlugs: string[]
): Promise<EntryPageData | null> {
  return getEntryPageDataByParams(rawSlugs);
}

interface HistoryVersionRow {
  id: string;
  version_no: number;
  title: string;
  message: string;
  contributor_id: string;
  contributor_name: string;
  contributor_avatar: string;
  created_at: Date;
  current_version_id: string | null;
  entry_name: string;
}

async function loadEntryHistoryPageData(
  entryId: string
): Promise<EntryHistoryPageData | null> {
  const { rows: entryRows } = await query<{
    id: string;
    name: string;
    href: string;
    status: string;
    current_version_id: string | null;
  }>(
    `SELECT id, name, href, status, current_version_id
     FROM entries
     WHERE id = $1 AND status = 'published'
     LIMIT 1`,
    [entryId]
  );

  const entry = entryRows[0];
  if (!entry) return null;

  const chain = await fetchEntryChain(entry.id);
  const breadcrumbs = buildBreadcrumbs(chain);
  const readPath = entry.href;

  const { rows } = await query<HistoryVersionRow>(
    `SELECT v.id, v.version_no, v.title, v.message, v.contributor_id,
            v.created_at, u.name AS contributor_name,
            u.avatar AS contributor_avatar,
            e.current_version_id, e.name AS entry_name
     FROM entry_versions v
     INNER JOIN users u ON u.id = v.contributor_id
     INNER JOIN entries e ON e.id = v.entry_id
     WHERE v.entry_id = $1
     ORDER BY v.version_no DESC`,
    [entryId]
  );

  const versions: EntryVersionListItem[] = rows.map((row, index) => {
    const older = rows[index + 1];
    return {
      id: row.id,
      versionNo: row.version_no,
      title: row.title,
      message: row.message || "（无提交说明）",
      contributorId: row.contributor_id,
      contributorName: row.contributor_name,
      contributorAvatar: row.contributor_avatar ?? "",
      createdAt: row.created_at.toISOString(),
      isCurrent: row.id === entry.current_version_id,
      previousVersionId: older?.id ?? null,
    };
  });

  const current = rows.find((row) => row.id === entry.current_version_id);

  return {
    entryId: entry.id,
    entryName: entry.name,
    title: current?.title ?? entry.name,
    readPath,
    breadcrumbs,
    versions,
  };
}

export async function getEntryHistoryPageDataBySegments(
  rawSlugs: string[]
): Promise<EntryHistoryPageData | null> {
  const page = await getEntryPageDataBySegments(rawSlugs);
  if (!page) return null;
  return loadEntryHistoryPageData(page.id);
}

interface DiffVersionRow {
  id: string;
  version_no: number;
  title: string;
  content: string;
  message: string;
  contributor_id: string;
  contributor_name: string;
  created_at: Date;
}

function mapDiffSide(
  row: DiffVersionRow,
  currentVersionId: string | null
): EntryVersionDiffSide {
  return {
    id: row.id,
    versionNo: row.version_no,
    title: row.title,
    content: row.content,
    message: row.message || "（无提交说明）",
    contributorId: row.contributor_id,
    contributorName: row.contributor_name,
    createdAt: row.created_at.toISOString(),
    isCurrent: row.id === currentVersionId,
  };
}

export async function getEntryDiffPageData(
  entryId: string,
  fromVersionId: string,
  toVersionId: string
): Promise<EntryDiffPageData | null> {
  if (!isUuid(fromVersionId) || !isUuid(toVersionId)) return null;

  const { rows: entryRows } = await query<{
    id: string;
    name: string;
    href: string;
    status: string;
    current_version_id: string | null;
  }>(
    `SELECT id, name, href, status, current_version_id
     FROM entries
     WHERE id = $1 AND status = 'published'
     LIMIT 1`,
    [entryId]
  );

  const entry = entryRows[0];
  if (!entry) return null;

  const { rows } = await query<DiffVersionRow>(
    `SELECT v.id, v.version_no, v.title, v.content, v.message,
            v.contributor_id, v.created_at, u.name AS contributor_name
     FROM entry_versions v
     INNER JOIN users u ON u.id = v.contributor_id
     WHERE v.entry_id = $1 AND v.id = ANY($2::uuid[])
     LIMIT 2`,
    [entryId, [fromVersionId, toVersionId]]
  );

  if (fromVersionId === toVersionId) return null;

  const fromRow = rows.find((row) => row.id === fromVersionId);
  const toRow = rows.find((row) => row.id === toVersionId);
  if (!fromRow || !toRow) return null;

  const chain = await fetchEntryChain(entry.id);
  const breadcrumbs = buildBreadcrumbs(chain);
  const readPath = entry.href;

  return {
    entryId: entry.id,
    entryName: entry.name,
    readPath,
    historyPath: buildEntryHistoryHref(readPath),
    breadcrumbs,
    from: mapDiffSide(fromRow, entry.current_version_id),
    to: mapDiffSide(toRow, entry.current_version_id),
  };
}

export async function getEntryDiffPageDataBySegments(
  rawSlugs: string[],
  fromVersionId: string,
  toVersionId: string
): Promise<EntryDiffPageData | null> {
  const page = await getEntryPageDataBySegments(rawSlugs);
  if (!page) return null;
  return getEntryDiffPageData(page.id, fromVersionId, toVersionId);
}

const DEFAULT_RECENT_CONTRIBUTIONS = 10;

/**
 * 首页近期贡献：按版本时间倒序。
 * 仅 published 的 common 词条，不含 blog。
 */
export async function listRecentContributions(
  limit = DEFAULT_RECENT_CONTRIBUTIONS
): Promise<RecentContributionItem[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const { rows } = await query<{
    version_id: string;
    entry_id: string;
    entry_name: string;
    entry_href: string;
    message: string;
    contributor_id: string;
    contributor_name: string;
    created_at: Date;
  }>(
    `SELECT v.id AS version_id,
            v.entry_id,
            e.name AS entry_name,
            e.href AS entry_href,
            v.message,
            v.contributor_id,
            u.name AS contributor_name,
            v.created_at
     FROM entry_versions v
     INNER JOIN entries e ON e.id = v.entry_id
     INNER JOIN users u ON u.id = v.contributor_id
     WHERE e.status = 'published'
       AND e.type = 'common'
     ORDER BY v.created_at DESC
     LIMIT $1`,
    [safeLimit]
  );

  const items: RecentContributionItem[] = [];
  for (const row of rows) {
    items.push({
      versionId: row.version_id,
      entryId: row.entry_id,
      entryName: row.entry_name,
      entryHref: row.entry_href,
      message: row.message?.trim() || "（无提交说明）",
      contributorId: row.contributor_id,
      contributorName: row.contributor_name,
      createdAt: row.created_at.toISOString(),
    });
  }

  return items;
}

const DEFAULT_RECENT_BLOGS = 5;

/**
 * 首页近期博客：按更新时间倒序。
 */
export async function listRecentBlogs(
  limit = DEFAULT_RECENT_BLOGS
): Promise<RecentBlogItem[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const { rows } = await query<{
    id: string;
    href: string;
    title: string;
    author_id: string;
    author_name: string;
    updated_at: Date;
  }>(
    `SELECT e.id, e.href, v.title,
            e.creator_id AS author_id,
            u.name AS author_name,
            e.updated_at
     FROM entries e
     INNER JOIN entry_versions v ON v.id = e.current_version_id
     INNER JOIN users u ON u.id = e.creator_id
     WHERE e.type = 'blog'
       AND e.status = 'published'
     ORDER BY e.updated_at DESC
     LIMIT $1`,
    [safeLimit]
  );

  return rows.map((row) => ({
    entryId: row.id,
    title: row.title,
    href: row.href,
    authorId: row.author_id,
    authorName: row.author_name,
    updatedAt: row.updated_at.toISOString(),
  }));
}

/**
 * 用户主页：某用户对百科词条的近期编辑（不含博客）。
 */
export async function listUserContributions(
  userId: string,
  limit = 30
): Promise<RecentContributionItem[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const { rows } = await query<{
    version_id: string;
    entry_id: string;
    entry_name: string;
    entry_href: string;
    message: string;
    contributor_id: string;
    contributor_name: string;
    created_at: Date;
  }>(
    `SELECT v.id AS version_id,
            v.entry_id,
            e.name AS entry_name,
            e.href AS entry_href,
            v.message,
            v.contributor_id,
            u.name AS contributor_name,
            v.created_at
     FROM entry_versions v
     INNER JOIN entries e ON e.id = v.entry_id
     INNER JOIN users u ON u.id = v.contributor_id
     WHERE e.status = 'published'
       AND e.type = 'common'
       AND v.contributor_id = $1
     ORDER BY v.created_at DESC
     LIMIT $2`,
    [userId, safeLimit]
  );

  const items: RecentContributionItem[] = [];
  for (const row of rows) {
    items.push({
      versionId: row.version_id,
      entryId: row.entry_id,
      entryName: row.entry_name,
      entryHref: row.entry_href,
      message: row.message?.trim() || "（无提交说明）",
      contributorId: row.contributor_id,
      contributorName: row.contributor_name,
      createdAt: row.created_at.toISOString(),
    });
  }

  return items;
}

/**
 * 用户主页：该用户创建的已发布博客。
 */
export async function listUserBlogs(
  userId: string,
  limit = 30
): Promise<UserBlogItem[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const { rows } = await query<{
    id: string;
    href: string;
    title: string;
    updated_at: Date;
  }>(
    `SELECT e.id, e.href, v.title, e.updated_at
     FROM entries e
     INNER JOIN entry_versions v ON v.id = e.current_version_id
     WHERE e.creator_id = $1
       AND e.type = 'blog'
       AND e.status = 'published'
     ORDER BY e.updated_at DESC
     LIMIT $2`,
    [userId, safeLimit]
  );

  return rows.map((row) => ({
    entryId: row.id,
    title: row.title,
    href: row.href,
    updatedAt: row.updated_at.toISOString(),
  }));
}

async function findCommonEntryIdBySlug(
  slug: string,
  parentId: string | null
): Promise<string | null> {
  const { rows } = await query<{ id: string }>(
    `SELECT id FROM entries
     WHERE slug = $1
       AND type = 'common'
       AND status = 'published'
       AND parent_id IS NOT DISTINCT FROM $2
     LIMIT 1`,
    [slug, parentId]
  );

  return rows[0]?.id ?? null;
}

export interface CreateEntryInput {
  name: string;
  content: string;
  parentId: string | null;
  creatorId: string;
  type: EntryType;
  slug?: string | null;
  message?: string;
}

export interface CreateEntryResult {
  entry: Entry;
  version: EntryVersion;
  href: string;
  breadcrumbs: BreadcrumbItem[];
  breadcrumbPath: string;
}

export interface UpdateEntryInput {
  entryId: string;
  contributorId: string;
  canEditMetadata: boolean;
  content: string;
  name?: string;
  slug?: string;
  /** undefined 表示不修改；null 表示设为根级 */
  parentId?: string | null;
  message?: string;
}

export interface EntryEditPageData {
  id: string;
  type: EntryType;
  slug: string;
  name: string;
  creatorId: string;
  parentId: string | null;
  title: string;
  content: string;
  path: string;
  parent: EntrySearchItem | null;
}

export type UpdateEntryResult = CreateEntryResult;

async function buildEntrySearchItem(
  entryId: string
): Promise<EntrySearchItem | null> {
  const { rows } = await query<
    Pick<EntryRow, "id" | "name" | "href" | "status"> & {
      content: string | null;
    }
  >(
    `SELECT e.id, e.name, e.href, e.status, v.content
     FROM entries e
     LEFT JOIN entry_versions v ON v.id = e.current_version_id
     WHERE e.id = $1
     LIMIT 1`,
    [entryId]
  );

  const row = rows[0];
  if (!row || row.status !== "published") return null;

  const chain = await fetchEntryChain(entryId);
  const breadcrumbs = buildBreadcrumbs(chain);

  return {
    id: row.id,
    name: row.name,
    href: row.href,
    breadcrumbs,
    breadcrumbPath: breadcrumbs.map((item) => item.name).join(" / "),
    excerpt: buildEntryExcerpt(row.content ?? ""),
  };
}

export async function findEntrySearchItem(
  entryId: string
): Promise<EntrySearchItem | null> {
  return buildEntrySearchItem(entryId);
}

export async function getEntryEditPageData(
  entryId: string
): Promise<EntryEditPageData | null> {
  const { rows } = await query<EntryPageRow & { creator_id: string }>(
    `SELECT e.id, e.type, e.parent_id, e.slug, e.name, e.href, e.creator_id,
            v.title, v.content
     FROM entries e
     INNER JOIN entry_versions v ON v.id = e.current_version_id
     WHERE e.id = $1 AND e.status = 'published'
     LIMIT 1`,
    [entryId]
  );

  const row = rows[0];
  if (!row) return null;

  const parent = row.parent_id
    ? await buildEntrySearchItem(row.parent_id)
    : null;

  return {
    id: row.id,
    type: row.type,
    slug: row.slug,
    name: row.name,
    creatorId: row.creator_id,
    parentId: row.parent_id,
    title: row.title,
    content: row.content,
    path: row.href,
    parent,
  };
}

async function isEntryAncestor(
  client: PoolClient,
  ancestorId: string,
  entryId: string
): Promise<boolean> {
  let currentId: string | null = entryId;

  while (currentId) {
    if (currentId === ancestorId) return true;

    const result: { rows: Array<{ parent_id: string | null }> } =
      await client.query<{ parent_id: string | null }>(
      `SELECT parent_id FROM entries WHERE id = $1 LIMIT 1`,
      [currentId]
    );
    currentId = result.rows[0]?.parent_id ?? null;
  }

  return false;
}

async function loadCurrentVersion(
  client: PoolClient,
  entryId: string,
  versionId: string
): Promise<EntryVersionRow | null> {
  const result = await client.query<EntryVersionRow>(
    `SELECT id, entry_id, version_no, title, content, contributor_id, message, created_at
     FROM entry_versions
     WHERE id = $1 AND entry_id = $2
     LIMIT 1`,
    [versionId, entryId]
  );

  return result.rows[0] ?? null;
}

function buildUpdateResult(
  entryRow: EntryRow,
  versionRow: EntryVersionRow,
  chain: EntryPathNode[]
): UpdateEntryResult {
  const breadcrumbs = buildBreadcrumbs(chain);
  const href = entryRow.href || buildEntryHref(chain);

  return {
    entry: mapEntry(entryRow),
    version: mapEntryVersion(versionRow),
    href,
    breadcrumbs,
    breadcrumbPath: breadcrumbs.map((item) => item.name).join(" / "),
  };
}

export async function findEntryById(id: string): Promise<Entry | null> {
  const { rows } = await query<EntryRow>(
    `SELECT id, type, parent_id, slug, name, href, status, current_version_id,
            creator_id, created_at, updated_at
     FROM entries
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  return rows[0] ? mapEntry(rows[0]) : null;
}

export async function findParentEntryForCreate(
  parentId: string
): Promise<Entry | null> {
  const { rows } = await query<EntryRow>(
    `SELECT id, type, parent_id, slug, name, href, status, current_version_id,
            creator_id, created_at, updated_at
     FROM entries
     WHERE id = $1 AND status = 'published' AND type = 'common'
     LIMIT 1`,
    [parentId]
  );

  return rows[0] ? mapEntry(rows[0]) : null;
}

/**
 * 将 root 的新 href 写入自身，并按树级联更新所有子孙 href；
 * 变更前的路径写入 entry_slug_redirects。
 */
async function cascadeEntryHrefs(
  client: PoolClient,
  rootEntryId: string,
  rootNewHref: string
): Promise<void> {
  const { rows } = await client.query<{
    id: string;
    parent_id: string | null;
    slug: string;
    href: string;
    depth: number;
  }>(
    `WITH RECURSIVE subtree AS (
       SELECT id, parent_id, slug, href, 0 AS depth
       FROM entries
       WHERE id = $1
       UNION ALL
       SELECT e.id, e.parent_id, e.slug, e.href, s.depth + 1
       FROM entries e
       INNER JOIN subtree s ON e.parent_id = s.id
     )
     SELECT id, parent_id, slug, href, depth
     FROM subtree
     ORDER BY depth ASC`,
    [rootEntryId]
  );

  if (rows.length === 0) return;

  const newHrefById = new Map<string, string>();
  newHrefById.set(rootEntryId, rootNewHref);

  const updates: Array<{ id: string; oldHref: string; newHref: string }> = [];

  for (const row of rows) {
    let newHref: string;
    if (row.id === rootEntryId) {
      newHref = rootNewHref;
    } else {
      const parentHref = newHrefById.get(row.parent_id!);
      if (!parentHref) {
        throw new Error("级联更新 href 时缺少父级路径");
      }
      newHref = `${parentHref}/${row.slug}`;
    }
    newHrefById.set(row.id, newHref);

    if (row.href !== newHref) {
      updates.push({ id: row.id, oldHref: row.href, newHref });
    }
  }

  for (const update of updates) {
    await client.query(
      `DELETE FROM entry_slug_redirects WHERE old_path = $1`,
      [update.newHref]
    );
    await client.query(
      `INSERT INTO entry_slug_redirects (entry_id, old_path)
       VALUES ($1, $2)
       ON CONFLICT (old_path) DO UPDATE
       SET entry_id = EXCLUDED.entry_id`,
      [update.id, update.oldHref]
    );
    await client.query(
      `UPDATE entries
       SET href = $1, updated_at = NOW()
       WHERE id = $2`,
      [update.newHref, update.id]
    );
  }
}

async function resolveParentHref(
  client: PoolClient,
  parentId: string | null
): Promise<string | null> {
  if (!parentId) return null;
  const result = await client.query<{ href: string }>(
    `SELECT href FROM entries
     WHERE id = $1 AND status = 'published' AND type = 'common'
     LIMIT 1`,
    [parentId]
  );
  return result.rows[0]?.href ?? null;
}

function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export async function createEntry(
  input: CreateEntryInput
): Promise<CreateEntryResult> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const slugResult = resolveEntrySlug(input.name, input.slug);
    if (!slugResult.ok) {
      throw new Error(slugResult.error);
    }

    const slug = slugResult.slug;
    const type = input.type;
    if (type === "blog" && input.parentId !== null) {
      throw new Error("博客词条不能有父级");
    }

    const parentHref = await resolveParentHref(client, input.parentId);
    if (input.parentId && !parentHref) {
      throw new Error("上级词条不存在或不可作为父级");
    }

    const href = resolveEntryHref(type, slug, parentHref);
    const toc = extractHeadings(input.content);
    const contentHash = hashContent(input.content);

    const entryResult = await client.query<EntryRow>(
      `INSERT INTO entries (type, parent_id, slug, name, href, creator_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, type, parent_id, slug, name, href, status, current_version_id,
                 creator_id, created_at, updated_at`,
      [type, input.parentId, slug, input.name, href, input.creatorId]
    );

    const entryRow = entryResult.rows[0];
    const entryId = entryRow.id;

    const versionResult = await client.query<EntryVersionRow>(
      `INSERT INTO entry_versions (
         entry_id, version_no, title, content, contributor_id, message, toc_json, content_hash
       )
       VALUES ($1, 1, $2, $3, $4, $5, $6, $7)
       RETURNING id, entry_id, version_no, title, content, contributor_id, message, created_at`,
      [
        entryId,
        input.name,
        input.content,
        input.creatorId,
        input.message ?? "Initial version",
        JSON.stringify(toc),
        contentHash,
      ]
    );

    const versionRow = versionResult.rows[0];

    await client.query(
      `UPDATE entries
       SET current_version_id = $1, updated_at = NOW()
       WHERE id = $2`,
      [versionRow.id, entryId]
    );

    await client.query("COMMIT");

    entryRow.current_version_id = versionRow.id;

    const chain = await fetchEntryChain(entryId, client);
    const breadcrumbs = buildBreadcrumbs(chain);

    return {
      entry: mapEntry(entryRow),
      version: mapEntryVersion(versionRow),
      href: entryRow.href,
      breadcrumbs,
      breadcrumbPath: breadcrumbs.map((item) => item.name).join(" / "),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    if (isUniqueViolation(error)) {
      throw new Error("URL 路径已被占用，请更换别名或上级词条");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function updateEntry(
  input: UpdateEntryInput
): Promise<UpdateEntryResult> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const entryResult = await client.query<EntryRow>(
      `SELECT id, type, parent_id, slug, name, href, status, current_version_id,
              creator_id, created_at, updated_at
       FROM entries
       WHERE id = $1 AND status = 'published'
       LIMIT 1
       FOR UPDATE`,
      [input.entryId]
    );

    const entryRow = entryResult.rows[0];
    if (!entryRow) {
      throw new Error("词条不存在或不可编辑");
    }

    if (!entryRow.current_version_id) {
      throw new Error("词条当前版本无效");
    }

    const currentVersion = await loadCurrentVersion(
      client,
      input.entryId,
      entryRow.current_version_id
    );

    if (!currentVersion) {
      throw new Error("词条当前版本无效");
    }

    let metadataChanged = false;
    let contentChanged = currentVersion.content !== input.content;

    if (input.canEditMetadata) {
      const nextName = input.name ?? entryRow.name;
      const nextSlug = input.slug ?? entryRow.slug;
      const nextParentId =
        input.parentId !== undefined ? input.parentId : entryRow.parent_id;

      if (entryRow.type === "blog" && nextParentId !== null) {
        throw new Error("博客词条不能有父级");
      }

      if (nextParentId) {
        if (nextParentId === entryRow.id) {
          throw new Error("词条不能以自己为上级");
        }

        const parent = await findParentEntryForCreate(nextParentId);
        if (!parent) {
          throw new Error("上级词条不存在或不可作为父级");
        }

        if (await isEntryAncestor(client, entryRow.id, nextParentId)) {
          throw new Error("不能将下级词条设为上级");
        }
      }

      const slugValidation = validateSlug(nextSlug);
      if (!slugValidation.valid) {
        throw new Error(slugValidation.reason ?? "URL 别名无效");
      }

      const pathChanged =
        nextSlug !== entryRow.slug || nextParentId !== entryRow.parent_id;

      if (
        nextName !== entryRow.name ||
        nextSlug !== entryRow.slug ||
        nextParentId !== entryRow.parent_id
      ) {
        await client.query(
          `UPDATE entries
           SET name = $1, slug = $2, parent_id = $3, updated_at = NOW()
           WHERE id = $4`,
          [nextName, nextSlug, nextParentId, entryRow.id]
        );

        entryRow.name = nextName;
        entryRow.slug = nextSlug;
        entryRow.parent_id = nextParentId;
        metadataChanged = true;

        if (pathChanged) {
          const parentHref = await resolveParentHref(client, nextParentId);
          if (nextParentId && !parentHref) {
            throw new Error("上级词条不存在或不可作为父级");
          }
          const nextHref = resolveEntryHref(
            entryRow.type,
            nextSlug,
            parentHref
          );
          await cascadeEntryHrefs(client, entryRow.id, nextHref);
          entryRow.href = nextHref;
        }

        if (nextName !== currentVersion.title) {
          await client.query(
            `UPDATE entry_versions
             SET title = $1
             WHERE id = $2`,
            [nextName, currentVersion.id]
          );
          currentVersion.title = nextName;
        }
      }
    } else if (
      (input.name !== undefined &&
        input.name !== entryRow.name &&
        input.name !== currentVersion.title) ||
      input.slug !== undefined ||
      input.parentId !== undefined
    ) {
      throw new Error("无权修改词条名称、URL 别名或上级词条");
    }

    let versionRow = currentVersion;

    if (contentChanged) {
      const versionNoResult = await client.query<{ next: number }>(
        `SELECT COALESCE(MAX(version_no), 0) + 1 AS next
         FROM entry_versions
         WHERE entry_id = $1`,
        [input.entryId]
      );

      const versionNo = versionNoResult.rows[0]?.next ?? 1;
      const toc = extractHeadings(input.content);
      const contentHash = hashContent(input.content);

      const versionResult = await client.query<EntryVersionRow>(
        `INSERT INTO entry_versions (
           entry_id, version_no, title, content, contributor_id, message, toc_json, content_hash
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, entry_id, version_no, title, content, contributor_id, message, created_at`,
        [
          input.entryId,
          versionNo,
          entryRow.name,
          input.content,
          input.contributorId,
          input.message ?? "Updated version",
          JSON.stringify(toc),
          contentHash,
        ]
      );

      versionRow = versionResult.rows[0];

      await client.query(
        `UPDATE entries
         SET current_version_id = $1, updated_at = NOW()
         WHERE id = $2`,
        [versionRow.id, input.entryId]
      );

      entryRow.current_version_id = versionRow.id;
    } else if (!metadataChanged) {
      throw new Error("没有可保存的变更");
    }

    await client.query("COMMIT");

    const chain = await fetchEntryChain(input.entryId, client);
    return buildUpdateResult(entryRow, versionRow, chain);
  } catch (error) {
    await client.query("ROLLBACK");
    if (isUniqueViolation(error)) {
      throw new Error("URL 路径已被占用，请更换别名或上级词条");
    }
    throw error;
  } finally {
    client.release();
  }
}
