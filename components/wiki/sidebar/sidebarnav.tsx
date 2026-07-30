interface NavItem {
    title: string,
    herf: string,
    label: string,
  }
export function SidebarNav({ items }: { items: NavItem[] }) {
    return (
      <nav className="flex flex-col gap-3 px-2 py-2 text-sm">
        {items.map((group) => (
          <section key={group.title} className="flex flex-col gap-1">
            <h3 className="truncate px-2 text-xs font-medium text-sidebar-foreground/70">
              {group.title}
            </h3>
            <a
              href={group.herf}
              className="truncate rounded-none px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {group.label}
            </a>
          </section>
        ))}
      </nav>
    );
  }

