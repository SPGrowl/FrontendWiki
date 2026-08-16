import Link from "next/link";
import { WikiCard } from "@/components/wiki/card/WikiCard";

interface SiteUpdateItem {
  date: string;
  title: string;
  detail: string;
  href?: string;
}

/** 站点功能与约定变更（硬编码，非词条编辑记录） */
const SITE_UPDATES: SiteUpdateItem[] = [
  {
    date: "2026-08-16",
    title: "词条链接悬停预览",
    detail:
      "正文里的 /entry/… 悬停可看标题和摘要。请写完整路径，不要用 # 锚点当跳转。",
    href: "/wiki/guidelines",
  },
  {
    date: "2026-08-15",
    title: "阅读路径与编辑规范",
    detail:
      "词条按规范路径直查；改上级会更新子词条地址。规范页补充了语法对照、标题层级和图片缩放。",
    href: "/wiki/guidelines",
  },
  {
    date: "2026-08-14",
    title: "图库插图与等比缩放",
    detail:
      "编辑器可从图库插入配图。一张图独占一行，用 #scale=1～100 控制相对栏宽。",
    href: "/wiki/guidelines#images",
  },
  {
    date: "2026-08-14",
    title: "中文路径不再二次编码",
    detail:
      "词条地址使用明文 /entry/…，中文别名可直接写在链接里。",
  },
];

function formatUpdateDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
  });
}

export function SiteUpdatesCard() {
  return (
    <WikiCard padding="md" className="mt-auto">
      <h3 className="text-base font-bold">近期更新</h3>
      <p className="mt-1 text-xs text-muted-foreground">站点功能与编辑约定</p>
      <ol className="mt-3 space-y-3">
        {SITE_UPDATES.map((item) => (
          <li key={`${item.date}-${item.title}`} className="text-sm">
            <div className="flex items-baseline gap-2">
              <time
                dateTime={item.date}
                className="shrink-0 text-xs font-medium text-muted-foreground"
              >
                {formatUpdateDate(item.date)}
              </time>
              {item.href ? (
                <Link
                  href={item.href}
                  className="min-w-0 font-medium text-wiki-link hover:underline"
                >
                  {item.title}
                </Link>
              ) : (
                <span className="min-w-0 font-medium">{item.title}</span>
              )}
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {item.detail}
            </p>
          </li>
        ))}
      </ol>
    </WikiCard>
  );
}
