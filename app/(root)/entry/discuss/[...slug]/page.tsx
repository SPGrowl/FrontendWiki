import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryDiscussView } from "@/components/wiki/entry/EntryDiscussView";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getEntryDiscussPageDataBySegments } from "@/lib/db/comments";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getEntryDiscussPageDataBySegments(slug);
  return {
    title: data ? `${data.title}：讨论` : "讨论",
  };
}

export default async function EntryDiscussPage({ params }: Props) {
  const { slug } = await params;
  const data = await getEntryDiscussPageDataBySegments(slug);
  if (!data) notFound();

  const user = await getCurrentUser();

  return (
    <EntryDiscussView data={data} currentUserId={user?.id ?? null} />
  );
}
