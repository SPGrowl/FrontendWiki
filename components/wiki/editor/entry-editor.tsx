"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EntryEditorWorkspace } from "@/components/wiki/editor/entry-editor-workspace";
import { EntryPathPreview } from "@/components/wiki/editor/entry-path-preview";
import { EntryPublishTargetPicker } from "@/components/wiki/editor/entry-publish-target-picker";
import { ParentEntryPicker } from "@/components/wiki/editor/parent-entry-picker";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEntry } from "@/lib/api/entries";
import { buildCreatePreview } from "@/lib/wiki/entry-path";
import {
  canUseNameAsSlug,
  resolveEntrySlug,
  validateSlug,
} from "@/lib/wiki/entry-slug";
import type { EntryPublishTarget, EntrySearchItem } from "@/type/entry-api";

export function EntryEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [content, setContent] = useState("");
  const [publishTarget, setPublishTarget] =
    useState<EntryPublishTarget>("root");
  const [parent, setParent] = useState<EntrySearchItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<"save" | "publish" | null>(null);

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const trimmedCustomSlug = customSlug.trim();

  const nameSlugCheck = useMemo(
    () => (trimmedTitle ? canUseNameAsSlug(trimmedTitle) : null),
    [trimmedTitle]
  );

  const needsCustomSlug = Boolean(
    trimmedTitle && nameSlugCheck && !nameSlugCheck.valid
  );

  useEffect(() => {
    if (publishTarget !== "child") {
      setParent(null);
    }
  }, [publishTarget]);

  useEffect(() => {
    if (!needsCustomSlug) {
      setCustomSlug("");
    }
  }, [needsCustomSlug]);

  const effectiveSlug = useMemo(() => {
    if (!trimmedTitle) return null;
    const result = resolveEntrySlug(
      trimmedTitle,
      needsCustomSlug ? trimmedCustomSlug : null
    );
    return result.ok ? result.slug : null;
  }, [trimmedTitle, trimmedCustomSlug, needsCustomSlug]);

  const slugValidation = useMemo(() => {
    if (!needsCustomSlug) return null;
    if (!trimmedCustomSlug) {
      return { valid: false as const, reason: "请填写 URL 别名" };
    }
    return validateSlug(trimmedCustomSlug);
  }, [needsCustomSlug, trimmedCustomSlug]);

  const pathPreview = useMemo(
    () =>
      buildCreatePreview(
        publishTarget,
        parent,
        trimmedTitle || "未命名词条",
        effectiveSlug ?? undefined
      ),
    [publishTarget, parent, trimmedTitle, effectiveSlug]
  );

  const canSubmit =
    trimmedTitle.length > 0 &&
    trimmedContent.length > 0 &&
    effectiveSlug !== null &&
    (!needsCustomSlug || slugValidation?.valid === true) &&
    (publishTarget !== "child" || parent !== null);

  function validate() {
    if (!trimmedTitle) {
      setError("请填写词条标题");
      return false;
    }
    if (!trimmedContent) {
      setError("正文不能为空");
      return false;
    }
    if (needsCustomSlug && !trimmedCustomSlug) {
      setError("标题含不能用于 URL 的字符，请填写 URL 别名");
      return false;
    }
    if (needsCustomSlug && slugValidation && !slugValidation.valid) {
      setError(slugValidation.reason ?? "URL 别名无效");
      return false;
    }
    if (publishTarget === "child" && !parent) {
      setError("请选择父词条");
      return false;
    }
    const slugResult = resolveEntrySlug(
      trimmedTitle,
      needsCustomSlug ? trimmedCustomSlug : null
    );
    if (!slugResult.ok) {
      setError(slugResult.error);
      return false;
    }
    setError(null);
    return true;
  }

  function clearMessages() {
    setError(null);
    setNotice(null);
  }

  function handleCancel() {
    router.push("/wiki/contribute");
  }

  function handleSave() {
    if (!validate()) return;
    clearMessages();
    setNotice("草稿保存尚未开放");
  }

  async function handlePublish() {
    if (!validate()) return;

    setPending("publish");
    clearMessages();

    try {
      const result = await createEntry({
        name: trimmedTitle,
        content: trimmedContent,
        type: publishTarget === "blog" ? "blog" : "common",
        parentId: publishTarget === "child" ? parent?.id ?? null : null,
        slug: needsCustomSlug ? trimmedCustomSlug : undefined,
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
        填写标题与 Markdown 正文后即可发布；含特殊字符的标题需单独设置 URL
        别名。查看
        <Link href="/wiki/guidelines" className="wiki-link mx-1">
          编辑规范
        </Link>
        。
      </p>

      <WikiCard padding="lg" className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="entry-title" className="text-xs font-medium">
              标题
            </label>
            <Input
              id="entry-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="词条标题"
              required
              disabled={pending !== null}
              aria-invalid={
                trimmedTitle.length > 0 && needsCustomSlug ? true : undefined
              }
            />
            {trimmedTitle && nameSlugCheck?.valid ? (
              <p className="text-xs text-muted-foreground">
                标题可直接用于 URL 路径
              </p>
            ) : null}
            {needsCustomSlug && nameSlugCheck?.reason ? (
              <p className="text-xs text-destructive">{nameSlugCheck.reason}</p>
            ) : null}
          </div>

          {needsCustomSlug ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="entry-slug" className="text-xs font-medium">
                URL 别名
              </label>
              <Input
                id="entry-slug"
                value={customSlug}
                onChange={(event) => setCustomSlug(event.target.value)}
                placeholder="例如 es6-plus"
                required
                disabled={pending !== null}
                aria-invalid={
                  slugValidation?.valid === false ? true : undefined
                }
              />
              {slugValidation && !slugValidation.valid ? (
                <p className="text-xs text-destructive">
                  {slugValidation.reason}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  用于 URL 路径的单段标识，不可含 / 等特殊字符
                </p>
              )}
            </div>
          ) : null}

          <EntryPublishTargetPicker
            value={publishTarget}
            onChange={setPublishTarget}
            disabled={pending !== null}
          />

          {publishTarget === "child" ? (
            <ParentEntryPicker value={parent} onChange={setParent} />
          ) : null}

          <EntryPathPreview
            breadcrumbs={pathPreview.breadcrumbs}
            href={pathPreview.href}
          />
        </div>

        <EntryEditorWorkspace
          content={content}
          onChange={setContent}
          disabled={pending !== null}
        />

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
            onClick={handleCancel}
            disabled={pending !== null}
          >
            取消
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!canSubmit || pending !== null}
              onClick={handleSave}
            >
              保存
            </Button>
            <Button
              type="button"
              disabled={!canSubmit || pending !== null}
              onClick={handlePublish}
            >
              {pending === "publish" ? "发布中…" : "发布"}
            </Button>
          </div>
        </div>
      </WikiCard>
    </div>
  );
}
