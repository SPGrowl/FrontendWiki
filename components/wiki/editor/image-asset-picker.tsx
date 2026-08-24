"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MagnifyingGlassPlusIcon,
  UploadSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  listMedia,
  uploadMedia,
} from "@/lib/api/media";
import { MEDIA_TITLE_MAX } from "@/lib/media/constants";
import {
  MARKDOWN_IMAGE_DEFAULT_SCALE,
  withMarkdownImageScale,
} from "@/lib/wiki/markdown-image";
import { cn } from "@/lib/utils";
import type { MediaAsset } from "@/type/media";

function escapeMarkdownAlt(text: string): string {
  return text.replace(/[[\]]/g, "").replace(/\r?\n/g, " ").trim();
}

export function buildImageMarkdown(
  asset: MediaAsset,
  scalePercent: number = MARKDOWN_IMAGE_DEFAULT_SCALE
): string {
  const alt = escapeMarkdownAlt(asset.title) || "image";
  const src = withMarkdownImageScale(asset.url, scalePercent);
  return `![${alt}](${src})`;
}

interface ImageAssetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (markdown: string) => void;
  disabled?: boolean;
}

export function ImageAssetPicker({
  open,
  onOpenChange,
  onInsert,
  disabled = false,
}: ImageAssetPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<number | null>(null);

  const [items, setItems] = useState<MediaAsset[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  const loadPage = useCallback(
    async (offset: number, q: string, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const { items: page, nextOffset: next } = await listMedia({
          purpose: "entry",
          q: q || undefined,
          offset,
          limit: 24,
        });
        setItems((prev) => (append ? [...prev, ...page] : page));
        setNextOffset(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载图库失败");
        if (!append) {
          setItems([]);
          setNextOffset(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    void loadPage(0, committedQuery, false);
  }, [open, committedQuery, loadPage]);

  useEffect(() => {
    if (!open) return;
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setCommittedQuery(query.trim());
    }, 300);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [query, open]);

  useEffect(() => {
    if (open) return;
    setQuery("");
    setCommittedQuery("");
    setUploadMessage("");
    setPreviewAsset(null);
    setError(null);
    setPendingFile(null);
    setPreviewUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  }, [open]);

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
    const trimmed = uploadMessage.trim();
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
      const asset = await uploadMedia({
        file: pendingFile,
        purpose: "entry",
        title: trimmed,
      });
      setItems((prev) => [asset, ...prev]);
      setUploadMessage("");
      clearPendingFile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }

  function handleInsert(asset: MediaAsset) {
    onInsert(buildImageMarkdown(asset));
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[min(90vh,40rem)] w-full flex-col gap-3 sm:max-w-3xl"
          showCloseButton
        >
          <DialogHeader className="pr-8">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle>插入图片</DialogTitle>
              <Button
                type="button"
                size="xs"
                variant="outline"
                disabled={disabled || uploading}
                className="shrink-0"
                onClick={() => fileRef.current?.click()}
              >
                <UploadSimpleIcon className="size-3.5" aria-hidden />
                上传图片
              </Button>
            </div>
            <DialogDescription>
              按上传时间浏览；可用说明搜索。悬停缩略图可插入（默认
              #scale=75）或放大。插入后可在正文改比例并用预览查看。
            </DialogDescription>
          </DialogHeader>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={disabled || uploading}
            onChange={(event) => {
              handlePickFile(event.target.files?.[0]);
            }}
          />

          <Input
            value={query}
            placeholder="按说明（message）搜索…"
            disabled={disabled}
            onChange={(event) => setQuery(event.target.value)}
          />

          {pendingFile ? (
            <div className="space-y-2 border border-border bg-muted/20 p-3">
              <div className="flex gap-3">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt=""
                    className="size-14 shrink-0 object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="truncate text-xs text-muted-foreground">
                    {pendingFile.name}
                  </p>
                  <Input
                    value={uploadMessage}
                    maxLength={MEDIA_TITLE_MAX}
                    placeholder="必填：图片说明（message）"
                    disabled={uploading}
                    onChange={(event) => setUploadMessage(event.target.value)}
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
                    setUploadMessage("");
                  }}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  size="xs"
                  disabled={uploading || !uploadMessage.trim()}
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
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                加载中…
              </p>
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                {committedQuery
                  ? "没有匹配说明的图片"
                  : "图库为空，可先上传一张"}
              </p>
            ) : (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {items.map((asset) => (
                  <li key={asset.id} className="min-w-0">
                    <div className="group relative aspect-square overflow-hidden border border-border bg-muted/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="size-full object-cover"
                      />
                      <div
                        className={cn(
                          "absolute inset-0 flex flex-col justify-between bg-black/55 p-1.5 text-white",
                          "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                        )}
                      >
                        <p className="line-clamp-2 text-[10px] leading-snug">
                          {asset.title || "（无说明）"}
                        </p>
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="插入到编辑器"
                            disabled={disabled}
                            className={cn(
                              "inline-flex h-7 items-center px-1.5 text-[10px] font-medium bg-black/40",
                              "hover:bg-black/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
                              "disabled:opacity-50"
                            )}
                            onClick={() => handleInsert(asset)}
                          >
                            插入
                          </button>
                          <button
                            type="button"
                            title="放大预览"
                            className={cn(
                              "inline-flex size-7 items-center justify-center bg-black/40",
                              "hover:bg-black/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                            )}
                            onClick={() => setPreviewAsset(asset)}
                          >
                            <MagnifyingGlassPlusIcon
                              className="size-3.5"
                              weight="bold"
                              aria-hidden
                            />
                            <span className="sr-only">放大</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {nextOffset != null && !loading ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3 w-full"
                disabled={loadingMore}
                onClick={() => {
                  void loadPage(nextOffset, committedQuery, true);
                }}
              >
                {loadingMore ? "加载中…" : "加载更多"}
              </Button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {previewAsset ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="图片预览"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewAsset(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setPreviewAsset(null);
          }}
        >
          <button
            type="button"
            aria-label="关闭预览"
            className="absolute top-3 right-3 inline-flex size-9 items-center justify-center text-white hover:bg-white/10"
            onClick={() => setPreviewAsset(null)}
          >
            <XIcon className="size-5" aria-hidden />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewAsset.url}
            alt={previewAsset.title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 max-w-[90vw] -translate-x-1/2 truncate rounded-none bg-black/60 px-3 py-1 text-xs text-white">
            {previewAsset.title}
          </p>
        </div>
      ) : null}
    </>
  );
}
