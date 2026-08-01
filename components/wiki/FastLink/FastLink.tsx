import Link from "next/link";
import { Icon } from "@iconify/react";
import { WikiCard } from "../card/WikiCard";
import { cn } from "@/lib/utils";

export interface LinkItem {
  icon: string;
  content: string;
  href: string;
}

interface FastLinkProps {
  items: LinkItem[];
  className?: string;
}

export function FastLink({ items, className }: FastLinkProps) {
  if (items.length === 0) return null;

  return (
    <WikiCard padding="md" className={className}>
      <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={item.content}
            className={cn(
              "group flex flex-col items-center gap-1.5 rounded-sm p-2",
              "transition-colors hover:bg-[#e6eff4]"
            )}
          >
            <Icon
              icon={item.icon}
              className="size-10 transition-transform group-hover:scale-105"
              aria-hidden
            />
            <span className="w-full truncate text-center text-xs text-[#2e7bd6] group-hover:underline">
              {item.content}
            </span>
          </Link>
        ))}
      </div>
    </WikiCard>
  );
}
