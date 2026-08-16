/**
 * 词条 slug / URL：按功能三块
 * 1. 路由进门 — Next params → 明文 /entry/...（唯一处理 % 编码）
 * 2. 正文链接 — classifyMarkdownHref（词条 / 外链 / 无效）
 * 3. 编辑器 — 预览拼接与 slug 校验
 *
 * 约定：业务层一律使用明文 `/entry/...`；库内 entries.href 全局唯一。
 * 正文不认 # 锚点、不补斜杠、不剥 query。
 */

import type { EntryCreateType } from "@/type/entry-api";

export const ENTRY_PREFIX = "/entry";
/** 博客在路径中的固定前缀名（/entry/blog/{slug}） */
export const BLOG_SLUG = "blog";
export const SLUG_MAX = 64;
export const RESERVED_SLUGS = new Set([BLOG_SLUG]);

/** @deprecated 使用 BLOG_SLUG */
export const BLOG_SEGMENT = BLOG_SLUG;

// ---------------------------------------------------------------------------
// 1. 路由进门 + 正文链接分类
// ---------------------------------------------------------------------------

/** Next params 里可能残留的 %XX → 明文（仅此边界使用） */
function decodeParamPart(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.includes("%")) return trimmed;
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

/**
 * Next `params.slug`（可能带 % 编码）→ 明文词条 href。
 * 这是全站唯一必须处理 percent-encoding 的入口。
 */
export function hrefFromEntryParams(
  paramsSlug: readonly string[]
): string | null {
  if (paramsSlug.length === 0) return null;

  const parts = paramsSlug
    .map(decodeParamPart)
    .map(normalizeSlugValue);
  if (parts.some((part) => !part)) return null;

  if (parts[0] === BLOG_SLUG && parts.length !== 2) return null;

  return `${ENTRY_PREFIX}/${parts.join("/")}`;
}

export function buildBlogEntryHref(slug: string): string {
  return `${ENTRY_PREFIX}/${BLOG_SLUG}/${normalizeSlugValue(slug)}`;
}

/** 祖先链上的各级 slug（明文）→ 普通词条明文 href */
export function buildCommonHref(slugs: string[]): string {
  if (slugs.length === 0) return ENTRY_PREFIX;
  return `${ENTRY_PREFIX}/${slugs.map(normalizeSlugValue).join("/")}`;
}

export type MarkdownHref =
  | { kind: "entry"; href: string }
  | { kind: "external"; href: string }
  | { kind: "invalid" };

/**
 * 正文 / 预览共用的 href 分类。
 * 词条必须已是 `/entry/{...}`，与 entries.href 一致；含 # 或 ? 的站内写法无效。
 * 外链允许自身的 query / hash。
 */
export function classifyMarkdownHref(
  raw: string | null | undefined
): MarkdownHref {
  if (!raw) return { kind: "invalid" };

  if (
    raw.startsWith("https://") ||
    raw.startsWith("http://") ||
    raw.startsWith("//")
  ) {
    return { kind: "external", href: raw };
  }

  if (raw.includes("#") || raw.includes("?")) {
    return { kind: "invalid" };
  }

  if (
    raw.startsWith(`${ENTRY_PREFIX}/`) &&
    raw.length > ENTRY_PREFIX.length + 1
  ) {
    return { kind: "entry", href: raw };
  }

  return { kind: "invalid" };
}

// ---------------------------------------------------------------------------
// 2. 预览拼接（父级明文 href + 本级 slug）
// ---------------------------------------------------------------------------

/**
 * - blog：忽略 parentHref，固定 `/entry/blog/{slug}`
 * - common：parentHref 为空时挂到 `/entry` 下
 */
export function buildPreviewHref(
  parentHref: string | null,
  slug: string,
  entryType: EntryCreateType
): string {
  const raw = slug.trim() || "…";
  const leaf = raw === "…" ? "…" : normalizeSlugValue(raw);

  if (entryType === "blog") {
    return `${ENTRY_PREFIX}/${BLOG_SLUG}/${leaf}`;
  }

  if (!parentHref || parentHref === ENTRY_PREFIX) {
    return `${ENTRY_PREFIX}/${leaf}`;
  }

  return `${parentHref.replace(/\/$/, "")}/${leaf}`;
}

// ---------------------------------------------------------------------------
// 3. 校验（name / slug）
// ---------------------------------------------------------------------------

export function normalizeSlugValue(value: string): string {
  return value.normalize("NFC").trim();
}

export function validateSlug(value: string): {
  valid: boolean;
  reason?: string;
} {
  const slug = normalizeSlugValue(value);

  if (slug.length < 1) {
    return { valid: false, reason: "URL 别名不能为空" };
  }

  if (slug.length > SLUG_MAX) {
    return { valid: false, reason: `URL 别名不能超过 ${SLUG_MAX} 个字符` };
  }

  if (slug === "." || slug === "..") {
    return { valid: false, reason: "URL 别名无效" };
  }

  if (/[/\\#?%]/.test(slug)) {
    return { valid: false, reason: "URL 别名不能包含 / \\ # ? % 等字符" };
  }

  if (/[\0-\x1f]/.test(slug)) {
    return { valid: false, reason: "URL 别名包含非法控制字符" };
  }

  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    return { valid: false, reason: `"${slug}" 为保留路径，请更换 URL 别名` };
  }

  return { valid: true };
}

function slugFromName(name: string): string | null {
  const trimmed = normalizeSlugValue(name);
  if (!trimmed) return null;
  return validateSlug(trimmed).valid ? trimmed : null;
}

/** 有显式 slug 则校验之；否则尝试用 name 作 slug */
export function resolveEntrySlug(
  name: string,
  explicitSlug?: string | null
): { ok: true; slug: string } | { ok: false; error: string } {
  const normalizedName = normalizeSlugValue(name);
  if (!normalizedName) {
    return { ok: false, error: "词条名不能为空" };
  }

  if (
    explicitSlug !== undefined &&
    explicitSlug !== null &&
    explicitSlug !== ""
  ) {
    const normalizedSlug = normalizeSlugValue(explicitSlug);
    const result = validateSlug(normalizedSlug);
    if (!result.valid) {
      return { ok: false, error: result.reason ?? "URL 别名无效" };
    }
    return { ok: true, slug: normalizedSlug };
  }

  const autoSlug = slugFromName(normalizedName);
  if (autoSlug) {
    return { ok: true, slug: autoSlug };
  }

  return {
    ok: false,
    error: "标题含不能用于 URL 的字符，请填写 URL 别名",
  };
}
