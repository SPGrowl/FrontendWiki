import Link from "next/link";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { RecentContributionItem } from "@/type/entry";
import { cn } from "@/lib/utils";

interface RecentContributionsProps {
  items: RecentContributionItem[];
  className?: string;
  title?: string;
}

export function RecentContributions({
  items,
  className,
  title = "近期贡献",
}: RecentContributionsProps) {
  return (
    <WikiCard padding="lg" className={cn("min-w-0", className)}>
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">暂无词条编辑记录。</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {items.map((item) => (
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
              <span className="text-muted-foreground" aria-hidden>
                ·
              </span>
              <Link
                href={`/user/${item.contributorId}`}
                className="shrink-0 text-wiki-link hover:underline"
              >
                {item.contributorName}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WikiCard>
  );
}
