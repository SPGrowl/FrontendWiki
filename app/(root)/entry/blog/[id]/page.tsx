import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WikiEntry } from "@/components/wiki/entry/WikiEntry";
import { getBlogEntryPageData } from "@/lib/db/entries";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = await getBlogEntryPageData(id);
  return { title: entry?.title ?? "词条未找到" };
}

export default async function BlogEntryPage({ params }: Props) {
  const { id } = await params;
  const entry = await getBlogEntryPageData(id);

  if (!entry) notFound();

  return (
    <WikiEntry
      entryId={entry.id}
      path={entry.path}
      content={entry.content}
      title={entry.title}
      breadcrumbs={entry.breadcrumbs}
      relatedEntries={entry.relatedEntries}
    />
  );
}
