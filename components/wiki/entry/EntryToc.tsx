"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/wiki/extract-headings";

interface EntryTocProps {
  headings: TocItem[];
}

export function EntryToc({ headings }: EntryTocProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );

          // 将最靠上的标题保存为激活标题
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    // 卸载组件时断开观察器
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-1 text-sm">
      {headings.map(({ id, text, depth }, index) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(event) => {
            event.preventDefault();
            //根据ID滚动到目标标题位置
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            setActiveId(id);
          }}
          className={cn(
            "block py-0.5 transition-colors",
            depth === 3 && "pl-4",
            depth === 4 && "pl-8",
            activeId === id
              ? "font-medium text-wiki-link"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {index + 1} {text}
        </a>
      ))}
    </nav>
  );
}
