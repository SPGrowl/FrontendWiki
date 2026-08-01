import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WikiEntry } from "@/components/wiki/entry/WikiEntry";
import { getAllEntryIds, getEntryById } from "@/lib/wiki/entries";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return getAllEntryIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = await getEntryById(id);
  return { title: entry?.title ?? "词条未找到" };
}

export default async function EntryPage({ params }: Props) {
  const { id } = await params;
  const entry = await getEntryById(id);

  if (!entry) notFound();

  return <WikiEntry content={entry.content} title={entry.title} />;
}
