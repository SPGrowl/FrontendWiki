import Link from "next/link";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export function WikiLogo() {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-md px-1 py-1",
        "text-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      )}
    >
      <Icon
        icon="vscode-icons:folder-type-js"
        className="size-7 shrink-0"
        aria-hidden
      />
      <span className="hidden truncate text-sm font-semibold tracking-tight sm:inline">
        Frontend Wiki
      </span>
    </Link>
  );
}
