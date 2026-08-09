import { WikiCard } from "@/components/wiki/card/WikiCard";
import { extractHeadings } from "@/lib/wiki/extract-headings";
import { buildEntryEditHref } from "@/lib/wiki/entry-path";
import type { BreadcrumbItem, RelatedEntryies } from "@/type/entry";
import { EntryContent } from "./EntryContent";
import { EntryToolbar } from "./EntryToolbar";
import { EntryToc } from "./EntryToc";
import { EntryTree } from "./EntryTree";

interface WikiEntryProps {
  entryId: string;
  path: string;
  content: string;
  title?: string;
  breadcrumbs: BreadcrumbItem[];
  relatedEntries: RelatedEntryies;
}

export function WikiEntry({
  entryId,
  path,
  content,
  title,
  breadcrumbs,
  relatedEntries,
}: WikiEntryProps) {
  // 解析出层级结构
  const headings = extractHeadings(content);

  return (
    <main className="flex min-w-0 flex-1 justify-between gap-2">
      {/* 窄屏时隐藏目录  */}
      <aside className="hidden w-44 shrink-0 lg:block">
        <EntryToc headings={headings} />
      </aside>

      <div className="flex min-w-0 flex-2 flex-col">
        <EntryToolbar
          readHref={path}
          editHref={buildEntryEditHref(path)}
          breadcrumbs={breadcrumbs}
        />
        <WikiCard
          className="min-w-0 rounded-t-none border-t-0"
          padding="lg"
          as="article"
        >
          {title && <h1 className="mb-6 text-2xl font-bold">{title}</h1>}
          <EntryContent content={content} />
        </WikiCard>
      </div>

      <aside className="hidden w-52 shrink-0 lg:block">
        <EntryTree
          currentEntryId={entryId}
          relatedEntries={relatedEntries}
        />
      </aside>
    </main>
  );
}
