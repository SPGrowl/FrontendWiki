import { findLatestEditDraftForEntry } from "@/lib/db/drafts";
import { query } from "@/lib/db";
import { buildEntrySearchItemById } from "@/lib/db/entries";
import { classifyMarkdownHref } from "@/lib/wiki/entry-slug";
import type {
  EntryEditBundle,
  EntryEditCurrentVersion,
  EntryEditDraft,
  EntryEditMetadata,
  EntryType,
} from "@/type/entry";

interface EditBundleRow {
  id: string;
  type: EntryType;
  parent_id: string | null;
  slug: string;
  name: string;
  href: string;
  creator_id: string;
  version_id: string;
  version_no: number;
  content: string;
  version_message: string;
  contributor_id: string;
}

/**
 * 编辑页按 href 一次装载三块：
 * 1. metadata — name / slug / type / parent / href（名称锁定 entries.name）
 * 2. currentVersion — current_version_id 指向的正文版本
 * 3. draft — 传入 userId 时拉该用户最新 edit 草稿（仅 content + message）；否则 null
 */
export async function getEntryEditBundleByHref(
  href: string,
  userId?: string
): Promise<EntryEditBundle | null> {
  const parsed = classifyMarkdownHref(href);
  if (parsed.kind !== "entry") return null;

  const { rows } = await query<EditBundleRow>(
    `SELECT e.id, e.type, e.parent_id, e.slug, e.name, e.href, e.creator_id,
            v.id AS version_id, v.version_no, v.content,
            v.message AS version_message, v.contributor_id
     FROM entries e
     INNER JOIN entry_versions v ON v.id = e.current_version_id
     WHERE e.href = $1 AND e.status = 'published'
     LIMIT 1`,
    [parsed.href]
  );

  const row = rows[0];
  if (!row) {
    const { rows: redirects } = await query<{ entry_id: string }>(
      `SELECT entry_id FROM entry_slug_redirects
       WHERE old_path = $1
       LIMIT 1`,
      [parsed.href]
    );
    const redirectedId = redirects[0]?.entry_id;
    if (!redirectedId) return null;

    const { rows: again } = await query<EditBundleRow>(
      `SELECT e.id, e.type, e.parent_id, e.slug, e.name, e.href, e.creator_id,
              v.id AS version_id, v.version_no, v.content,
              v.message AS version_message, v.contributor_id
       FROM entries e
       INNER JOIN entry_versions v ON v.id = e.current_version_id
       WHERE e.id = $1 AND e.status = 'published'
       LIMIT 1`,
      [redirectedId]
    );
    if (!again[0]) return null;
    return assembleEditBundle(again[0], userId);
  }

  return assembleEditBundle(row, userId);
}

async function assembleEditBundle(
  row: EditBundleRow,
  userId?: string
): Promise<EntryEditBundle> {
  const parent = row.parent_id
    ? await buildEntrySearchItemById(row.parent_id)
    : null;

  const metadata: EntryEditMetadata = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    href: row.href,
    parentId: row.parent_id,
    parent,
    creatorId: row.creator_id,
  };

  const currentVersion: EntryEditCurrentVersion = {
    id: row.version_id,
    content: row.content,
    versionNo: row.version_no,
    message: row.version_message,
    contributorId: row.contributor_id,
  };

  let draft: EntryEditDraft | null = null;
  if (userId) {
    const draftRow = await findLatestEditDraftForEntry(userId, row.id);
    if (draftRow) {
      draft = {
        id: draftRow.id,
        content: draftRow.content,
        message: draftRow.message,
      };
    }
  }

  return { metadata, currentVersion, draft };
}
