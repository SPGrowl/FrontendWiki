"use client";

import Link from "next/link";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { HeaderNavCategory } from "@/lib/wiki/navigation-data";
import { cn } from "@/lib/utils";

interface WikiNavMenuProps {
  categories: HeaderNavCategory[];
}

export function WikiNavMenu({ categories }: WikiNavMenuProps) {
  const navRef = useRef<HTMLElement>(null);
  const [openPath, setOpenPath] = useState<string | null>(null);

  useEffect(() => {
    if (!openPath) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setOpenPath(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenPath(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPath]);

  function toggleCategory(path: string) {
    setOpenPath((current) => (current === path ? null : path));
  }

  return (
    <nav
      ref={navRef}
      aria-label="Wiki categories"
      className="hidden items-center md:flex"
    >
      {categories.map((category) => {
        const isOpen = openPath === category.path;

        return (
          <div key={category.path} className="relative">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="true"
              aria-controls={`wiki-nav-panel-${category.path}`}
              onClick={() => toggleCategory(category.path)}
              className={cn(
                "inline-flex h-9 items-center gap-1 px-2.5 text-sm transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isOpen
                  ? "border border-border bg-wiki-accent-muted font-medium text-wiki-accent"
                  : "border border-transparent text-foreground/80 hover:bg-muted hover:text-foreground"
              )}
            >
              {category.label}
              <CaretDownIcon
                aria-hidden
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            <div
              id={`wiki-nav-panel-${category.path}`}
              aria-hidden={!isOpen}
              className={cn(
                "absolute top-full left-0 z-50 pt-1",
                "origin-top transition-[opacity,transform] duration-200 ease-out",
                isOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0"
              )}
            >
              <div className="min-w-48 border border-border bg-popover p-3 shadow-md ring-1 ring-foreground/10">
                <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {category.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        tabIndex={isOpen ? undefined : -1}
                        onClick={() => setOpenPath(null)}
                        className={cn(
                          "block rounded-sm px-2 py-1.5 text-sm text-foreground/85",
                          "transition-colors hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
