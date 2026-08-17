import type { DraftListItem, DraftType, EntryDraft } from "@/type/draft";
import type { EntryType } from "@/type/entry";
import type { CreateEntryResponse } from "@/type/entry-api";
import { canEditEntryMetadata } from "@/lib/auth/entry-permissions";
import { query } from "@/lib/db";
import {
  createEntry,
  findEntryById,
  updateEntry,
  type CreateEntryResult,
} from "@/lib/db/entries";
import { fetchEntryChainForDraft } from "@/lib/db/draft-path";
import { findUserById } from "@/lib/db/users";
import {
  buildEntryEditHref,
  buildEntryHref,
} from "@/lib/wiki/entry-path";

interface DraftRow {
  id: string;
  user_id: string;
  entry_id: string | null;
  draft_type: DraftType;
  name: string;
  content: string;
  message: string;
  entry_type: EntryType | null;
  parent_id: string | null;
  slug: string | null;
  created_at: Date;
  updated_at: Date;
}

interface DraftListRow extends DraftRow {
  entry_name: string | null;
}

function mapDraft(row: DraftRow): EntryDraft {
  return {
    id: row.id,
    userId: row.user_id,
    entryId: row.entry_id,
    draftType: row.draft_type,
    name: row.name,
    content: row.content,
    message: row.message,
    entryType: row.entry_type,
    parentId: row.parent_id,
    slug: row.slug,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export interface CreateDraftInput {
  userId: string;
  draftType: DraftType;
  name: string;
  content: string;
  message?: string;
  entryId?: string | null;
  entryType?: EntryType;
  parentId?: string | null;
  slug?: string | null;
}

export interface UpdateDraftInput {
  name?: string;
  content?: string;
  message?: string;
  entryType?: EntryType;
  parentId?: string | null;
  slug?: string | null;
}

async function buildDraftListItem(row: DraftListRow): Promise<DraftListItem> {
  const draft = mapDraft(row);

  if (draft.draftType === "new") {
    return {
      ...draft,
      entryLabel: "新词条",
      editHref: `/entry/new?draft=${draft.id}`,
      entryHref: null,
    };
  }

  const entryName = row.entry_name ?? draft.name;
  let editHref = "/entry/edit";
  let entryHref: string | null = null;

  if (draft.entryId) {
    const chain = await fetchEntryChainForDraft(draft.entryId);
    if (chain.length > 0) {
      entryHref = buildEntryHref(chain);
      editHref = `${buildEntryEditHref(entryHref)}?draft=${draft.id}`;
    }
  }

  return {
    ...draft,
    entryLabel: entryName,
    editHref,
    entryHref,
  };
}

export async function createDraft(input: CreateDraftInput): Promise<EntryDraft> {
  if (input.draftType === "edit") {
    if (!input.entryId) {
      throw new Error("编辑草稿必须关联词条");
    }

    const entry = await findEntryById(input.entryId);
    if (!entry || entry.status !== "published") {
      throw new Error("关联词条不存在或不可编辑");
    }
  }

  if (input.draftType === "new" && !input.entryType) {
    throw new Error("新建草稿必须指定词条类型");
  }

  const { rows } = await query<DraftRow>(
    `INSERT INTO entry_drafts (
       user_id, entry_id, draft_type, name, content, message,
       entry_type, parent_id, slug
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, user_id, entry_id, draft_type, name, content, message,
               entry_type, parent_id, slug, created_at, updated_at`,
    [
      input.userId,
      input.draftType === "edit" ? input.entryId : null,
      input.draftType,
      input.name,
      input.content,
      input.message ?? "",
      input.draftType === "new" ? input.entryType : null,
      input.parentId ?? null,
      input.slug ?? null,
    ]
  );

  return mapDraft(rows[0]);
}

export async function findDraftById(
  draftId: string,
  userId: string
): Promise<EntryDraft | null> {
  const { rows } = await query<DraftRow>(
    `SELECT id, user_id, entry_id, draft_type, name, content, message,
            entry_type, parent_id, slug, created_at, updated_at
     FROM entry_drafts
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [draftId, userId]
  );

  return rows[0] ? mapDraft(rows[0]) : null;
}

/** 当前用户对该词条的最新一条 edit 草稿（按 updated_at） */
export async function findLatestEditDraftForEntry(
  userId: string,
  entryId: string
): Promise<EntryDraft | null> {
  const { rows } = await query<DraftRow>(
    `SELECT id, user_id, entry_id, draft_type, name, content, message,
            entry_type, parent_id, slug, created_at, updated_at
     FROM entry_drafts
     WHERE user_id = $1
       AND entry_id = $2
       AND draft_type = 'edit'
     ORDER BY updated_at DESC
     LIMIT 1`,
    [userId, entryId]
  );

  return rows[0] ? mapDraft(rows[0]) : null;
}

export async function listDraftsByUser(
  userId: string,
  options?: { entryId?: string }
): Promise<DraftListItem[]> {
  const params: string[] = [userId];
  let entryFilter = "";

  if (options?.entryId) {
    params.push(options.entryId);
    entryFilter = "AND d.entry_id = $2";
  }

  const { rows } = await query<DraftListRow>(
    `SELECT d.id, d.user_id, d.entry_id, d.draft_type, d.name, d.content,
            d.message, d.entry_type, d.parent_id, d.slug, d.created_at,
            d.updated_at, e.name AS entry_name
     FROM entry_drafts d
     LEFT JOIN entries e ON e.id = d.entry_id
     WHERE d.user_id = $1 ${entryFilter}
     ORDER BY d.updated_at DESC`,
    params
  );

  return Promise.all(rows.map((row) => buildDraftListItem(row)));
}

export async function updateDraft(
  draftId: string,
  userId: string,
  input: UpdateDraftInput
): Promise<EntryDraft | null> {
  const existing = await findDraftById(draftId, userId);
  if (!existing) return null;

  const next = {
    name: input.name ?? existing.name,
    content: input.content ?? existing.content,
    message: input.message ?? existing.message,
    entryType: input.entryType ?? existing.entryType,
    parentId:
      input.parentId !== undefined ? input.parentId : existing.parentId,
    slug: input.slug !== undefined ? input.slug : existing.slug,
  };

  const { rows } = await query<DraftRow>(
    `UPDATE entry_drafts
     SET name = $3,
         content = $4,
         message = $5,
         entry_type = $6,
         parent_id = $7,
         slug = $8,
         updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, entry_id, draft_type, name, content, message,
               entry_type, parent_id, slug, created_at, updated_at`,
    [
      draftId,
      userId,
      next.name,
      next.content,
      next.message,
      next.entryType,
      next.parentId,
      next.slug,
    ]
  );

  return rows[0] ? mapDraft(rows[0]) : null;
}

export async function deleteDraft(
  draftId: string,
  userId: string
): Promise<boolean> {
  const result = await query(
    `DELETE FROM entry_drafts WHERE id = $1 AND user_id = $2`,
    [draftId, userId]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function publishDraft(
  draftId: string,
  userId: string
): Promise<(CreateEntryResult & { draftId: string }) | null> {
  const draft = await findDraftById(draftId, userId);
  if (!draft) return null;

  const user = await findUserById(userId);
  if (!user) {
    throw new Error("用户不存在或会话已失效");
  }

  if (!draft.content.trim()) {
    throw new Error("草稿正文不能为空");
  }

  let result: CreateEntryResponse;

  if (draft.draftType === "new") {
    if (!draft.entryType) {
      throw new Error("新建草稿缺少词条类型");
    }

    result = await createEntry({
      name: draft.name,
      content: draft.content,
      type: draft.entryType,
      parentId: draft.entryType === "common" ? draft.parentId : null,
      slug: draft.slug,
      creatorId: userId,
      message: draft.message || undefined,
    });
  } else {
    if (!draft.entryId) {
      throw new Error("编辑草稿缺少关联词条");
    }

    const entry = await findEntryById(draft.entryId);
    if (!entry || entry.status !== "published") {
      throw new Error("关联词条不存在或不可编辑");
    }

    const metadataAllowed = canEditEntryMetadata(user, entry.creatorId);

    result = await updateEntry({
      entryId: draft.entryId,
      contributorId: userId,
      canEditMetadata: metadataAllowed,
      content: draft.content,
      message: draft.message || undefined,
      name: metadataAllowed ? draft.name : undefined,
      slug: metadataAllowed && draft.slug ? draft.slug : undefined,
      parentId:
        metadataAllowed && entry.type === "common"
          ? draft.parentId
          : undefined,
    });
  }

  await deleteDraft(draftId, userId);

  return { ...result, draftId };
}
