import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WikiEntry } from "@/components/wiki/entry/WikiEntry";
import { getEntryPageDataBySegments } from "@/lib/db/entries";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryPageDataBySegments(slug);
  return { title: entry?.title ?? "词条未找到" };
}

export default async function CommonEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getEntryPageDataBySegments(slug);

  if (!entry) notFound();

  return (
    <WikiEntry
      entryId={entry.id}
      path={entry.path}
      content={entry.content}
      title={entry.title}
      breadcrumbs={entry.breadcrumbs}
      relatedEntries={entry.relatedEntries}
      contributors={entry.contributors}
    />
  );
}
