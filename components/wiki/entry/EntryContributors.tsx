import Link from "next/link";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { UserAvatar } from "@/components/wiki/user/user-avatar";
import type { Contributor } from "@/type/entry";

const MAX_VISIBLE = 10;

interface EntryContributorsProps {
  contributors: Contributor[];
}

export function EntryContributors({ contributors }: EntryContributorsProps) {
  const visible = contributors.slice(0, MAX_VISIBLE);
  if (visible.length === 0) return null;

  return (
    <WikiCard padding="md" className="shrink-0">
      <div className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        贡献者
      </div>
      <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
        {visible.map((contributor) => (
          <li key={contributor.id} className="min-w-0">
            <Link
              href={`/user/${contributor.id}`}
              title={contributor.name}
              className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm text-wiki-link transition-colors hover:bg-muted"
            >
              <UserAvatar
                name={contributor.name}
                avatar={contributor.avatar}
                size="xs"
              />
              <span className="min-w-0 truncate">{contributor.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </WikiCard>
  );
}
