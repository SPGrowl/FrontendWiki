import { WikiCard } from "@/components/wiki/card/WikiCard";
import { extractHeadings } from "@/lib/wiki/extract-headings";
import { EntryContent } from "./EntryContent";
import { EntryToc } from "./EntryToc";
import { EntryTree } from "./EntryTree";

interface WikiEntryProps {
  content: string;
  title?: string;
}

export function WikiEntry({ content, title }: WikiEntryProps) {
  // 解析出层级结构
  const headings = extractHeadings(content);

  return (
    <main className="flex min-w-0 flex-1 justify-between gap-2">
      {/* 窄屏时隐藏目录  */}
      <aside className="hidden w-44 shrink-0 lg:block">
        <EntryToc headings={headings} />
      </aside>

      <WikiCard className="min-w-0 flex-2" padding="lg" as="article">
        {title && <h1 className="mb-6 text-2xl font-bold">{title}</h1>}
        <EntryContent content={content} />
      </WikiCard>

      <aside className="hidden w-52 shrink-0 lg:block">
        <EntryTree />
      </aside>
    </main>
  );
}
