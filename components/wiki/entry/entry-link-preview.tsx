"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { fetchEntryPreview } from "@/lib/api/entries";
import { normalizeInternalEntryHref } from "@/lib/wiki/resolve-entry-link";
import { cn } from "@/lib/utils";
import type { EntryPreviewData } from "@/type/entry-api";

const OPEN_DELAY_MS = 280;
const CLOSE_DELAY_MS = 180;
const CARD_WIDTH = 320;
const VIEWPORT_PAD = 8;

type PreviewCacheEntry =
  | { status: "ok"; data: EntryPreviewData }
  | { status: "invalid"; error: string };

const previewCache = new Map<string, PreviewCacheEntry>();

type CardCoords = {
  top: number;
  left: number;
  placement: "above" | "below";
};

function computeCoords(anchor: DOMRect): CardCoords {
  const placeBelow = anchor.top < window.innerHeight / 2;
  const left = Math.min(
    Math.max(VIEWPORT_PAD, anchor.left + anchor.width / 2 - CARD_WIDTH / 2),
    window.innerWidth - CARD_WIDTH - VIEWPORT_PAD
  );

  if (placeBelow) {
    return {
      top: anchor.bottom + 10,
      left,
      placement: "below",
    };
  }

  return {
    top: anchor.top - 10,
    left,
    placement: "above",
  };
}

interface EntryLinkPreviewProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export function EntryLinkPreview({
  href,
  className,
  children,
}: EntryLinkPreviewProps) {
  const normalized = normalizeInternalEntryHref(href) ?? href;
  const tooltipId = useId();
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<CardCoords | null>(null);
  const [preview, setPreview] = useState<EntryPreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    setCoords(computeCoords(el.getBoundingClientRect()));
  }, []);

  const loadPreview = useCallback(async () => {
    const cached = previewCache.get(normalized);
    if (cached) {
      if (cached.status === "ok") {
        setPreview(cached.data);
        setError(null);
      } else {
        setPreview(null);
        setError(cached.error);
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchEntryPreview(normalized);
      if (result.preview) {
        previewCache.set(normalized, { status: "ok", data: result.preview });
        setPreview(result.preview);
        setError(null);
      } else {
        const message = result.error ?? "词条不存在或链接无效";
        previewCache.set(normalized, { status: "invalid", error: message });
        setPreview(null);
        setError(message);
      }
    } catch {
      setPreview(null);
      setError("预览加载失败");
    } finally {
      setLoading(false);
    }
  }, [normalized]);

  const scheduleOpen = useCallback(() => {
    clearTimers();
    openTimer.current = window.setTimeout(() => {
      updatePosition();
      setOpen(true);
      void loadPreview();
    }, OPEN_DELAY_MS);
  }, [clearTimers, loadPreview, updatePosition]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
    }, CLOSE_DELAY_MS);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition]);

  const card =
    open && coords && typeof document !== "undefined"
      ? createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            className={cn(
              "pointer-events-auto fixed z-50 w-80 rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
              coords.placement === "above" && "-translate-y-full"
            )}
            style={{ top: coords.top, left: coords.left, width: CARD_WIDTH }}
            onPointerEnter={scheduleOpen}
            onPointerLeave={scheduleClose}
          >
            <div
              className={cn(
                "absolute left-1/2 size-2.5 -translate-x-1/2 rotate-45 border-border bg-popover",
                coords.placement === "below"
                  ? "-top-1.5 border-t border-l"
                  : "-bottom-1.5 border-r border-b"
              )}
              style={{
                left: Math.min(
                  Math.max(16, (anchorRef.current?.getBoundingClientRect().left ??
                    0) +
                    (anchorRef.current?.getBoundingClientRect().width ?? 0) /
                      2 -
                    coords.left),
                  CARD_WIDTH - 16
                ),
              }}
              aria-hidden
            />
            <div className="relative z-10 p-3">
              {loading && !preview && !error ? (
                <p className="text-sm text-muted-foreground">加载预览…</p>
              ) : error ? (
                <p className="text-sm text-muted-foreground">{error}</p>
              ) : preview ? (
                <>
                  <Link
                    href={preview.href}
                    className="text-sm font-semibold text-foreground hover:text-wiki-accent"
                    onClick={() => setOpen(false)}
                  >
                    {preview.title}
                  </Link>
                  {preview.excerpt ? (
                    <p className="mt-1.5 line-clamp-4 text-[13px] leading-relaxed text-muted-foreground [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
                      {preview.excerpt}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[13px] text-muted-foreground">
                      暂无正文摘要
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <Link
        ref={anchorRef}
        href={normalized}
        className={className}
        aria-describedby={open ? tooltipId : undefined}
        onPointerEnter={scheduleOpen}
        onPointerLeave={scheduleClose}
        onFocus={scheduleOpen}
        onBlur={scheduleClose}
      >
        {children}
      </Link>
      {card}
    </>
  );
}
