import Link from "next/link";
import { WikiCard } from "./WikiCard";

export function MetaCard() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <WikiCard>
        <div className="text-center font-semibold">Frontend Wiki</div>
        <p className="text-center text-sm leading-relaxed">
          欢迎来到这个完全公开、可自由编辑的
          <a href="" className="wiki-link">
            wiki
          </a>
          , Frontend Wiki。这里致力于收集一切前端的实用知识。任何人都可以为 Wiki
          作出贡献！
        </p>
        <p className="mt-4 text-center text-sm">
          <strong className="text-wiki-link">...</strong> 词条
          <span className="text-muted-foreground"> • </span>
          <strong className="text-wiki-link">...</strong> 文件
          <span className="text-muted-foreground"> • </span>
          <strong className="text-wiki-link">...</strong> 活跃用户
        </p>
      </WikiCard>

      <WikiCard padding="md">
        <h3 className="text-base font-bold">参与 Wiki</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          我们欢迎任何人为 Frontend Wiki 作出贡献……
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/wiki/contribute" className="wiki-btn-primary flex-1">
            开始贡献
          </Link>
          <Link href="/wiki/help" className="wiki-btn-secondary flex-1">
            仍有疑问？
          </Link>
        </div>
      </WikiCard>

      <WikiCard padding="md">
        <h3 className="text-base font-bold">最近更新</h3>
        <ul className="mt-3 flex flex-col gap-3 text-sm leading-relaxed">
          <li>
            <time className="font-semibold">2026年6月28日</time>
            <span className="text-muted-foreground"> - </span>
            <span>UserTeaSummer 加入了 wiki。</span>
          </li>
        </ul>
      </WikiCard>
    </div>
  );
}
