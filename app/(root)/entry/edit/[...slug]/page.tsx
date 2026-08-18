import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EntryEditor } from "@/components/wiki/editor/entry-edit-editor";
import { canEditEntryMetadata } from "@/lib/auth/entry-permissions";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getEntryEditBundleByHref } from "@/lib/db/entry-edit";
import { buildEntryEditHref } from "@/lib/wiki/entry-path";
import { hrefFromEntryParams } from "@/lib/wiki/entry-slug";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const href = hrefFromEntryParams(slug);
  // 不传 userId：只取 metadata.name，不查草稿
  const bundle = href ? await getEntryEditBundleByHref(href) : null;
  return {
    title: bundle ? `编辑：${bundle.metadata.name}` : "编辑词条",
  };
}

/**
 * 编辑页装载（三块）：
 * 1. metadata — name / slug / type / parent / href（name = 唯一展示名）
 * 2. currentVersion — 发布指针指向的正文版本
 * 3. draft — 当前用户最新 edit 草稿的 content+message；无则编辑区复制 currentVersion.content
 * + canEditMetadata — 创建者或 admin 才能改元数据行
 */
export default async function EditEntryPage({ params }: Props) {
  const { slug } = await params;

  const href = hrefFromEntryParams(slug);
  if (!href) notFound();

  const editPath = buildEntryEditHref(href);

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(editPath)}`);
  }

  const bundle = await getEntryEditBundleByHref(href, user.id);
  if (!bundle) notFound();

  const { metadata, currentVersion, draft } = bundle;
  const canEditMetadata = canEditEntryMetadata(user, metadata.creatorId);

  // 无草稿：diff 右栏 / 初始正文 = 已发布正文的一份拷贝
  const initialContent = draft?.content ?? currentVersion.content;
  const initialMessage = draft?.message ?? "";

  return (
    <EntryEditor
      entryId={metadata.id}
      entryType={metadata.type}
      publishedContent={currentVersion.content}
      initialName={metadata.name}
      initialSlug={metadata.slug}
      initialContent={initialContent}
      initialMessage={initialMessage}
      initialParent={metadata.parent}
      readHref={metadata.href}
      canEditMetadata={canEditMetadata}
      draftId={draft?.id}
    />
  );
}
