import Link from "next/link";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { RecentBlogItem } from "@/type/entry";
import { cn } from "@/lib/utils";

interface RecentBlogsProps {
  items: RecentBlogItem[];
  className?: string;
  title?: string;
}

export function RecentBlogs({
  items,
  className,
  title = "近期博客",
}: RecentBlogsProps) {
  return (
    <WikiCard padding="lg" className={cn("min-w-0", className)}>
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">暂无博客。</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {items.map((item) => (
            <li
              key={item.entryId}
              className="flex items-baseline gap-x-2 gap-y-1 py-3 text-sm"
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
                className="min-w-0 truncate font-medium text-wiki-link hover:underline"
              >
                {item.title}
              </Link>
              <Link
                href={`/user/${item.authorId}`}
                className="ml-auto shrink-0 text-wiki-link hover:underline"
              >
                {item.authorName}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WikiCard>
  );
}
