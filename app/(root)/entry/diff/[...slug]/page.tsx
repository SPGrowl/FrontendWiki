import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryDiffView } from "@/components/wiki/entry/EntryDiffView";
import { getEntryDiffPageDataBySegments } from "@/lib/db/entries";

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ from?: string; to?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const historyHint = slug[slug.length - 1] ?? "词条";
  return { title: `版本对比：${decodeURIComponent(historyHint)}` };
}

export default async function EntryDiffPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from, to } = await searchParams;

  if (!from || !to) notFound();

  const data = await getEntryDiffPageDataBySegments(slug, from, to);
  if (!data) notFound();

  // 保证左侧较旧、右侧较新
  const ordered =
    data.from.versionNo <= data.to.versionNo
      ? data
      : {
          ...data,
          from: data.to,
          to: data.from,
        };

  return <EntryDiffView data={ordered} />;
}
