import { EntryContent } from "@/components/wiki/entry/EntryContent";

interface MarkdownSampleProps {
  source: string;
}

export function MarkdownSample({ source }: MarkdownSampleProps) {
  return (
    <div className="my-4 grid gap-3 lg:grid-cols-2">
      <figure className="min-w-0">
        <figcaption className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          语法
        </figcaption>
        <pre className="overflow-x-auto rounded-md border border-border bg-wiki-code-bg p-3 text-[13px] leading-relaxed text-foreground">
          <code>{source}</code>
        </pre>
      </figure>
      <figure className="min-w-0">
        <figcaption className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          预览
        </figcaption>
        <div className="rounded-md border border-border bg-background px-4 py-3">
          <EntryContent content={source} />
        </div>
      </figure>
    </div>
  );
}
