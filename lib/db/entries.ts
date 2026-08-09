import crypto from "node:crypto";
import type { PoolClient } from "pg";
import { getPool, query } from "@/lib/db";
import { extractHeadings } from "@/lib/wiki/extract-headings";
import {
  buildBreadcrumbs,
  buildBlogEntryHref,
  buildCommonEntryHref,
  buildEntryHref,
  isUuid,
  type EntryPathSegment,
} from "@/lib/wiki/entry-path";
import { normalizePathSegment, resolveEntrySlug, validateSlug } from "@/lib/wiki/entry-slug";
import type {
  BreadcrumbItem,
  Contributor,
  Entry,
  EntryLink,
  EntryPageData,
  EntryType,
  EntryVersion,
  RelatedEntryies,
} from "@/type/entry";
import type { UserRole } from "@/type/user";

interface EntryRow {
  id: string;
  type: EntryType;
  parent_id: string | null;
  slug: string;
  name: string;
  status: Entry["status"];
  current_version_id: string | null;
  creator_id: string;
  created_at: Date;
  updated_at: Date;
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

function mapChain(rows: ChainRow[]): EntryPathSegment[] {
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
): Promise<EntryPathSegment[]> {
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

export interface EntrySearchItem {
  id: string;
  name: string;
  href: string;
  breadcrumbs: BreadcrumbItem[];
  breadcrumbPath: string;
}

export async function searchEntriesByName(
  searchQuery: string,
  limit = 10,
  options?: { type?: EntryType }
): Promise<EntrySearchItem[]> {
  const typeFilter = options?.type;
  const { rows } = await query<Pick<EntryRow, "id" | "name">>(
    typeFilter
      ? `SELECT id, name
         FROM entries
         WHERE status = 'published'
           AND type = $3
           AND name ILIKE $1
         ORDER BY name
         LIMIT $2`
      : `SELECT id, name
         FROM entries
         WHERE status = 'published'
           AND name ILIKE $1
         ORDER BY name
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
      href: buildEntryHref(chain),
      breadcrumbs,
      breadcrumbPath: breadcrumbs.map((item) => item.name).join(" / "),
    });
  }

  return items;
}

interface EntryPageRow {
  id: string;
  type: EntryType;
  parent_id: string | null;
  slug: string;
  name: string;
  title: string;
  content: string;
}

interface RelatedEntryRow {
  id: string;
  slug: string;
  name: string;
  type: EntryType;
}

function mapRelatedEntryRow(
  row: RelatedEntryRow,
  chain: EntryPathSegment[]
): EntryLink {
  return {
    id: row.id,
    entryId: row.id,
    name: row.name,
    href: buildEntryHref(chain),
  };
}

async function fetchRelatedEntries(
  entryId: string,
  parentId: string | null,
  entryType: EntryType,
  chain: EntryPathSegment[]
): Promise<RelatedEntryies> {
  if (entryType === "blog") {
    const { rows: siblings } = await query<RelatedEntryRow>(
      `SELECT id, slug, name, type
       FROM entries
       WHERE type = 'blog'
         AND parent_id IS NULL
         AND status = 'published'
       ORDER BY name`
    );

    return {
      parentEntry: null,
      SiblingEntry: siblings.map((row) => ({
        id: row.id,
        entryId: row.id,
        name: row.name,
        href: buildBlogEntryHref(row.slug),
      })),
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
      `SELECT id, slug, name, type
       FROM entries
       WHERE parent_id IS NOT DISTINCT FROM $1
         AND type = 'common'
         AND status = 'published'
       ORDER BY name`,
      [parentId]
    ),
    query<RelatedEntryRow>(
      `SELECT id, slug, name, type
       FROM entries
       WHERE parent_id = $1
         AND type = 'common'
         AND status = 'published'
       ORDER BY name`,
      [entryId]
    ),
  ]);

  const ancestorChain = chain.slice(0, -1);

  return {
    parentEntry,
    SiblingEntry: siblings.map((row) =>
      mapRelatedEntryRow(row, [
        ...ancestorChain,
        { id: row.id, slug: row.slug, name: row.name, type: row.type },
      ])
    ),
    LinkedEntries: children.map((row) =>
      mapRelatedEntryRow(row, [
        ...chain,
        { id: row.id, slug: row.slug, name: row.name, type: row.type },
      ])
    ),
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

async function loadEntryPageData(entryId: string): Promise<EntryPageData | null> {
  const { rows } = await query<EntryPageRow>(
    `SELECT e.id, e.type, e.parent_id, e.slug, e.name,
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
  const path = buildEntryHref(chain);

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    path,
    breadcrumbs,
    relatedEntries,
    contributors,
  };
}

async function findBlogEntryIdBySlug(slug: string): Promise<string | null> {
  const { rows } = await query<{ id: string }>(
    `SELECT id FROM entries
     WHERE slug = $1
       AND type = 'blog'
       AND parent_id IS NULL
       AND status = 'published'
     LIMIT 1`,
    [slug]
  );
  return rows[0]?.id ?? null;
}

async function findBlogEntryIdByUuid(entryId: string): Promise<string | null> {
  if (!isUuid(entryId)) return null;
  const { rows } = await query<{ id: string }>(
    `SELECT id FROM entries
     WHERE id = $1 AND type = 'blog' AND parent_id IS NULL AND status = 'published'
     LIMIT 1`,
    [entryId]
  );
  return rows[0]?.id ?? null;
}

/**
 * 博客词条：/entry/blog/{slug}
 * 兼容旧 URL /entry/blog/{uuid}
 */
export async function getBlogEntryPageData(
  slugOrId: string
): Promise<EntryPageData | null> {
  const segment = normalizePathSegment(slugOrId);
  const entryId =
    (await findBlogEntryIdBySlug(segment)) ??
    (await findBlogEntryIdByUuid(segment));
  if (!entryId) return null;
  return loadEntryPageData(entryId);
}

/** 普通词条：按 slug 路径逐级解析（不含 blog 段） */
export async function getCommonEntryPageData(
  rawSlugs: string[]
): Promise<EntryPageData | null> {
  if (rawSlugs.length === 0) return null;

  const slugs = rawSlugs.map(normalizePathSegment);
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
 * 统一阅读页解析：
 * - ["blog", slug|uuid] → 博客
 * - 其他 → 普通词条树
 */
export async function getEntryPageDataBySegments(
  rawSlugs: string[]
): Promise<EntryPageData | null> {
  if (rawSlugs.length === 0) return null;

  const slugs = rawSlugs.map(normalizePathSegment);
  if (slugs[0] === "blog") {
    if (slugs.length !== 2) return null;
    return getBlogEntryPageData(slugs[1]);
  }

  return getCommonEntryPageData(slugs);
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
  const entry = await findEntryById(entryId);
  if (!entry || entry.status !== "published") return null;

  const chain = await fetchEntryChain(entryId);
  const breadcrumbs = buildBreadcrumbs(chain);

  return {
    id: entry.id,
    name: entry.name,
    href: buildEntryHref(chain),
    breadcrumbs,
    breadcrumbPath: breadcrumbs.map((item) => item.name).join(" / "),
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
  const { rows } = await query<
    EntryPageRow & { creator_id: string }
  >(
    `SELECT e.id, e.type, e.parent_id, e.slug, e.name, e.creator_id,
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
  const path = buildEntryHref(chain);

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
    path,
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
  chain: EntryPathSegment[]
): UpdateEntryResult {
  const breadcrumbs = buildBreadcrumbs(chain);
  const href = buildEntryHref(chain);

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
    `SELECT id, type, parent_id, slug, name, status, current_version_id,
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
    `SELECT id, type, parent_id, slug, name, status, current_version_id,
            creator_id, created_at, updated_at
     FROM entries
     WHERE id = $1 AND status = 'published' AND type = 'common'
     LIMIT 1`,
    [parentId]
  );

  return rows[0] ? mapEntry(rows[0]) : null;
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
    const toc = extractHeadings(input.content);
    const contentHash = hashContent(input.content);

    const entryResult = await client.query<EntryRow>(
      `INSERT INTO entries (type, parent_id, slug, name, creator_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, type, parent_id, slug, name, status, current_version_id,
                 creator_id, created_at, updated_at`,
      [type, input.parentId, slug, input.name, input.creatorId]
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
    const href = buildEntryHref(chain);

    return {
      entry: mapEntry(entryRow),
      version: mapEntryVersion(versionRow),
      href,
      breadcrumbs,
      breadcrumbPath: breadcrumbs.map((item) => item.name).join(" / "),
    };
  } catch (error) {
    await client.query("ROLLBACK");
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
      `SELECT id, type, parent_id, slug, name, status, current_version_id,
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
    throw error;
  } finally {
    client.release();
  }
}
