import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EntryEditor } from "@/components/wiki/editor/entry-editor";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export const metadata: Metadata = {
  title: "新建词条",
};

export default async function NewEntryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?next=/entry/new");
  }

  return <EntryEditor />;
}
