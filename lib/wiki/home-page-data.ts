import type { LinkItem } from "@/components/wiki/FastLink/FastLink";

export interface IntroCard {
  title: string;
  description: string;
  linkedTerm?: { href: string; label: string };
}

export interface HomePageData {
  introductions: [IntroCard, IntroCard];
  fastLinks: LinkItem[];
}

/** 首页内容：词条入口与导语（分类导航页已移除） */
export const homePageData: HomePageData = {
  introductions: [
    {
      title: "前端",
      description:
        "前端是创建网页或网络应用程序图形用户界面的技术领域，负责实现用户直接看到并与之交互的部分。其基础由三种核心技术构成：HTML 定义内容和结构，CSS 控制视觉表现与布局，JavaScript 处理交互逻辑与动态行为。现代前端已发展为高度工程化的学科，普遍采用组件化架构、单页应用（SPA）和渐进式网页应用（PWA）等模式。",
    },
    {
      title: "JavaScript",
      linkedTerm: { href: "/entry/javascript", label: "JavaScript" },
      description:
        "（简称 JS）是一种高级、解释型、多范式的编程语言，由网景公司的布兰登·艾克于 1995 年创造。其语法标准称为 ECMAScript，具备动态类型、基于原型的对象模型和一等函数，是万维网的核心技术之一，也是 Frontend Wiki 的重点收录方向。",
    },
  ],
  fastLinks: [
    { icon: "devicon:javascript", content: "JavaScript", href: "/entry/javascript" },
    { icon: "devicon:typescript", content: "TypeScript", href: "/entry/typescript" },
    { icon: "devicon:react", content: "React", href: "/entry/react" },
    { icon: "devicon:vuejs", content: "Vue.js", href: "/entry/vue" },
    { icon: "devicon:nextjs", content: "Next.js", href: "/entry/nextjs" },
    { icon: "devicon:nodejs", content: "Node.js", href: "/entry/node-js" },
    { icon: "devicon:html5", content: "HTML", href: "/entry/html" },
    { icon: "devicon:css3", content: "CSS", href: "/entry/css" },
    { icon: "devicon:webpack", content: "Webpack", href: "/entry/webpack" },
    { icon: "devicon:vitejs", content: "Vite", href: "/entry/vite" },
  ],
};
