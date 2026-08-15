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
import { Textarea } from "@/components/ui/textarea";
import { createDraft, updateDraft } from "@/lib/api/drafts";
import { createEntry } from "@/lib/api/entries";
import {
  BLOG_SLUG,
  buildPreviewHref,
  resolveEntrySlug,
  validateSlug,
} from "@/lib/wiki/entry-slug";
import type { EntryCreateType, EntrySearchItem } from "@/type/entry-api";

interface EntryEditorProps {
  draftId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialMessage?: string;
  initialCustomSlug?: string;
  initialEntryType?: EntryCreateType;
  initialParent?: EntrySearchItem | null;
}

export function EntryEditor({
  draftId: initialDraftId,
  initialTitle = "",
  initialContent = "",
  initialMessage = "",
  initialCustomSlug = "",
  initialEntryType = "common",
  initialParent = null,
}: EntryEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [customSlug, setCustomSlug] = useState(initialCustomSlug);
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState(initialMessage);
  const [entryType, setEntryType] = useState<EntryCreateType>(initialEntryType);
  const [parent, setParent] = useState<EntrySearchItem | null>(initialParent);
  const [draftId, setDraftId] = useState<string | undefined>(initialDraftId);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<"save" | "publish" | null>(null);

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const trimmedCustomSlug = customSlug.trim();
  const trimmedMessage = message.trim();

  const nameSlugCheck = useMemo(
    () => (trimmedTitle ? validateSlug(trimmedTitle) : null),
    [trimmedTitle]
  );

  const needsCustomSlug = Boolean(
    trimmedTitle && nameSlugCheck && !nameSlugCheck.valid
  );

  useEffect(() => {
    if (entryType === "blog") {
      setParent(null);
    }
  }, [entryType]);

  useEffect(() => {
    if (!needsCustomSlug && !initialCustomSlug) {
      setCustomSlug("");
    }
  }, [needsCustomSlug, initialCustomSlug]);

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

  const pathPreviewHref = useMemo(
    () =>
      buildPreviewHref(
        entryType === "blog" ? null : (parent?.href ?? null),
        effectiveSlug ?? "…",
        entryType
      ),
    [entryType, parent?.href, effectiveSlug]
  );

  const canSubmit =
    trimmedTitle.length > 0 &&
    trimmedContent.length > 0 &&
    effectiveSlug !== null &&
    (!needsCustomSlug || slugValidation?.valid === true);

  const canSaveDraft = trimmedTitle.length > 0;

  function validatePublish() {
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
    const slugResult = resolveEntrySlug(
      trimmedTitle,
      needsCustomSlug ? trimmedCustomSlug : null
    );
    if (!slugResult.ok) {
      setError(slugResult.error);
      return false;
    }
    clearMessages();
    return true;
  }

  function validateDraft() {
    if (!trimmedTitle) {
      setError("请填写词条标题");
      return false;
    }
    clearMessages();
    return true;
  }

  function clearMessages() {
    setError(null);
    setNotice(null);
  }

  function handleCancel() {
    router.push("/wiki/contribute");
  }

  function buildDraftPayload() {
    return {
      draftType: "new" as const,
      name: trimmedTitle,
      content,
      message: trimmedMessage,
      entryType,
      parentId: entryType === "common" ? parent?.id ?? null : null,
      slug: effectiveSlug,
    };
  }

  async function handleSave() {
    if (!validateDraft()) return;

    setPending("save");
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
      const result = await createEntry({
        name: trimmedTitle,
        content: trimmedContent,
        type: entryType,
        parentId: entryType === "common" ? parent?.id ?? null : null,
        // 未手填时传 null，由服务端用标题生成；标题非法时前端已拦截
        slug: needsCustomSlug ? trimmedCustomSlug : null,
        message: trimmedMessage || undefined,
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
            value={entryType}
            onChange={setEntryType}
            disabled={pending !== null}
          />

          {entryType === "common" ? (
            <ParentEntryPicker value={parent} onChange={setParent} />
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium">发布位置</span>
              <p className="rounded-none border border-border bg-muted/30 px-2.5 py-2 text-xs text-muted-foreground">
                固定前缀{" "}
                <code className="text-foreground">/entry/{BLOG_SLUG}/</code>
                ，别名由标题或 URL 别名决定
              </p>
            </div>
          )}

          <EntryPathPreview href={pathPreviewHref} />
        </div>

        <EntryEditorWorkspace
          content={content}
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
            placeholder="草稿说明；发布时将写入版本历史"
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
            onClick={handleCancel}
            disabled={pending !== null}
          >
            取消
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={!canSaveDraft || pending !== null}
              onClick={handleSave}
            >
              {pending === "save" ? "保存中…" : "存草稿"}
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
