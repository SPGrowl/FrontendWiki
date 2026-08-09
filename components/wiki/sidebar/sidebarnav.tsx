"use client";

import Link from "next/link";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import type { SidebarNavGroup } from "@/lib/wiki/placeholder-data";
import { useJsRunner } from "@/components/tools/js-runner/js-runner-context";

const JS_RUNNER_HREF = "/tools/js-runner";

const linkClassName =
  "flex w-full items-center gap-1 truncate rounded-md px-2 py-1.5 text-left text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none";

export function SidebarNav({ groups }: { groups: SidebarNavGroup[] }) {
  const { openRunner } = useJsRunner();

  return (
    <nav className="flex flex-col gap-4 px-2 py-2 text-sm">
      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-1">
          <h3 className="truncate px-2 text-xs font-medium text-sidebar-foreground/70">
            {group.title}
          </h3>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClassName}
                  >
                    <span className="truncate">{item.label}</span>
                    <ArrowSquareOutIcon
                      className="size-3 shrink-0 opacity-60"
                      aria-hidden
                    />
                  </a>
                ) : item.href === JS_RUNNER_HREF ? (
                  <button
                    type="button"
                    onClick={() => openRunner()}
                    className={linkClassName}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link href={item.href} className={linkClassName}>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
