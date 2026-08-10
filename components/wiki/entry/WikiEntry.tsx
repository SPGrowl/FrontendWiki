import { WikiCard } from "@/components/wiki/card/WikiCard";
import { extractHeadings } from "@/lib/wiki/extract-headings";
import {
  buildEntryDiscussHref,
  buildEntryEditHref,
  buildEntryHistoryHref,
} from "@/lib/wiki/entry-path";
import type { BreadcrumbItem, Contributor, RelatedEntryies } from "@/type/entry";
import { EntryContent } from "./EntryContent";
import { EntryContributors } from "./EntryContributors";
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
  contributors: Contributor[];
}

export function WikiEntry({
  entryId,
  path,
  content,
  title,
  breadcrumbs,
  relatedEntries,
  contributors,
}: WikiEntryProps) {
  const headings = extractHeadings(content);

  return (
    <main className="flex min-h-0 min-w-0 flex-1 justify-between gap-2">
      <aside className="hidden w-44 shrink-0 overflow-y-auto lg:block">
        <EntryToc headings={headings} />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-2 flex-col overflow-y-auto">
        <EntryToolbar
          readHref={path}
          editHref={buildEntryEditHref(path)}
          historyHref={buildEntryHistoryHref(path)}
          discussHref={buildEntryDiscussHref(path)}
          breadcrumbs={breadcrumbs}
        />
        <WikiCard
          className="min-h-min min-w-0 shrink-0 rounded-t-none border-t-0"
          padding="lg"
          as="article"
        >
          {title && <h1 className="mb-6 text-2xl font-bold">{title}</h1>}
          <EntryContent content={content} />
        </WikiCard>
      </div>

      <aside className="hidden w-52 shrink-0 flex-col gap-4 overflow-hidden lg:flex">
        <EntryContributors contributors={contributors} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <EntryTree
            currentEntryId={entryId}
            relatedEntries={relatedEntries}
          />
        </div>
      </aside>
    </main>
  );
}
