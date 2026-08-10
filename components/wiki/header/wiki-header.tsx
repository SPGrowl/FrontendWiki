import Link from "next/link";
import { UserMenu } from "@/components/wiki/header/user-menu";
import { WikiLogo } from "@/components/wiki/header/wiki-logo";
import { WikiNavMenu } from "@/components/wiki/header/wiki-nav-menu";
import { WikiSearch } from "@/components/wiki/header/wiki-search";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { cn } from "@/lib/utils";

export async function WikiHeader() {
  const user = await getCurrentUser();

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 md:gap-4 md:px-6">
      <div className="flex min-w-0 items-center gap-1 md:gap-2">
        <WikiLogo />
        <WikiNavMenu />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3 md:gap-4">
        <WikiSearch />
        {user ? (
          <UserMenu user={user} />
        ) : (
          <Link
            href="/auth/login"
            className={cn(
              "rounded-sm px-2 py-1 text-sm text-muted-foreground",
              "transition-colors hover:bg-muted hover:text-foreground"
            )}
          >
            登录
          </Link>
        )}
      </div>
    </header>
  );
}
