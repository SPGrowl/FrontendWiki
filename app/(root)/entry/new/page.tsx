import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EntryEditor } from "@/components/wiki/editor/entry-editor";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { findDraftById } from "@/lib/db/drafts";
import { findEntrySearchItem } from "@/lib/db/entries";
import type { EntryType } from "@/type/entry";
import type { EntryCreateType } from "@/type/entry-api";

export const metadata: Metadata = {
  title: "新建词条",
};

type Props = {
  searchParams: Promise<{ draft?: string }>;
};

function resolveEntryType(draft: {
  entryType: EntryType | null;
}): EntryCreateType {
  return draft.entryType === "blog" ? "blog" : "common";
}

export default async function NewEntryPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?next=/entry/new");
  }

  const { draft: draftId } = await searchParams;
  const loadedDraft = draftId ? await findDraftById(draftId, user.id) : null;
  const draft =
    loadedDraft?.draftType === "new" ? loadedDraft : null;

  const initialParent = draft?.parentId
    ? await findEntrySearchItem(draft.parentId)
    : null;

  return (
    <EntryEditor
      draftId={draft?.id}
      initialTitle={draft?.name ?? ""}
      initialContent={draft?.content ?? ""}
      initialMessage={draft?.message ?? ""}
      initialCustomSlug={draft?.slug ?? ""}
      initialEntryType={draft ? resolveEntryType(draft) : "common"}
      initialParent={initialParent}
    />
  );
}
