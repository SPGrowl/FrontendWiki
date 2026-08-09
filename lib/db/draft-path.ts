import { query } from "@/lib/db";
import {
  buildBreadcrumbs,
  buildEntryEditHref,
  buildEntryHref,
  type EntryPathSegment,
} from "@/lib/wiki/entry-path";

interface ChainRow {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  type: EntryPathSegment["type"];
  depth: number;
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

export async function fetchEntryChainForDraft(
  entryId: string
): Promise<EntryPathSegment[]> {
  const { rows } = await query<ChainRow>(
    `WITH RECURSIVE chain AS (
       SELECT id, parent_id, slug, name, type, 0 AS depth
       FROM entries
       WHERE id = $1
       UNION ALL
       SELECT e.id, e.parent_id, e.slug, e.name, e.type, c.depth + 1
       FROM entries e
       INNER JOIN chain c ON e.id = c.parent_id
     )
     SELECT id, parent_id, slug, name, type, depth
     FROM chain`,
    [entryId]
  );

  return mapChain(rows);
}