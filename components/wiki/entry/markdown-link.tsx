"use client";

import type { ComponentProps } from "react";
import { EntryLinkPreview } from "@/components/wiki/entry/entry-link-preview";
import { classifyMarkdownHref } from "@/lib/wiki/entry-slug";
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
  const parsed = classifyMarkdownHref(href);

  switch (parsed.kind) {
    case "entry":
      return (
        <EntryLinkPreview href={parsed.href} className={linkClassName}>
          {children}
        </EntryLinkPreview>
      );
    case "external":
      return (
        <a
          href={parsed.href}
          className={linkClassName}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    case "invalid":
      return <InvalidLink className={linkClassName}>{children}</InvalidLink>;
  }
}
