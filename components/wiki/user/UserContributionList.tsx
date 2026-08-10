"use client";

import Link from "next/link";
import { ExpandableList } from "@/components/wiki/user/ExpandableList";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { RecentContributionItem } from "@/type/entry";

interface UserContributionListProps {
  items: RecentContributionItem[];
  /** 是否在行内显示贡献者（用户主页可隐藏） */
  showContributor?: boolean;
}

export function UserContributionList({
  items,
  showContributor = false,
}: UserContributionListProps) {
  return (
    <ExpandableList
      title="最近贡献"
      itemCount={items.length}
      emptyText="暂无词条编辑记录。"
    >
      {({ end }) => (
        <ul className="divide-y divide-border border-y border-border">
          {items.slice(0, end).map((item) => (
            <li
              key={item.versionId}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-3 text-sm"
            >
              <time
                dateTime={item.createdAt}
                className="shrink-0 font-medium text-muted-foreground"
                title={new Date(item.createdAt).toLocaleString("zh-CN")}
              >
                {formatRelativeTime(item.createdAt)}
              </time>
              <span className="text-muted-foreground" aria-hidden>
                ·
              </span>
              <Link
                href={item.entryHref}
                className="font-medium text-wiki-link hover:underline"
              >
                {item.entryName}
              </Link>
              <span className="min-w-0 text-muted-foreground">
                （{item.message}）
              </span>
              {showContributor ? (
                <>
                  <span className="text-muted-foreground" aria-hidden>
                    ·
                  </span>
                  <Link
                    href={`/user/${item.contributorId}`}
                    className="shrink-0 text-wiki-link hover:underline"
                  >
                    {item.contributorName}
                  </Link>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </ExpandableList>
  );
}
