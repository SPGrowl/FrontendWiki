"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { EntryLinkPreview } from "@/components/wiki/entry/entry-link-preview";
import {
  isExternalHref,
  isInternalEntryHref,
  normalizeInternalEntryHref,
} from "@/lib/wiki/entry-slug";
import { cn } from "@/lib/utils";

export function MarkdownLink({
  href,
  children,
  className,
  ...props
}: ComponentProps<"a">) {
  const linkClassName = cn("wiki-link", className);

  if (!href) {
    return (
      <a className={linkClassName} {...props}>
        {children}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={linkClassName} {...props}>
        {children}
      </a>
    );
  }

  if (isInternalEntryHref(href)) {
    const normalized = normalizeInternalEntryHref(href);
    if (!normalized) {
      return (
        <span className={cn(linkClassName, "cursor-not-allowed opacity-70")}>
          {children}
        </span>
      );
    }

    const hashIndex = href.indexOf("#");
    const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
    const fullHref = `${normalized}${hash}`;

    // 带页内锚点时仍可跳转；预览按词条 path（无 hash）拉取
    if (hash) {
      return (
        <Link href={fullHref} className={linkClassName}>
          {children}
        </Link>
      );
    }

    return (
      <EntryLinkPreview href={normalized} className={linkClassName}>
        {children}
      </EntryLinkPreview>
    );
  }

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        className={linkClassName}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <a href={href} className={linkClassName} {...props}>
      {children}
    </a>
  );
}
