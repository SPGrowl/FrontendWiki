"use client";

import Link from "next/link";
import { ExpandableList } from "@/components/wiki/user/ExpandableList";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { UserBlogItem } from "@/type/entry";

interface UserBlogListProps {
  items: UserBlogItem[];
}

export function UserBlogList({ items }: UserBlogListProps) {
  return (
    <ExpandableList
      title="最近博客"
      itemCount={items.length}
      emptyText="暂无已发布博客。"
    >
      {({ end }) => (
        <ul className="divide-y divide-border border-y border-border">
          {items.slice(0, end).map((item) => (
            <li
              key={item.entryId}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-3 text-sm"
            >
              <time
                dateTime={item.updatedAt}
                className="shrink-0 font-medium text-muted-foreground"
                title={new Date(item.updatedAt).toLocaleString("zh-CN")}
              >
                {formatRelativeTime(item.updatedAt)}
              </time>
              <span className="text-muted-foreground" aria-hidden>
                ·
              </span>
              <Link
                href={item.href}
                className="min-w-0 font-medium text-wiki-link hover:underline"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ExpandableList>
  );
}
