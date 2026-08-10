"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import type { User } from "@/type/user";

interface UserMenuProps {
  user: Pick<User, "id" | "name" | "avatar">;
}

export function UserMenu({ user }: UserMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    setPending(true);
    setError(null);
    try {
      await logout();
      // 硬跳转，避免 RSC 缓存仍显示已登录态
      window.location.assign("/auth/login");
    } catch {
      setPending(false);
      setError("退出失败，请重试");
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={cn(
          "flex max-w-44 items-center gap-2 rounded-sm px-2 py-1 text-sm font-medium",
          "transition-colors hover:bg-muted hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          open && "bg-muted"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpen((value) => !value);
          setError(null);
        }}
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
        <CaretDownIcon
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full right-0 z-50 mt-1 min-w-36 rounded-none border border-border bg-popover p-1 shadow-md ring-1 ring-foreground/10"
        >
          <Link
            role="menuitem"
            href={`/user/${user.id}`}
            className={cn(
              "flex w-full items-center rounded-none px-2.5 py-1.5 text-sm",
              "transition-colors hover:bg-muted hover:text-foreground"
            )}
            onClick={() => setOpen(false)}
          >
            个人主页
          </Link>
          <Button
            type="button"
            role="menuitem"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            disabled={pending}
            onClick={() => {
              void handleLogout();
            }}
          >
            {pending ? "退出中…" : "退出登录"}
          </Button>
          {error ? (
            <p className="px-2.5 py-1 text-xs text-destructive">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
