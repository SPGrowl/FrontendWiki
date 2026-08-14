import Link from "next/link";
import { getWikiStats } from "@/lib/db/stats";
import { WikiCard } from "./WikiCard";

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 text-center">
      <div className="text-lg font-semibold tabular-nums tracking-tight">
        {value.toLocaleString("zh-CN")}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export async function MetaCard() {
  const stats = await getWikiStats();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <WikiCard>
        <div className="text-center font-semibold">Frontend Wiki</div>
        <p className="mt-2 text-center text-sm leading-relaxed">
          欢迎来到这个完全公开、可自由编辑的
          <span className="wiki-link">wiki</span>
          ，Frontend Wiki。这里致力于收集一切前端的实用知识。任何人都可以为 Wiki
          作出贡献！
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
          <StatItem label="词条" value={stats.entryCount} />
          <StatItem label="博客" value={stats.blogCount} />
          <StatItem label="用户" value={stats.userCount} />
        </div>
      </WikiCard>

      <WikiCard padding="md">
        <h3 className="text-base font-bold">参与 Wiki</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          我们欢迎任何人为 Frontend Wiki 作出贡献。登录后即可编辑已发布词条或创建新词条。
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/entry/new" className="wiki-btn-primary flex-1 text-center">
            开始贡献
          </Link>
          <Link
            href="/auth/login"
            className="wiki-btn-secondary flex-1 text-center"
          >
            登录
          </Link>
        </div>
      </WikiCard>
    </div>
  );
}
