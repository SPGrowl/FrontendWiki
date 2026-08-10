import type { LinkItem } from "@/components/wiki/FastLink/FastLink";

export interface HomePageData {
  fastLinks: LinkItem[];
}

/** 首页内容：快捷链接等（导语卡片已移除） */
export const homePageData: HomePageData = {
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
