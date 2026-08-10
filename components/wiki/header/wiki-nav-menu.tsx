"use client";

import Link from "next/link";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** 顶栏词条导航：分类只负责展开，子项才跳转词条 */
const HEADER_NAV = [
  {
    id: "native",
    name: "原生",
    children: [
      { name: "HTML", href: "/entry/html" },
      { name: "CSS", href: "/entry/CSS" },
      { name: "JavaScript", href: "/entry/js" },
      { name: "TypeScript", href: "/entry/typescript" },
      { name: "Web API", href: "/entry/web-api" },
      { name: "sass", href: "/entry/sass" },
      { name: "Canvas", href: "/entry/Canvas" },
      { name: "WASM", href: "/entry/WASM" },
      { name: "Tailwind CSS", href: "/entry/tailwind-css" },
    ],
  },
  {
    id: "framework",
    name: "框架",
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
    id: "toolchain",
    name: "工具链",
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
    id: "fullstack",
    name: "JS全栈",
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
  const navRef = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!openId) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setOpenId(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenId(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openId]);

  function toggleCategory(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <nav
      ref={navRef}
      aria-label="词条分类导航"
      className="hidden items-center md:flex"
    >
      {HEADER_NAV.map((category) => {
        const isOpen = openId === category.id;
        const panelId = `wiki-nav-panel-${category.id}`;

        return (
          <div key={category.id} className="relative">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="true"
              aria-controls={panelId}
              onClick={() => toggleCategory(category.id)}
              className={cn(
                "inline-flex h-9 items-center gap-1 border px-2.5 text-sm transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                isOpen
                  ? "border-border bg-muted font-medium text-foreground"
                  : "border-transparent text-foreground/80 hover:bg-muted hover:text-foreground"
              )}
            >
              {category.name}
              <CaretDownIcon
                aria-hidden
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>

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
                        onClick={() => setOpenId(null)}
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
