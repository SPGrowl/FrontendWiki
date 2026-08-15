/**
 * 词条 slug / URL：按功能三块
 * 1. 解析 — Next params 或站内 href → 明文 /entry/... （唯一需要处理 % 编码的地方）
 * 2. 预览拼接 — 父级明文 href + 本级 slug → 预览路径
 * 3. 校验 — 输入 name、slug 的规范化与合法性
 *
 * 约定：业务层（API、读模型、Link、预览）一律使用明文 `/entry/...` href；
 * 库内 entries.href 为全局唯一物化路径，阅读页按该列直查。
 * HTTP 线路上的 percent-encoding 由浏览器处理，应用内不要再 encode 词条 path。
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
// 1. 解析（明文 href）
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

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}

/** 是否为站内词条 href（允许省略前导 `/`） */
export function isInternalEntryHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return false;
  if (trimmed.startsWith("//")) return false;

  const pathOnly = trimmed.split(/[?#]/)[0] ?? trimmed;
  return (
    pathOnly === "entry" ||
    pathOnly.startsWith("entry/") ||
    pathOnly === ENTRY_PREFIX ||
    pathOnly.startsWith(`${ENTRY_PREFIX}/`)
  );
}

/**
 * 将 `entry/foo`、`/entry/foo` 规范为明文 `/entry/...`（去掉 query/hash、尾斜杠）。
 * 非法或仅为 `/entry` 时返回 null。
 */
export function normalizeInternalEntryHref(href: string): string | null {
  if (!isInternalEntryHref(href)) return null;

  const trimmed = href.trim();
  const hashIndex = trimmed.search(/#/);
  const withoutHash =
    hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
  const pathAndQuery = withoutHash.split("?")[0] ?? withoutHash;
  let path = pathAndQuery.trim();

  if (path.startsWith("entry/") || path === "entry") {
    path = `/${path}`;
  }

  if (path !== ENTRY_PREFIX && !path.startsWith(`${ENTRY_PREFIX}/`)) {
    return null;
  }

  if (path.length > ENTRY_PREFIX.length && path.endsWith("/")) {
    path = path.replace(/\/+$/, "");
  }

  if (!path || path === ENTRY_PREFIX) return null;
  return path;
}

/** 博客词条：`/entry/blog/{slug}` → 本级 slug；否则 null */
export function blogSlugFromHref(href: string): string | null {
  const normalized = normalizeInternalEntryHref(href);
  if (!normalized) return null;

  const prefix = `${ENTRY_PREFIX}/${BLOG_SLUG}/`;
  if (!normalized.startsWith(prefix)) return null;

  const slug = normalized.slice(prefix.length);
  if (!slug || slug.includes("/")) return null;
  return slug;
}

/**
 * 普通词条明文 href → 从根到叶的各级 slug（供逐级查库）。
 * 博客路径返回 null（应走 blogSlugFromHref）。
 */
export function commonSlugsFromHref(href: string): string[] | null {
  const normalized = normalizeInternalEntryHref(href);
  if (!normalized) return null;
  if (blogSlugFromHref(normalized) !== null) return null;
  if (normalized.startsWith(`${ENTRY_PREFIX}/${BLOG_SLUG}`)) return null;

  const rest = normalized.slice(ENTRY_PREFIX.length + 1);
  const slugs = rest.split("/").filter(Boolean);
  return slugs.length > 0 ? slugs : null;
}

/** @deprecated 使用 normalizeInternalEntryHref */
export function parseEntryHref(href: string): { href: string } | null {
  const normalized = normalizeInternalEntryHref(href);
  return normalized ? { href: normalized } : null;
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
