"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EntryEditorWorkspace } from "@/components/wiki/editor/entry-editor-workspace";
import { ParentEntryPicker } from "@/components/wiki/editor/parent-entry-picker";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateEntry } from "@/lib/api/entries";
import type { EntryType } from "@/type/entry";
import type { EntrySearchItem } from "@/type/entry-api";

interface EntryEditEditorProps {
  entryId: string;
  entryType: EntryType;
  initialName: string;
  initialSlug: string;
  initialContent: string;
  initialParent: EntrySearchItem | null;
  readHref: string;
  canEditMetadata: boolean;
}

export function EntryEditEditor({
  entryId,
  entryType,
  initialName,
  initialSlug,
  initialContent,
  initialParent,
  readHref,
  canEditMetadata,
}: EntryEditEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [content, setContent] = useState(initialContent);
  const [parent, setParent] = useState<EntrySearchItem | null>(initialParent);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const trimmedName = name.trim();
  const trimmedContent = content.trim();
  const trimmedSlug = slug.trim();

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

  const hasContentChanges = trimmedContent !== initialContent.trim();

  const canSubmit =
    trimmedContent.length > 0 &&
    (!canEditMetadata || trimmedName.length > 0) &&
    (hasContentChanges || hasMetadataChanges);

  function validate() {
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
    setError(null);
    return true;
  }

  async function handlePublish() {
    if (!validate()) return;

    setPending(true);
    setError(null);

    try {
      const result = await updateEntry(entryId, {
        content: trimmedContent,
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
      setPending(false);
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
              disabled={pending || !canEditMetadata}
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
                  disabled={pending}
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
                disabled={pending}
              />
            </div>
          ) : null}
        </div>

        <EntryEditorWorkspace
          content={content}
          onChange={setContent}
          disabled={pending}
        />

        {error ? (
          <p className="shrink-0 text-xs text-destructive">{error}</p>
        ) : null}

        <div className="flex shrink-0 items-center justify-between border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => router.push(readHref)}
          >
            取消
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || pending}
            onClick={handlePublish}
          >
            {pending ? "保存中…" : hasContentChanges ? "发布" : "保存设置"}
          </Button>
        </div>
      </WikiCard>
    </div>
  );
}
