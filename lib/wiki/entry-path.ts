import type { BreadcrumbItem, EntryType } from "@/type/entry";
import {
  buildEncodedCommonHref,
  normalizeSlugValue,
  slugFromName,
} from "@/lib/wiki/entry-slug";
import type { EntryCreateType } from "@/type/entry-api";

export const BLOG_SEGMENT = "blog";
const PREVIEW_ID = "preview";

export interface EntryPathSegment {
  id: string;
  slug: string;
  name: string;
  type: EntryType;
}

export interface CreatePreviewParent {
  href: string;
  breadcrumbs: BreadcrumbItem[];
}

/** @deprecated 使用 slugFromName / resolveEntrySlug */
export function titleToSlug(title: string): string {
  return (
    (slugFromName(title) ??
      normalizeSlugValue(title).replace(/[/\\#?%]/g, "-")) ||
    "untitled"
  );
}

/** 博客词条：/entry/blog/{slug} */
export function buildBlogEntryHref(slug: string): string {
  return `/entry/${BLOG_SEGMENT}/${encodeURIComponent(normalizeSlugValue(slug))}`;
}

export function buildCommonEntryHref(chain: EntryPathSegment[]): string {
  if (chain.length === 0) return "/entry";
  return buildEncodedCommonHref(chain.map((item) => item.slug));
}

export function buildEntryHref(chain: EntryPathSegment[]): string {
  if (chain.length === 0) return "/entry";

  const entry = chain[chain.length - 1];
  if (entry.type === "blog" && chain.length === 1) {
    return buildBlogEntryHref(entry.slug);
  }

  return buildCommonEntryHref(chain);
}

export function buildEntryEditHref(readPath: string): string {
  if (!readPath.startsWith("/entry")) {
    return "/entry/edit";
  }

  return readPath.replace(/^\/entry(?=\/|$)/, "/entry/edit");
}

/** 阅读路径 → 历史：/entry/foo → /entry/history/foo */
export function buildEntryHistoryHref(readPath: string): string {
  if (!readPath.startsWith("/entry")) {
    return "/entry/history";
  }

  return readPath.replace(/^\/entry(?=\/|$)/, "/entry/history");
}

/** 阅读路径 → 讨论：/entry/foo → /entry/discuss/foo */
export function buildEntryDiscussHref(readPath: string): string {
  if (!readPath.startsWith("/entry")) {
    return "/entry/discuss";
  }

  return readPath.replace(/^\/entry(?=\/|$)/, "/entry/discuss");
}

/** 阅读路径 → 版本对比：/entry/diff/foo?from=&to=（from 为较旧，to 为较新） */
export function buildEntryDiffHref(
  readPath: string,
  fromVersionId: string,
  toVersionId: string
): string {
  const base = readPath.startsWith("/entry")
    ? readPath.replace(/^\/entry(?=\/|$)/, "/entry/diff")
    : "/entry/diff";
  const params = new URLSearchParams({
    from: fromVersionId,
    to: toVersionId,
  });
  return `${base}?${params.toString()}`;
}

export function buildBreadcrumbs(chain: EntryPathSegment[]): BreadcrumbItem[] {
  if (chain.length === 0) return [];

  const entry = chain[chain.length - 1];
  if (entry.type === "blog" && chain.length === 1) {
    return [
      {
        id: BLOG_SEGMENT,
        slug: BLOG_SEGMENT,
        name: "博客",
        href: `/entry/${BLOG_SEGMENT}`,
      },
      {
        id: entry.id,
        slug: entry.slug,
        name: entry.name,
        href: buildBlogEntryHref(entry.slug),
      },
    ];
  }

  return chain.map((item, index) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    href: buildCommonEntryHref(chain.slice(0, index + 1)),
  }));
}

export function formatBreadcrumbPath(breadcrumbs: BreadcrumbItem[]): string {
  return breadcrumbs.map((item) => item.name).join(" / ");
}

/** 路径预览用：把 percent-encoding 还原为可读字符（中文 slug 等） */
export function toDisplayEntryPath(path: string): string {
  return path
    .split("/")
    .map((segment) => {
      if (!segment || !segment.includes("%")) return segment;
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");
}

/**
 * 创建页路径预览。
 * - blog：固定 /entry/blog/{slug}
 * - common：parent 为 null 表示顶级；否则挂在父词条下
 * 预览展示明文 slug（与合法标题一致）；实际跳转链接仍可用编码形式。
 */
export function buildCreatePreview(
  entryType: EntryCreateType,
  parent: CreatePreviewParent | null,
  title: string,
  slugOverride?: string
): { href: string; breadcrumbs: BreadcrumbItem[]; breadcrumbPath: string } {
  const name = title.trim() || "未命名词条";
  const slug =
    slugOverride?.trim() ||
    slugFromName(title.trim()) ||
    slugFromName(name) ||
    "…";

  const displaySlug =
    slug === "…" ? slug : normalizeSlugValue(slug);

  if (entryType === "blog") {
    const href =
      slug === "…"
        ? `/entry/${BLOG_SEGMENT}/…`
        : `/entry/${BLOG_SEGMENT}/${displaySlug}`;
    const breadcrumbs: BreadcrumbItem[] = [
      {
        id: BLOG_SEGMENT,
        slug: BLOG_SEGMENT,
        name: "博客",
        href: `/entry/${BLOG_SEGMENT}`,
      },
      {
        id: PREVIEW_ID,
        slug,
        name,
        // 祖先链可点跳转仍用编码 href
        href: slug === "…" ? href : buildBlogEntryHref(slug),
      },
    ];
    return {
      href,
      breadcrumbs,
      breadcrumbPath: formatBreadcrumbPath(breadcrumbs),
    };
  }

  if (!parent) {
    const href = slug === "…" ? "/entry/…" : `/entry/${displaySlug}`;
    const breadcrumbs: BreadcrumbItem[] = [
      {
        id: PREVIEW_ID,
        slug,
        name,
        href:
          slug === "…"
            ? href
            : buildEncodedCommonHref([normalizeSlugValue(slug)]),
      },
    ];
    return {
      href,
      breadcrumbs,
      breadcrumbPath: formatBreadcrumbPath(breadcrumbs),
    };
  }

  const parentDisplayBase =
    toDisplayEntryPath(parent.href.replace(/\/$/, "")) || "/entry";
  const href =
    slug === "…"
      ? `${parentDisplayBase}/…`
      : `${parentDisplayBase}/${displaySlug}`;
  const breadcrumbs: BreadcrumbItem[] = [
    ...parent.breadcrumbs,
    {
      id: PREVIEW_ID,
      slug,
      name,
      href:
        slug === "…"
          ? href
          : `${parent.href.replace(/\/$/, "")}/${encodeURIComponent(normalizeSlugValue(slug))}`,
    },
  ];

  return {
    href,
    breadcrumbs,
    breadcrumbPath: formatBreadcrumbPath(breadcrumbs),
  };
}

export function isBlogEntryPath(segments: string[]): boolean {
  return segments.length === 2 && segments[0] === BLOG_SEGMENT;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
