import type { BreadcrumbItem, EntryType } from "@/type/entry";
import {
  BLOG_SLUG,
  buildBlogEntryHref,
  buildCommonHref,
} from "@/lib/wiki/entry-slug";

export { BLOG_SLUG, BLOG_SEGMENT, buildBlogEntryHref } from "@/lib/wiki/entry-slug";

/** 祖先链上的节点（查库用，含 id；对外读模型只用 name/href/slug） */
export interface EntryPathNode {
  id: string;
  slug: string;
  name: string;
  type: EntryType;
}

/** @deprecated 使用 EntryPathNode */
export type EntryPathSegment = EntryPathNode;

export function buildCommonEntryHref(chain: EntryPathNode[]): string {
  if (chain.length === 0) return "/entry";
  return buildCommonHref(chain.map((item) => item.slug));
}

export function buildEntryHref(chain: EntryPathNode[]): string {
  if (chain.length === 0) return "/entry";

  const entry = chain[chain.length - 1];
  if (entry.type === "blog" && chain.length === 1) {
    return buildBlogEntryHref(entry.slug);
  }

  return buildCommonEntryHref(chain);
}

/**
 * 由本级 type/slug + 父级已物化的 href 计算规范路径。
 * blog 忽略 parentHref；common 无父时挂到 /entry 下。
 */
export function resolveEntryHref(
  type: EntryType,
  slug: string,
  parentHref: string | null
): string {
  if (type === "blog") {
    return buildBlogEntryHref(slug);
  }

  if (!parentHref || parentHref === "/entry") {
    return buildCommonHref([slug]);
  }

  return `${parentHref.replace(/\/$/, "")}/${slug.trim()}`;
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

export function buildBreadcrumbs(chain: EntryPathNode[]): BreadcrumbItem[] {
  if (chain.length === 0) return [];

  const entry = chain[chain.length - 1];
  if (entry.type === "blog" && chain.length === 1) {
    return [
      {
        slug: BLOG_SLUG,
        name: "博客",
        href: `/entry/${BLOG_SLUG}`,
      },
      {
        slug: entry.slug,
        name: entry.name,
        href: buildBlogEntryHref(entry.slug),
      },
    ];
  }

  return chain.map((item, index) => ({
    slug: item.slug,
    name: item.name,
    href: buildCommonEntryHref(chain.slice(0, index + 1)),
  }));
}

/** 接受任意 8-4-4-4-12 十六进制 UUID（含种子数据中的 nil 风格 ID） */
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}
