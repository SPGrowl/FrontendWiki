import Link from "next/link";
import { WikiCard } from "./WikiCard";

export function MetaCard() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <WikiCard>
        <div className="text-center font-semibold">Frontend Wiki</div>
        <p className="text-center text-sm leading-relaxed">
          欢迎来到这个完全公开、可自由编辑的
          <span className="wiki-link">wiki</span>
          ，Frontend Wiki。这里致力于收集一切前端的实用知识。任何人都可以为 Wiki
          作出贡献！
        </p>
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
