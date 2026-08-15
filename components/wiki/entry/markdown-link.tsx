"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { EntryLinkPreview } from "@/components/wiki/entry/entry-link-preview";
import {
  isExternalHref,
  splitCanonicalEntryHref,
} from "@/lib/wiki/entry-slug";
import { cn } from "@/lib/utils";

function InvalidLink({
  className,
  children,
}: {
  className: string;
  children: ComponentProps<"a">["children"];
}) {
  return (
    <span className={cn(className, "cursor-not-allowed opacity-70")}>
      {children}
    </span>
  );
}

export function MarkdownLink({
  href,
  children,
  className,
  ...props
}: ComponentProps<"a">) {
  const linkClassName = cn("wiki-link", className);

  if (!href) {
    return <InvalidLink className={linkClassName}>{children}</InvalidLink>;
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={linkClassName} {...props}>
        {children}
      </a>
    );
  }

  const entry = splitCanonicalEntryHref(href);
  if (entry) {
    if (entry.hash) {
      return (
        <Link href={`${entry.path}${entry.hash}`} className={linkClassName}>
          {children}
        </Link>
      );
    }

    return (
      <EntryLinkPreview href={entry.path} className={linkClassName}>
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

  return <InvalidLink className={linkClassName}>{children}</InvalidLink>;
}
