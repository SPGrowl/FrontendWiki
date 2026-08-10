"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** 顶栏导航配置：改展示名或链接只改这里 */
const HEADER_NAV = [
  {
    name: "原生",
    href: "/navigation/native",
    children: [
      { name: "HTML", href: "/entry/html" },
      { name: "CSS", href: "/entry/css" },
      { name: "JavaScript", href: "/entry/javascript" },
      { name: "TypeScript", href: "/entry/typescript" },
      { name: "Web API", href: "/entry/web-api" },
      { name: "sass", href: "/entry/sass" },
      { name: "Canvas", href: "/entry/Canvas" },
      { name: "WASM", href: "/entry/WASM" },
      { name: "Tailwind CSS", href: "/entry/tailwind-css" },
    ],
  },
  {
    name: "框架",
    href: "/navigation/framework",
    children: [
      { name: "React", href: "/entry/react" },
      { name: "Vue.js", href: "/entry/vue" },
      { name: "Angular", href: "/entry/angular" },
      { name: "Next.js", href: "/entry/nextjs" },
      { name: "Nuxt", href: "/entry/nuxt" },
      { name: "Svelte", href: "/entry/svelte" },
      { name: "SolidJS", href: "/entry/solidjs" },
      { name: "Remix", href: "/entry/remix" },
    ],
  },
  {
    name: "工具链",
    href: "/navigation/toolchain",
    children: [
      { name: "Vite", href: "/entry/vite" },
      { name: "Webpack", href: "/entry/webpack" },
      { name: "Rollup", href: "/entry/rollup" },
      { name: "esbuild", href: "/entry/esbuild" },
      { name: "ESLint", href: "/entry/eslint" },
      { name: "Prettier", href: "/entry/prettier" },
      { name: "pnpm", href: "/entry/pnpm" },
      { name: "npm", href: "/entry/npm" },
      { name: "Turbopack", href: "/entry/turbopack" },
    ],
  },
  {
    name: "JS全栈",
    href: "/navigation/fullstack",
    children: [
      { name: "Node.js", href: "/entry/node-js" },
      { name: "Next.js", href: "/entry/nextjs" },
      { name: "Express", href: "/entry/express" },
      { name: "NestJS", href: "/entry/nestjs" },
      { name: "Prisma", href: "/entry/prisma" },
      { name: "MongoDB", href: "/entry/MongoDB" },
      { name: "Deno", href: "/entry/deno" },
      { name: "Bun", href: "/entry/bun" },
    ],
  },
] as const;

export function WikiNavMenu() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [openHref, setOpenHref] = useState<string | null>(null);

  useEffect(() => {
    if (!openHref) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setOpenHref(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenHref(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openHref]);

  function toggleCategory(href: string) {
    setOpenHref((current) => (current === href ? null : href));
  }

  return (
    <nav
      ref={navRef}
      aria-label="Wiki categories"
      className="hidden items-center md:flex"
    >
      {HEADER_NAV.map((category) => {
        const isOpen = openHref === category.href;
        const isActive =
          pathname === category.href ||
          pathname.startsWith(`${category.href}/`);
        const panelId = `wiki-nav-panel-${category.href}`;

        return (
          <div key={category.href} className="relative">
            <div
              className={cn(
                "inline-flex h-9 items-stretch overflow-hidden border text-sm transition-colors",
                isOpen || isActive
                  ? "border-border bg-wiki-accent-muted font-medium text-wiki-accent"
                  : "border-transparent text-foreground/80 hover:bg-muted hover:text-foreground"
              )}
            >
              <Link
                href={category.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setOpenHref(null)}
                className={cn(
                  "inline-flex items-center px-2.5",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                )}
              >
                {category.name}
              </Link>
              <button
                type="button"
                aria-label={`${category.name}子菜单`}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls={panelId}
                onClick={() => toggleCategory(category.href)}
                className={cn(
                  "inline-flex items-center border-l border-transparent px-1.5",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  (isOpen || isActive) && "border-border/60"
                )}
              >
                <CaretDownIcon
                  aria-hidden
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
            </div>

            <div
              id={panelId}
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
                  {category.children.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        tabIndex={isOpen ? undefined : -1}
                        onClick={() => setOpenHref(null)}
                        className={cn(
                          "block rounded-sm px-2 py-1.5 text-sm text-foreground/85",
                          "transition-colors hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {link.name}
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
