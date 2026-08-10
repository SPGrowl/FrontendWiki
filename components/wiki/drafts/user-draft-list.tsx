"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { deleteDraft, publishDraft } from "@/lib/api/drafts";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { DraftListItem } from "@/type/draft";

interface UserDraftListProps {
  drafts: DraftListItem[];
}

export function UserDraftList({ drafts: initialDrafts }: UserDraftListProps) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(initialDrafts);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(draftId: string) {
    if (!window.confirm("确定删除这条草稿吗？")) return;

    setPendingId(draftId);
    setError(null);

    try {
      await deleteDraft(draftId);
      setDrafts((items) => items.filter((item) => item.id !== draftId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setPendingId(null);
    }
  }

  async function handlePublish(draftId: string) {
    setPendingId(draftId);
    setError(null);

    try {
      const result = await publishDraft(draftId);
      setDrafts((items) => items.filter((item) => item.id !== draftId));
      router.push(result.href);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败");
      setPendingId(null);
    }
  }

  if (drafts.length === 0) {
    return (
      <WikiCard padding="lg">
        <h2 className="text-sm font-semibold">我的草稿</h2>
        <p className="mt-2 text-sm text-muted-foreground">暂无草稿</p>
      </WikiCard>
    );
  }

  return (
    <WikiCard padding="lg" className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">我的草稿</h2>

      <ul className="flex flex-col divide-y divide-border">
        {drafts.map((draft) => {
          const isPending = pendingId === draft.id;

          return (
            <li
              key={draft.id}
              className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 md:flex-row md:items-start md:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{draft.entryLabel}</p>
                {draft.message ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {draft.message}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">无说明</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  更新于 {formatRelativeTime(draft.updatedAt)}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  render={<Link href={draft.editHref} />}
                  nativeButton={false}
                >
                  编辑
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handlePublish(draft.id)}
                >
                  {isPending ? "处理中…" : "发布"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDelete(draft.id)}
                >
                  删除
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </WikiCard>
  );
}
