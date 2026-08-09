"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import {
  isExternalHref,
  isInternalEntryHref,
} from "@/lib/wiki/resolve-entry-link";
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
    return (
      <Link href={href} className={linkClassName}>
        {children}
      </Link>
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
