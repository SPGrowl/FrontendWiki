import type { Metadata } from "next";
import Link from "next/link";
import { WikiCard } from "@/components/wiki/card/WikiCard";

export const metadata: Metadata = {
  title: "参与贡献",
};

export default function ContributePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
      <WikiCard padding="lg">
        <h1 className="text-lg font-bold">参与贡献</h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          你可以
          <Link href="/entry/new" className="wiki-link mx-1">
            新建词条
          </Link>
          ，也可以从已有的词条页面进行编辑。查看
          <Link href="/wiki/guidelines" className="wiki-link mx-1">
            编辑规范
          </Link>
          。
        </p>
        <div className="mt-6">
          <Link href="/entry/new" className="wiki-btn-primary">
            新建词条
          </Link>
        </div>
      </WikiCard>
    </div>
  );
}
