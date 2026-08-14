"use client";

import { useRef, useState } from "react";
import { PencilSimpleIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import {
  deleteMedia,
  listMedia,
  updateMedia,
  uploadMedia,
} from "@/lib/api/media";
import { MEDIA_TITLE_MAX } from "@/lib/media/constants";
import { cn } from "@/lib/utils";
import type { MediaAsset } from "@/type/media";

interface MyAlbumProps {
  initialItems: MediaAsset[];
  initialNextOffset: number | null;
  className?: string;
}

export function MyAlbum({
  initialItems,
  initialNextOffset,
  className,
}: MyAlbumProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(initialItems);
  const [nextOffset, setNextOffset] = useState(initialNextOffset);
  const [message, setMessage] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function clearPendingFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(null);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handlePickFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleUpload() {
    const trimmed = message.trim();
    if (!pendingFile) {
      setError("请先选择图片");
      return;
    }
    if (!trimmed) {
      setError("上传时必须填写说明（message）");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const { asset } = await uploadMedia({
        file: pendingFile,
        purpose: "entry",
        title: trimmed,
      });
      setItems((prev) => [asset, ...prev]);
      setMessage("");
      clearPendingFile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  async function handleLoadMore() {
    if (nextOffset == null || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const { items: more, nextOffset: next } = await listMedia({
        purpose: "entry",
        uploaderId: "me",
        offset: nextOffset,
        limit: 12,
      });
      setItems((prev) => [...prev, ...more]);
      setNextOffset(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoadingMore(false);
    }
  }

  function startEdit(asset: MediaAsset) {
    setEditingId(asset.id);
    setEditDraft(asset.title);
    setError(null);
  }

  async function saveEdit(id: string) {
    const trimmed = editDraft.trim();
    if (!trimmed) {
      setError("说明不能为空");
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      const { asset } = await updateMedia(id, { title: trimmed });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? asset : item))
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("确定删除这张图片吗？已嵌入文章中的链接将失效。")) {
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      await deleteMedia(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <WikiCard padding="lg" className={cn("min-w-0", className)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">我的相册</h2>
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <UploadSimpleIcon className="size-3.5" aria-hidden />
          选择图片
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        disabled={uploading}
        onChange={(event) => {
          handlePickFile(event.target.files?.[0]);
        }}
      />

      {pendingFile ? (
            <div className="mb-4 space-y-2 border border-border bg-muted/20 p-3">
              <div className="flex gap-3">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt=""
                    className="size-16 shrink-0 object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="truncate text-xs text-muted-foreground">
                    {pendingFile.name}
                  </p>
                  <Input
                    value={message}
                    maxLength={MEDIA_TITLE_MAX}
                    placeholder="必填：图片说明（message），便于检索"
                    disabled={uploading}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={uploading}
                  onClick={() => {
                    clearPendingFile();
                    setMessage("");
                  }}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  size="xs"
                  disabled={uploading || !message.trim()}
                  onClick={() => {
                    void handleUpload();
                  }}
                >
                  {uploading ? "上传中…" : "上传"}
                </Button>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="mb-3 text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              还没有图片。选择图片并填写说明后上传。
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
              {items.map((asset) => {
                const busy = busyId === asset.id;
                const editing = editingId === asset.id;
                return (
                  <li key={asset.id} className="min-w-0">
                    <div
                      className={cn(
                        "group relative aspect-square overflow-hidden border border-border bg-muted/30",
                        busy && "opacity-60"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="size-full object-cover"
                      />
                      <div
                        className={cn(
                          "absolute inset-0 flex flex-col justify-between bg-black/55 p-1.5 text-white",
                          "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                          editing && "opacity-100"
                        )}
                      >
                        {editing ? (
                          <div className="flex flex-1 flex-col gap-1">
                            <Input
                              value={editDraft}
                              maxLength={MEDIA_TITLE_MAX}
                              disabled={busy}
                              className="h-7 border-white/30 bg-black/40 text-white placeholder:text-white/60"
                              onChange={(event) =>
                                setEditDraft(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void saveEdit(asset.id);
                                }
                                if (event.key === "Escape") {
                                  setEditingId(null);
                                }
                              }}
                            />
                            <div className="mt-auto flex gap-1">
                              <Button
                                type="button"
                                size="xs"
                                variant="secondary"
                                disabled={busy || !editDraft.trim()}
                                className="flex-1"
                                onClick={() => {
                                  void saveEdit(asset.id);
                                }}
                              >
                                保存
                              </Button>
                              <Button
                                type="button"
                                size="xs"
                                variant="ghost"
                                disabled={busy}
                                className="text-white hover:bg-white/20 hover:text-white"
                                onClick={() => setEditingId(null)}
                              >
                                取消
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="line-clamp-3 text-[11px] leading-snug">
                              {asset.title || "（无说明）"}
                            </p>
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                aria-label="修改说明"
                                title="修改说明"
                                disabled={busy}
                                className={cn(
                                  "inline-flex size-7 items-center justify-center rounded-none bg-black/40",
                                  "hover:bg-black/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
                                  "disabled:opacity-50"
                                )}
                                onClick={() => startEdit(asset)}
                              >
                                <PencilSimpleIcon
                                  className="size-3.5"
                                  weight="bold"
                                  aria-hidden
                                />
                              </button>
                              <button
                                type="button"
                                aria-label="删除图片"
                                title="删除图片"
                                disabled={busy}
                                className={cn(
                                  "inline-flex size-7 items-center justify-center rounded-none bg-black/40 text-red-200",
                                  "hover:bg-black/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
                                  "disabled:opacity-50"
                                )}
                                onClick={() => {
                                  void handleDelete(asset.id);
                                }}
                              >
                                <TrashIcon
                                  className="size-3.5"
                                  weight="bold"
                                  aria-hidden
                                />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {nextOffset != null ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3 w-full"
              disabled={loadingMore}
              onClick={() => {
                void handleLoadMore();
              }}
            >
              {loadingMore ? "加载中…" : "加载更多"}
            </Button>
          ) : null}
    </WikiCard>
  );
}
