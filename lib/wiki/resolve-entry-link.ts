/**
 * 站内词条链接规范：
 * - 正文推荐写作 `entry/xxx` 或 `/entry/xxx`
 * - 运行时统一规范为以 `/entry` 开头的绝对路径
 */

const ENTRY_PREFIX = "/entry";

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

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}

/**
 * 将 `entry/foo`、`/entry/foo`、带 query/hash 的形式规范为 `/entry/...` 路径（不含 hash）。
 * 非法时返回 null。
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

  // 去掉末尾多余斜杠（保留 `/entry` 本身）
  if (path.length > ENTRY_PREFIX.length && path.endsWith("/")) {
    path = path.replace(/\/+$/, "");
  }

  return path || null;
}

/**
 * 从规范 href 解析供 `getEntryPageDataBySegments` 使用的 slug 段。
 * `/entry` → []；`/entry/a/b` → ['a','b']（已 decode）。
 */
export function entryHrefToSegments(href: string): string[] | null {
  const normalized = normalizeInternalEntryHref(href);
  if (!normalized) return null;
  if (normalized === ENTRY_PREFIX) return [];

  const rest = normalized.slice(ENTRY_PREFIX.length + 1);
  if (!rest) return [];

  try {
    return rest.split("/").map((seg) => decodeURIComponent(seg)).filter(Boolean);
  } catch {
    return null;
  }
}
