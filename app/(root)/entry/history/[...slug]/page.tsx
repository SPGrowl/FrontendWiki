import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryHistoryView } from "@/components/wiki/entry/EntryHistoryView";
import { getEntryHistoryPageDataBySegments } from "@/lib/db/entries";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getEntryHistoryPageDataBySegments(slug);
  return {
    title: data ? `${data.title}：修订历史` : "修订历史",
  };
}

export default async function EntryHistoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getEntryHistoryPageDataBySegments(slug);
  if (!data) notFound();

  return <EntryHistoryView data={data} />;
}
