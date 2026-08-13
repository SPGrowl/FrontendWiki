"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { EntryToolbar } from "@/components/wiki/entry/EntryToolbar";
import { UserAvatar } from "@/components/wiki/user/user-avatar";
import {
  createEntryComment,
  deleteEntryComment,
} from "@/lib/api/comments";
import { formatRelativeTime } from "@/lib/format-relative-time";
import {
  buildEntryDiscussHref,
  buildEntryEditHref,
  buildEntryHistoryHref,
} from "@/lib/wiki/entry-path";
import { COMMENT_CONTENT_MAX } from "@/lib/wiki/comment-input";
import type { EntryComment, EntryDiscussPageData } from "@/type/entry";
import { cn } from "@/lib/utils";

interface EntryDiscussViewProps {
  data: EntryDiscussPageData;
  currentUserId: string | null;
}

export function EntryDiscussView({
  data,
  currentUserId,
}: EntryDiscussViewProps) {
  const router = useRouter();
  const discussHref = buildEntryDiscussHref(data.readPath);
  const editHref = buildEntryEditHref(data.readPath);
  const historyHref = buildEntryHistoryHref(data.readPath);

  const [comments, setComments] = useState<EntryComment[]>(data.comments);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<"post" | string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setComments(data.comments);
  }, [data.comments]);

  async function handlePost() {
    const content = draft.trim();
    if (!content) {
      setError("请填写评论内容");
      return;
    }
    if (!currentUserId) {
      setError("请先登录后再发表讨论");
      return;
    }

    setPending("post");
    setError(null);
    try {
      const comment = await createEntryComment(data.entryId, content);
      setComments((prev) => [...prev, comment]);
      setDraft("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发表失败");
    } finally {
      setPending(null);
    }
  }

  async function handleDelete(commentId: string) {
    if (!window.confirm("确定删除这条评论吗？")) return;

    setPending(commentId);
    setError(null);
    try {
      await deleteEntryComment(data.entryId, commentId);
      setComments((prev) => prev.filter((item) => item.id !== commentId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setPending(null);
    }
  }

  const loginHref = `/auth/login?next=${encodeURIComponent(discussHref)}`;

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
      <EntryToolbar
        activeTab="discuss"
        readHref={data.readPath}
        editHref={editHref}
        historyHref={historyHref}
        discussHref={discussHref}
        breadcrumbs={data.breadcrumbs}
      />
      <WikiCard
        className="min-h-min min-w-0 shrink-0 rounded-t-none border-t-0"
        padding="lg"
        as="article"
      >
        <h1 className="mb-2 text-2xl font-bold">
          {data.title}
          <span className="text-muted-foreground">：讨论</span>
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          围绕本词条发表看法。评论按发布时间排列；暂不支持回复。
        </p>

        <section className="mb-8">
          <h2 className="mb-2 text-sm font-semibold">发表评论</h2>
          {currentUserId ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={4}
                maxLength={COMMENT_CONTENT_MAX}
                placeholder="写下你的想法…"
                disabled={pending === "post"}
                className={cn(
                  "w-full resize-y rounded-none border border-input bg-background px-3 py-2 text-sm",
                  "outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
                  "disabled:opacity-50"
                )}
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {draft.trim().length}/{COMMENT_CONTENT_MAX}
                </span>
                <Button
                  type="button"
                  size="sm"
                  disabled={pending === "post" || !draft.trim()}
                  onClick={() => {
                    void handlePost();
                  }}
                >
                  {pending === "post" ? "发布中…" : "发布"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href={loginHref} className="text-wiki-link hover:underline">
                登录
              </Link>
              后即可参与讨论。
            </p>
          )}
        </section>

        {error ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <section>
          <h2 className="mb-3 text-sm font-semibold">
            全部评论
            <span className="ml-1 font-normal text-muted-foreground">
              （{comments.length}）
            </span>
          </h2>
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无评论，来做第一条吧。</p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {comments.map((comment) => {
                const isOwn = currentUserId === comment.authorId;
                return (
                  <li
                    key={comment.id}
                    className="group relative flex gap-3 py-4 text-sm"
                  >
                    <Link
                      href={`/user/${comment.authorId}`}
                      className="mt-0.5 shrink-0"
                      aria-label={comment.authorName}
                    >
                      <UserAvatar
                        name={comment.authorName}
                        avatar={comment.authorAvatar}
                        size="md"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <Link
                          href={`/user/${comment.authorId}`}
                          className="font-medium text-wiki-link hover:underline"
                        >
                          {comment.authorName}
                        </Link>
                        <time
                          dateTime={comment.createdAt}
                          className="text-xs text-muted-foreground"
                          title={new Date(comment.createdAt).toLocaleString(
                            "zh-CN"
                          )}
                        >
                          {formatRelativeTime(comment.createdAt)}
                        </time>
                        {isOwn ? (
                          <button
                            type="button"
                            className={cn(
                              "ml-auto text-xs text-destructive",
                              "opacity-0 transition-opacity group-hover:opacity-100",
                              "focus-visible:opacity-100 focus-visible:outline-none",
                              "disabled:opacity-50"
                            )}
                            disabled={pending === comment.id}
                            onClick={() => {
                              void handleDelete(comment.id);
                            }}
                          >
                            {pending === comment.id ? "删除中…" : "删除"}
                          </button>
                        ) : null}
                      </div>
                      <p className="whitespace-pre-wrap break-words text-foreground/90">
                        {comment.content}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </WikiCard>
    </main>
  );
}
