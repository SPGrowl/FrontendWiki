"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import type { User } from "@/type/user";

interface UserMenuProps {
  user: Pick<User, "id" | "name" | "avatar">;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await logout();
      router.push("/auth/login");
      router.refresh();
    } catch {
      setPending(false);
    }
  }

  return (
    <div className="group relative">
      <Link
        href={`/user/${user.id}`}
        className={cn(
          "flex max-w-40 items-center gap-2 rounded-sm px-2 py-1 text-sm font-medium",
          "transition-colors hover:bg-muted hover:text-foreground"
        )}
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar}
            alt=""
            className="size-6 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold uppercase"
          >
            {user.name.slice(0, 1)}
          </span>
        )}
        <span className="truncate">{user.name}</span>
      </Link>

      <div
        className={cn(
          "absolute top-full right-0 z-50 pt-1",
          "pointer-events-none opacity-0 transition-opacity duration-150",
          "group-hover:pointer-events-auto group-hover:opacity-100",
          "group-focus-within:pointer-events-auto group-focus-within:opacity-100"
        )}
      >
        <div className="min-w-28 rounded-none border border-border bg-popover p-1 shadow-md ring-1 ring-foreground/10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            disabled={pending}
            onClick={handleLogout}
          >
            {pending ? "退出中…" : "退出登录"}
          </Button>
        </div>
      </div>
    </div>
  );
}
