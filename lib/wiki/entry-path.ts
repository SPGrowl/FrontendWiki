import type { BreadcrumbItem, EntryType } from "@/type/entry";
import {
  buildEncodedCommonHref,
  normalizeSlugValue,
  slugFromName,
} from "@/lib/wiki/entry-slug";
import type { EntryPublishTarget } from "@/type/entry-api";

export const BLOG_SEGMENT = "blog";
export const BLOG_HREF_PLACEHOLDER = "<词条ID>";
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

export function buildBlogEntryHref(entryId: string): string {
  return `/entry/${BLOG_SEGMENT}/${entryId}`;
}

export function buildCommonEntryHref(chain: EntryPathSegment[]): string {
  if (chain.length === 0) return "/entry";
  return buildEncodedCommonHref(chain.map((item) => item.slug));
}

export function buildEntryHref(chain: EntryPathSegment[]): string {
  if (chain.length === 0) return "/entry";

  const entry = chain[chain.length - 1];
  if (entry.type === "blog" && chain.length === 1) {
    return buildBlogEntryHref(entry.id);
  }

  return buildCommonEntryHref(chain);
}

export function buildEntryEditHref(readPath: string): string {
  if (!readPath.startsWith("/entry")) {
    return "/entry/edit";
  }

  return readPath.replace(/^\/entry(?=\/|$)/, "/entry/edit");
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
        href: buildBlogEntryHref(entry.id),
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

export function buildCreatePreview(
  target: EntryPublishTarget,
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

  const encodedSlug =
    slug === "…" ? slug : encodeURIComponent(normalizeSlugValue(slug));

  if (target === "blog") {
    const href = buildBlogEntryHref(BLOG_HREF_PLACEHOLDER);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        id: BLOG_SEGMENT,
        slug: BLOG_SEGMENT,
        name: "博客",
        href: `/entry/${BLOG_SEGMENT}`,
      },
      { id: PREVIEW_ID, slug, name, href },
    ];
    return {
      href,
      breadcrumbs,
      breadcrumbPath: formatBreadcrumbPath(breadcrumbs),
    };
  }

  if (target === "root") {
    const href = slug === "…" ? "/entry/…" : `/entry/${encodedSlug}`;
    const breadcrumbs: BreadcrumbItem[] = [{ id: PREVIEW_ID, slug, name, href }];
    return {
      href,
      breadcrumbs,
      breadcrumbPath: formatBreadcrumbPath(breadcrumbs),
    };
  }

  const breadcrumbs: BreadcrumbItem[] = parent
    ? [
        ...parent.breadcrumbs,
        {
          id: PREVIEW_ID,
          slug,
          name,
          href:
            slug === "…"
              ? `${parent.href.replace(/\/$/, "")}/…`
              : `${parent.href.replace(/\/$/, "")}/${encodedSlug}`,
        },
      ]
    : [
        {
          id: PREVIEW_ID,
          slug,
          name,
          href: slug === "…" ? "/entry/…" : `/entry/${encodedSlug}`,
        },
      ];

  const parentBase = parent?.href.replace(/\/$/, "") ?? "/entry";

  return {
    href: slug === "…" ? `${parentBase}/…` : `${parentBase}/${encodedSlug}`,
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
