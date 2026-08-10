import Link from "next/link";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { EntryToolbar } from "@/components/wiki/entry/EntryToolbar";
import { MarkdownDiffViewer } from "@/components/wiki/entry/markdown-diff-viewer";
import {
  buildEntryEditHref,
  buildEntryHistoryHref,
} from "@/lib/wiki/entry-path";
import type { EntryDiffPageData } from "@/type/entry";

function formatVersionTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function sideLabel(
  side: EntryDiffPageData["from"],
  role: "较旧" | "较新"
): string {
  const current = side.isCurrent ? " · 最新" : "";
  return `${role} · v${side.versionNo}${current} · ${formatVersionTime(side.createdAt)} · ${side.contributorName}`;
}

interface EntryDiffViewProps {
  data: EntryDiffPageData;
}

export function EntryDiffView({ data }: EntryDiffViewProps) {
  const historyHref = buildEntryHistoryHref(data.readPath);
  const editHref = buildEntryEditHref(data.readPath);

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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">
            {data.entryName}
            <span className="text-muted-foreground">：版本对比</span>
          </h1>
          <Link
            href={data.historyPath}
            className="text-sm text-wiki-link hover:underline"
          >
            返回修订历史
          </Link>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          左侧为较旧版本，右侧为较新版本。说明：较旧「{data.from.message}」→
          较新「{data.to.message}」
        </p>

        <MarkdownDiffViewer
          left={data.from.content}
          right={data.to.content}
          leftLabel={sideLabel(data.from, "较旧")}
          rightLabel={sideLabel(data.to, "较新")}
        />
      </WikiCard>
    </main>
  );
}
