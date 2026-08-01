import Link from "next/link";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr";
import type { SidebarNavGroup } from "@/lib/wiki/placeholder-data";

const linkClassName =
  "flex items-center gap-1 truncate rounded-none px-2 py-1.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

export function SidebarNav({ groups }: { groups: SidebarNavGroup[] }) {
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
