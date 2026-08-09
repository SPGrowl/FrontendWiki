import Link from "next/link";
import { cn } from "@/lib/utils";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import type { EntryLink, RelatedEntryies } from "@/type/entry";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </div>
  );
}

function EntryTreeLink({
  href,
  children,
  current = false,
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
}) {
  if (current) {
    return (
      <span
        aria-current="page"
        className="block rounded-md bg-wiki-accent-muted px-2 py-1 text-sm font-semibold text-wiki-accent"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="block rounded-md px-2 py-1 text-sm text-wiki-link transition-colors hover:bg-muted"
    >
      {children}
    </Link>
  );
}

function EntryTreeSection({
  label,
  items,
  currentEntryId,
  indent = false,
}: {
  label: string;
  items: EntryLink[];
  currentEntryId: string;
  indent?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <SectionLabel>{label}</SectionLabel>
      <div className={cn(indent && "space-y-0.5 pl-3")}>
        {items.map((item) => (
          <EntryTreeLink
            key={item.id}
            href={item.href}
            current={item.entryId === currentEntryId}
          >
            {item.name}
          </EntryTreeLink>
        ))}
      </div>
    </section>
  );
}

interface EntryTreeProps {
  currentEntryId: string;
  relatedEntries: RelatedEntryies;
}

export function EntryTree({ currentEntryId, relatedEntries }: EntryTreeProps) {
  const { parentEntry, SiblingEntry, LinkedEntries } = relatedEntries;
  const siblings = SiblingEntry ?? [];
  const children = LinkedEntries ?? [];

  const hasContent =
    parentEntry !== null || siblings.length > 0 || children.length > 0;

  if (!hasContent) return null;

  return (
    <WikiCard padding="md" className="sticky top-20">
      <div className="space-y-4">
        {parentEntry && (
          <section>
            <SectionLabel>上一级</SectionLabel>
            <EntryTreeLink href={parentEntry.href}>{parentEntry.name}</EntryTreeLink>
          </section>
        )}

        <EntryTreeSection
          label="同级"
          items={siblings}
          currentEntryId={currentEntryId}
          indent
        />

        <EntryTreeSection
          label="下一级"
          items={children}
          currentEntryId={currentEntryId}
          indent
        />
      </div>
    </WikiCard>
  );
}
