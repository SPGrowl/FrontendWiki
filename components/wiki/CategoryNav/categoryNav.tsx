import Link from "next/link";
import { cn } from "@/lib/utils";

interface Category {
  content: string;
  href: string;
  label: string;
  icon?: string;
}

export function CategoryNav({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug: string;
}) {
  return (
    <nav
      aria-label="Wiki categories"
      className="flex gap-1 rounded-lg border border-border/60 bg-card p-1 shadow-sm"
    >
      {categories.map((cat) => {
        const isActive = cat.content === activeSlug;

        return (
          <Link
            key={cat.content}
            href={cat.href}
            aria-current={isActive ? "page" : undefined}
            data-active={isActive}
            className={cn(
              "flex-1 rounded-md py-2.5 text-center text-sm transition-colors",
              "text-foreground/75 hover:bg-wiki-accent-muted hover:text-wiki-accent",
              "data-[active=true]:bg-wiki-accent-muted data-[active=true]:font-medium data-[active=true]:text-wiki-accent"
            )}
          >
            {cat.label}
          </Link>
        );
      })}
    </nav>
  );
}