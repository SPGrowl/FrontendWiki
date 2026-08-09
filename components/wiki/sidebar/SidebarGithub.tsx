import { ArrowSquareOutIcon, GithubLogoIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const REPO_URL = "https://github.com/SPGrowl/FrontendWiki";

export function SidebarGithub() {
  return (
    <div className="shrink-0 border-t border-sidebar-border p-2">
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-2",
          "text-sidebar-foreground transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
        )}
      >
        <GithubLogoIcon className="size-4 shrink-0" weight="fill" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium">Frontend Wiki</span>
          <span className="block truncate text-[10px] text-sidebar-foreground/65">
            SPGrowl/FrontendWiki
          </span>
        </span>
        <ArrowSquareOutIcon
          className="size-3 shrink-0 opacity-60"
          aria-hidden
        />
      </a>
    </div>
  );
}
