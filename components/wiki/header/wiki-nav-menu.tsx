"use client";

import Link from "next/link";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** 顶栏词条导航：分类只负责展开，子项才跳转词条 */
const HEADER_NAV = [
  {
    id: "html-css",
    name: "HTML/CSS",
    children: [
      { name: "HTML", href: "/entry/html" },
      { name: "选择器与特异性", href: "/entry/css/selectors" },
      { name: "盒模型", href: "/entry/css/box-model" },
      { name: "布局与定位", href: "/entry/css/layout" },
      { name: "过渡与动画", href: "/entry/css/animation" },
      { name: "实践", href: "/entry/css/howto" },
    ],
  },
  {
    id: "js-ts",
    name: "JS/TS",
    children: [
      { name: "基础语法", href: "/entry/js/syntax" },
      { name: "标准库", href: "/entry/js/标准库" },
      { name: "函数与对象", href: "/entry/js/functions" },
      { name: "原型与继承", href: "/entry/js/prototype" },
      { name: "高阶技巧", href: "/entry/js/advanced" },
      { name: "TypeScript", href: "/entry/typescript" },
    ],
  },
  {
    id: "framework",
    name: "框架",
    children: [
      { name: "React", href: "/entry/react" },
      { name: "Vue.js", href: "/entry/vue" },
      { name: "Angular", href: "/entry/angular" },
      { name: "Svelte", href: "/entry/svelte" },
      { name: "SolidJS", href: "/entry/solidjs" },
      { name: "React Native", href: "/entry/react-native" },
      { name: "Electron", href: "/entry/electron" },
      { name: "UniApp", href: "/entry/uniapp" },
      { name: "Tauri", href: "/entry/tauri" },
    ],
  },
  {
    id: "fullstack",
    name: "全栈",
    children: [
      { name: "Next.js", href: "/entry/nextjs" },
      { name: "Nuxt", href: "/entry/nuxt" },
      { name: "Node.js", href: "/entry/node-js" },
      { name: "Express", href: "/entry/express" },
      { name: "NestJS", href: "/entry/nestjs" },
      { name: "Remix", href: "/entry/remix" },
      { name: "Deno", href: "/entry/deno" },
      { name: "Bun", href: "/entry/bun" },
    ],
  },
  {
    id: "general",
    name: "综合",
    children: [
      { name: "浏览器原理", href: "/entry/browser" },
      { name: "工具链", href: "/entry/toolchain" },
      { name: "Web API", href: "/entry/web-api" },
      { name: "HTTP", href: "/entry/http" },
      { name: "Canvas", href: "/entry/Canvas" },
      { name: "WASM", href: "/entry/WASM" },
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
      className="relative hidden items-center md:flex"
    >
      {HEADER_NAV.map((category) => {
        const isOpen = openId === category.id;

        return (
          <button
            key={category.id}
            type="button"
            aria-expanded={isOpen}
            aria-haspopup="true"
            aria-controls={`wiki-nav-panel-${category.id}`}
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
        );
      })}

      {HEADER_NAV.map((category) => {
        const isOpen = openId === category.id;
        const panelId = `wiki-nav-panel-${category.id}`;

        return (
          <div
            key={panelId}
            id={panelId}
            aria-hidden={!isOpen}
            className={cn(
              "absolute top-full right-0 left-0 z-50 pt-1",
              "origin-top transition-[opacity,transform] duration-200 ease-out",
              isOpen
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-1 opacity-0"
            )}
          >
            <div className="border border-border bg-popover p-3 shadow-md ring-1 ring-foreground/10">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {category.children.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      tabIndex={isOpen ? undefined : -1}
                      onClick={() => setOpenId(null)}
                      className={cn(
                        "block whitespace-nowrap rounded-sm px-2 py-1.5 text-sm text-foreground/85",
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
        );
      })}
    </nav>
  );
}
