import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EntryEditEditor } from "@/components/wiki/editor/entry-edit-editor";
import { canEditEntryMetadata } from "@/lib/auth/entry-permissions";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { findDraftById } from "@/lib/db/drafts";
import {
  findEntrySearchItem,
  getEntryEditPageData,
  getEntryPageDataBySegments,
} from "@/lib/db/entries";

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ draft?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryPageDataBySegments(slug);
  return { title: entry ? `编辑：${entry.title}` : "编辑词条" };
}

export default async function EditEntryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { draft: draftId } = await searchParams;
  const editPath = `/entry/edit/${slug.map(encodeURIComponent).join("/")}`;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(editPath)}`);
  }

  const entry = await getEntryPageDataBySegments(slug);
  if (!entry) notFound();

  const editData = await getEntryEditPageData(entry.id);
  if (!editData) notFound();

  const canEditMetadata = canEditEntryMetadata(user, editData.creatorId);

  let loadedDraft = draftId
    ? await findDraftById(draftId, user.id)
    : null;

  if (
    loadedDraft &&
    (loadedDraft.draftType !== "edit" ||
      loadedDraft.entryId !== editData.id)
  ) {
    loadedDraft = null;
  }

  let initialParent = editData.parent;
  if (loadedDraft?.parentId && canEditMetadata && editData.type === "common") {
    initialParent =
      (await findEntrySearchItem(loadedDraft.parentId)) ?? editData.parent;
  }

  return (
    <EntryEditEditor
      entryId={editData.id}
      entryType={editData.type}
      publishedContent={editData.content}
      initialName={loadedDraft?.name ?? editData.name}
      initialSlug={loadedDraft?.slug ?? editData.slug}
      initialContent={loadedDraft?.content ?? editData.content}
      initialMessage={loadedDraft?.message ?? ""}
      initialParent={initialParent}
      readHref={entry.path}
      canEditMetadata={canEditMetadata}
      draftId={loadedDraft?.id}
    />
  );
}
