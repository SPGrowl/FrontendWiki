import Link from "next/link";
import { cn } from "@/lib/utils";
import { WikiCard } from "@/components/wiki/card/WikiCard";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </div>
  );
}

function EntryLink({
  href,
  children,
  current = false,
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
}) {
  if (current) {
    return (
      <span
        aria-current="page"
        className="block rounded-sm bg-[#dbeafe] px-2 py-1 text-sm font-semibold text-[#1d4ed8]"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="block rounded-sm px-2 py-1 text-sm text-[#2e7bd6] hover:bg-[#e6eff4]"
    >
      {children}
    </Link>
  );
}

//TODO:待修改：移除硬编码，添加参数
export function EntryTree() {
  return (
    <WikiCard padding="md" className="sticky top-20">
      <div className="space-y-4">
        <section>
          <SectionLabel>上一级</SectionLabel>
          <EntryLink href="/entry/scripting-languages">脚本语言</EntryLink>
        </section>

        <section>
          <SectionLabel>同级</SectionLabel>
          <div className={cn("space-y-0.5 pl-3")}>
            <EntryLink href="/entry/javascript" current>
              Javascript
            </EntryLink>
            <EntryLink href="/entry/python">Python</EntryLink>
            <EntryLink href="/entry/typescript">TypeScript</EntryLink>
          </div>
        </section>

        <section>
          <SectionLabel>下一级</SectionLabel>
          <div className={cn("space-y-0.5 pl-3")}>
            <EntryLink href="/entry/ecmascript">ECMAScript</EntryLink>
            <EntryLink href="/entry/node-js">Node.js</EntryLink>
            <EntryLink href="/entry/v8">V8 引擎</EntryLink>
          </div>
        </section>
      </div>
    </WikiCard>
  );
}
