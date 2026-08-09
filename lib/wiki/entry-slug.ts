export const SLUG_MAX = 64;
export const RESERVED_SLUGS = new Set(["blog"]);

export interface SlugValidationResult {
  valid: boolean;
  reason?: string;
}

export function normalizeSlugValue(value: string): string {
  return value.normalize("NFC").trim();
}

/** 解码 URL path 单段（兼容已解码与 percent-encoded） */
export function normalizePathSegment(raw: string): string {
  let segment = raw;
  if (segment.includes("%")) {
    try {
      segment = decodeURIComponent(segment);
    } catch {
      // 保留原值
    }
  }
  return normalizeSlugValue(segment);
}

export function validateSlug(value: string): SlugValidationResult {
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

/** 标题是否可直接作为 slug */
export function canUseNameAsSlug(name: string): SlugValidationResult {
  return validateSlug(name);
}

export function slugFromName(name: string): string | null {
  const trimmed = normalizeSlugValue(name);
  if (!trimmed) return null;
  return validateSlug(trimmed).valid ? trimmed : null;
}

export function resolveEntrySlug(
  name: string,
  explicitSlug?: string | null
): { ok: true; slug: string } | { ok: false; error: string } {
  const normalizedName = normalizeSlugValue(name);
  if (!normalizedName) {
    return { ok: false, error: "词条名不能为空" };
  }

  if (explicitSlug !== undefined && explicitSlug !== null && explicitSlug !== "") {
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

export function encodeSlugPath(segments: string[]): string {
  return segments.map((segment) => encodeURIComponent(segment)).join("/");
}

export function buildEncodedCommonHref(segments: string[]): string {
  if (segments.length === 0) return "/entry";
  return `/entry/${encodeSlugPath(segments)}`;
}
