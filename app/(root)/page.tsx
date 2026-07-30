import { NewsCard,resource } from "@/components/wiki/card/NewsCard";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import Introduction from "@/components/wiki/card/inroduction";
const newsResource:resource[]=[
  {
    title: "尤雨溪看懵了！Vue 竟然能在终端跑 3D！",
    herf: "/wiki/vue-terminal-3d",
    type: "news",
    imgURL:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
    creator: "前端周刊",
    updateTime: "2026-07-25",
  },
  {
    title: "React 19 正式版发布：并发渲染与 Server Actions 再进化",
    herf: "/wiki/react-19-release",
    type: "news",
    imgURL:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    creator: "React 中文社区",
    updateTime: "2026-07-24",
  },
  // {
  //   title: "Next.js 15 App Router 性能优化实战指南",
  //   herf: "/wiki/nextjs-15-performance",
  //   type: "news",
  //   imgURL:
  //     "https://images.unsplash.com/photo-1461740680684-ccdcc098f2d0?auto=format&fit=crop&w=800&q=80",
  //   creator: "Frontend Wiki",
  //   updateTime: "2026-07-23",
  // },
  // {
  //   title: "TypeScript 5.8 新特性速览：更严格的类型推断",
  //   herf: "/wiki/typescript-5-8",
  //   type: "news",
  //   imgURL:
  //     "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80",
  //   creator: "TS 爱好者",
  //   updateTime: "2026-07-22",
  // },
]
export default function RootPage() {
  return (<>
  <div className="flex flex-col gap-2  ">
  <NewsCard  resources={newsResource}  />
  <Introduction/>
  </div>
  </>);
}
