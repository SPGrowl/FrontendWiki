"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EntryEditorWorkspace } from "@/components/wiki/editor/entry-editor-workspace";
import { ParentEntryPicker } from "@/components/wiki/editor/parent-entry-picker";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDraft, updateDraft } from "@/lib/api/drafts";
import { updateEntry } from "@/lib/api/entries";
import type { EntryType } from "@/type/entry";
import type { EntrySearchItem } from "@/type/entry-api";

interface EntryEditEditorProps {
  entryId: string;
  entryType: EntryType;
  /** 已发布正文：Merge 左栏 baseline */
  publishedContent: string;
  /** 元数据名称 entries.name（仅 canEditMetadata 时可改） */
  initialName: string;
  initialSlug: string;
  /** 草稿正文，或无草稿时对 publishedContent 的拷贝 */
  initialContent: string;
  /** 草稿 message；无草稿则为空 */
  initialMessage?: string;
  initialParent: EntrySearchItem | null;
  readHref: string;
  /** 创建者或 admin：开启元数据编辑行 */
  canEditMetadata: boolean;
  draftId?: string;
}

export function EntryEditEditor({
  entryId,
  entryType,
  publishedContent,
  initialName,
  initialSlug,
  initialContent,
  initialMessage = "",
  initialParent,
  readHref,
  canEditMetadata,
  draftId: initialDraftId,
}: EntryEditEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState(initialMessage);
  const [parent, setParent] = useState<EntrySearchItem | null>(initialParent);
  const [draftId, setDraftId] = useState<string | undefined>(initialDraftId);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<"draft" | "publish" | null>(null);

  const trimmedName = name.trim();
  const trimmedContent = content.trim();
  const trimmedSlug = slug.trim();
  const trimmedMessage = message.trim();
  const publishedBaseline = publishedContent.trim();

  const hasMetadataChanges = useMemo(() => {
    if (!canEditMetadata) return false;
    const parentId = parent?.id ?? null;
    const initialParentId = initialParent?.id ?? null;
    return (
      trimmedName !== initialName.trim() ||
      trimmedSlug !== initialSlug.trim() ||
      parentId !== initialParentId
    );
  }, [
    canEditMetadata,
    trimmedName,
    trimmedSlug,
    parent,
    initialName,
    initialSlug,
    initialParent,
  ]);

  const hasContentChanges = trimmedContent !== publishedBaseline;

  const canSubmit =
    trimmedContent.length > 0 &&
    (!canEditMetadata || trimmedName.length > 0) &&
    (hasContentChanges || hasMetadataChanges);

  const canSaveDraft =
    trimmedName.length > 0 && (!canEditMetadata || trimmedSlug.length > 0);

  function clearMessages() {
    setError(null);
    setNotice(null);
  }

  function validatePublish() {
    if (canEditMetadata && !trimmedName) {
      setError("请填写词条名称");
      return false;
    }
    if (!trimmedContent) {
      setError("正文不能为空");
      return false;
    }
    if (canEditMetadata && !trimmedSlug) {
      setError("请填写 URL 别名");
      return false;
    }
    if (!hasContentChanges && !hasMetadataChanges) {
      setError("没有可保存的变更");
      return false;
    }
    if (hasContentChanges && !trimmedMessage) {
      setError("发布正文变更时请填写版本说明");
      return false;
    }
    clearMessages();
    return true;
  }

  function validateDraft() {
    if (!trimmedName) {
      setError("请填写词条名称");
      return false;
    }
    if (canEditMetadata && !trimmedSlug) {
      setError("请填写 URL 别名");
      return false;
    }
    clearMessages();
    return true;
  }

  function buildDraftPayload() {
    return {
      draftType: "edit" as const,
      entryId,
      name: trimmedName,
      content,
      message: trimmedMessage,
      ...(canEditMetadata
        ? {
            slug: trimmedSlug,
            parentId: entryType === "common" ? parent?.id ?? null : null,
          }
        : {}),
    };
  }

  async function handleSaveDraft() {
    if (!validateDraft()) return;

    setPending("draft");
    clearMessages();

    try {
      if (draftId) {
        await updateDraft(draftId, buildDraftPayload());
      } else {
        const result = await createDraft(buildDraftPayload());
        setDraftId(result.draft.id);
      }

      setNotice("草稿已保存");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存草稿失败");
    } finally {
      setPending(null);
    }
  }

  async function handlePublish() {
    if (!validatePublish()) return;

    setPending("publish");
    clearMessages();

    try {
      const result = await updateEntry(entryId, {
        content: trimmedContent,
        ...(hasContentChanges ? { message: trimmedMessage } : {}),
        ...(canEditMetadata
          ? {
              name: trimmedName,
              slug: trimmedSlug,
              parentId: entryType === "common" ? parent?.id ?? null : undefined,
            }
          : {}),
      });
      router.push(result.href);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败");
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="shrink-0 text-xs text-muted-foreground">
        {canEditMetadata
          ? "正文变更将追加版本；名称、URL 别名与上级词条的调整不进入版本历史。"
          : "你仅可编辑正文，保存后将追加为新版本。"}
        查看
        <Link href="/wiki/guidelines" className="wiki-link mx-1">
          编辑规范
        </Link>
        。
      </p>

      <WikiCard padding="lg" className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="entry-name" className="text-xs font-medium">
              词条名称
            </label>
            <Input
              id="entry-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="词条名称"
              required
              disabled={pending !== null || !canEditMetadata}
              readOnly={!canEditMetadata}
            />
            {!canEditMetadata ? (
              <p className="text-xs text-muted-foreground">
                仅管理员或创建者可修改名称
              </p>
            ) : null}
          </div>

          {canEditMetadata && entryType === "common" ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="entry-slug" className="text-xs font-medium">
                  URL 别名
                </label>
                <Input
                  id="entry-slug"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="例如 es6-plus"
                  required
                  disabled={pending !== null}
                />
                <p className="text-xs text-muted-foreground">
                  用于 URL 路径的单段标识，修改后不产生新版本
                </p>
              </div>

              <ParentEntryPicker
                value={parent}
                onChange={setParent}
                excludeEntryId={entryId}
              />
            </>
          ) : null}

          {canEditMetadata && entryType === "blog" ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="entry-slug" className="text-xs font-medium">
                URL 别名
              </label>
              <Input
                id="entry-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                disabled={pending !== null}
              />
              <p className="text-xs text-muted-foreground">
                路径固定为{" "}
                <code className="text-foreground">
                  /entry/blog/{slug || "…"}
                </code>
                ；类型创建后不可更改
              </p>
            </div>
          ) : null}
        </div>

        <EntryEditorWorkspace
          content={content}
          baselineContent={publishedContent}
          onChange={setContent}
          disabled={pending !== null}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="entry-message" className="text-xs font-medium">
            说明
          </label>
          <Textarea
            id="entry-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={
              hasContentChanges
                ? "草稿说明；发布正文变更时将作为版本说明"
                : "草稿说明"
            }
            rows={2}
            disabled={pending !== null}
          />
        </div>

        {error ? (
          <p className="shrink-0 text-xs text-destructive">{error}</p>
        ) : null}
        {notice ? (
          <p className="shrink-0 text-xs text-muted-foreground">{notice}</p>
        ) : null}

        <div className="flex shrink-0 items-center justify-between border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            disabled={pending !== null}
            onClick={() => router.push(readHref)}
          >
            取消
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!canSaveDraft || pending !== null}
              onClick={handleSaveDraft}
            >
              {pending === "draft" ? "保存中…" : "存草稿"}
            </Button>
            <Button
              type="button"
              disabled={!canSubmit || pending !== null}
              onClick={handlePublish}
            >
              {pending === "publish"
                ? "保存中…"
                : hasContentChanges
                  ? "发布"
                  : "保存设置"}
            </Button>
          </div>
        </div>
      </WikiCard>
    </div>
  );
}
