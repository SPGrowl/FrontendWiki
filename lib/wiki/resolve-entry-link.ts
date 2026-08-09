/** 站内词条链接：以 /entry 开头的完整 href（作者显式写入，不做 slug 猜测） */
export function isInternalEntryHref(href: string): boolean {
  return href === "/entry" || href.startsWith("/entry/");
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}
