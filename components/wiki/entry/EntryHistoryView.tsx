import Link from "next/link";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { EntryToolbar } from "@/components/wiki/entry/EntryToolbar";
import {
  buildEntryDiffHref,
  buildEntryEditHref,
  buildEntryHistoryHref,
} from "@/lib/wiki/entry-path";
import type { EntryHistoryPageData } from "@/type/entry";
import { cn } from "@/lib/utils";

function formatVersionTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

interface EntryHistoryViewProps {
  data: EntryHistoryPageData;
}

export function EntryHistoryView({ data }: EntryHistoryViewProps) {
  const historyHref = buildEntryHistoryHref(data.readPath);
  const editHref = buildEntryEditHref(data.readPath);
  const currentVersionId =
    data.versions.find((item) => item.isCurrent)?.id ?? null;

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
      <EntryToolbar
        activeTab="history"
        readHref={data.readPath}
        editHref={editHref}
        historyHref={historyHref}
        breadcrumbs={data.breadcrumbs}
      />
      <WikiCard
        className="min-h-min min-w-0 shrink-0 rounded-t-none border-t-0"
        padding="lg"
        as="article"
      >
        <h1 className="mb-2 text-2xl font-bold">
          {data.title}
          <span className="text-muted-foreground">：修订历史</span>
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          可与该次提交的上一版（先前）或最新版（当前）对比，对比视图与编辑页一致。
        </p>

        {data.versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无版本记录。</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {data.versions.map((version) => {
              const prevHref = version.previousVersionId
                ? buildEntryDiffHref(
                    data.readPath,
                    version.previousVersionId,
                    version.id
                  )
                : null;
              const currentHref =
                currentVersionId &&
                !version.isCurrent &&
                currentVersionId !== version.id
                  ? buildEntryDiffHref(
                      data.readPath,
                      version.id,
                      currentVersionId
                    )
                  : null;

              return (
                <li
                  key={version.id}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3 text-sm"
                >
                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground">
                    <span>(</span>
                    {currentHref ? (
                      <Link
                        href={currentHref}
                        className="text-wiki-link hover:underline"
                      >
                        当前
                      </Link>
                    ) : (
                      <span className="text-muted-foreground/50">当前</span>
                    )}
                    <span>|</span>
                    {prevHref ? (
                      <Link
                        href={prevHref}
                        className="text-wiki-link hover:underline"
                      >
                        先前
                      </Link>
                    ) : (
                      <span className="text-muted-foreground/50">先前</span>
                    )}
                    <span>)</span>
                  </span>

                  <time
                    dateTime={version.createdAt}
                    className={cn(
                      "shrink-0 font-medium",
                      version.isCurrent
                        ? "text-wiki-accent"
                        : "text-foreground"
                    )}
                  >
                    {formatVersionTime(version.createdAt)}
                    {version.isCurrent ? "（当前）" : ""}
                  </time>

                  <Link
                    href={`/user/${version.contributorId}`}
                    className="shrink-0 text-wiki-link hover:underline"
                  >
                    {version.contributorName}
                  </Link>

                  <span className="min-w-0 text-muted-foreground">
                    （{version.message}）
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </WikiCard>
    </main>
  );
}
