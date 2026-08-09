import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EntryEditEditor } from "@/components/wiki/editor/entry-edit-editor";
import { canEditEntryMetadata } from "@/lib/auth/entry-permissions";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getBlogEntryPageData,
  getCommonEntryPageData,
  getEntryEditPageData,
} from "@/lib/db/entries";
import { BLOG_SEGMENT } from "@/lib/wiki/entry-path";

type Props = {
  params: Promise<{ slug: string[] }>;
};

async function loadEntryForEdit(slug: string[]) {
  if (slug.length >= 2 && slug[0] === BLOG_SEGMENT) {
    return getBlogEntryPageData(slug[1]);
  }

  return getCommonEntryPageData(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await loadEntryForEdit(slug);
  return { title: entry ? `编辑：${entry.title}` : "编辑词条" };
}

export default async function EditEntryPage({ params }: Props) {
  const { slug } = await params;
  const editPath = `/entry/edit/${slug.map(encodeURIComponent).join("/")}`;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(editPath)}`);
  }

  const entry = await loadEntryForEdit(slug);
  if (!entry) notFound();

  const editData = await getEntryEditPageData(entry.id);
  if (!editData) notFound();

  const canEditMetadata = canEditEntryMetadata(user, editData.creatorId);

  return (
    <EntryEditEditor
      entryId={editData.id}
      entryType={editData.type}
      initialName={editData.name}
      initialSlug={editData.slug}
      initialContent={editData.content}
      initialParent={editData.parent}
      readHref={entry.path}
      canEditMetadata={canEditMetadata}
    />
  );
}
