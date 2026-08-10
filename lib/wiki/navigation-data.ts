import type { LinkItem } from "@/components/wiki/FastLink/FastLink";

export interface IntroCard {
  title: string;
  description: string;
  linkedTerm?: { href: string; label: string };
}

export interface NavigationPageData {
  path: string;
  categoryLabel: string;
  introductions: [IntroCard, IntroCard];
  fastLinks: LinkItem[];
}

export const navigationPages: Record<string, NavigationPageData> = {
  home: {
    path: "home",
    categoryLabel: "首页",
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
  },

  native: {
    path: "native",
    categoryLabel: "原生",
    introductions: [
      {
        title: "HTML",
        linkedTerm: { href: "/entry/html", label: "HTML" },
        description:
          "（超文本标记语言）是构建网页结构的基础语言，通过语义化标签描述文档内容与层次关系。合理的 HTML 结构不仅决定页面骨架，也直接影响 SEO、无障碍访问（a11y）与可维护性，是每位前端开发者的起点。",
      },
      {
        title: "CSS",
        linkedTerm: { href: "/entry/css", label: "CSS" },
        description:
          "（层叠样式表）负责网页的视觉呈现与布局控制。从盒模型、Flexbox、Grid 到动画与响应式设计，CSS 让静态 markup 变为可交互、可适配多终端的界面，是现代 UI 实现的核心手段之一。",
      },
    ],
    fastLinks: [
      { icon: "devicon:html5", content: "HTML", href: "/entry/html" },
      { icon: "devicon:css3", content: "CSS", href: "/entry/css" },
      { icon: "devicon:javascript", content: "JavaScript", href: "/entry/javascript" },
      { icon: "devicon:typescript", content: "TypeScript", href: "/entry/typescript" },
      { icon: "logos:chrome", content: "Web API", href: "/entry/web-api" },
      { icon: "mdi:sass", content: "sass", href: "/entry/sass" },
      { icon: "material-symbols:draw", content: "Canvas", href: "/entry/Canvas" },
      { icon: "devicon:wasm", content: "WASM", href: "/entry/WASM" },
      { icon:"devicon:tailwindcss", content: "Tailwind CSS", href: "/entry/tailwind-css"}
    ],
  },

  framework: {
    path: "framework",
    categoryLabel: "框架",
    introductions: [
      {
        title: "React",
        linkedTerm: { href: "/entry/react", label: "React" },
        description:
          "由 Meta 维护的声明式 UI 库，以组件化与单向数据流为核心思想。通过 Virtual DOM 与 Hooks 等机制，React 在复杂交互场景下仍保持可预测的状态管理，并生态庞大，是当今最流行的前端框架之一。",
      },
      {
        title: "Vue.js",
        linkedTerm: { href: "/entry/vue", label: "Vue.js" },
        description:
          "渐进式 JavaScript 框架，以易上手、灵活组合著称。模板语法直观，响应式系统基于 Proxy，配合 Vue Router 与 Pinia 可平滑扩展为完整 SPA 或 SSR 应用，在亚洲开发者社区尤为流行。",
      },
    ],
    fastLinks: [
      { icon: "devicon:react", content: "React", href: "/entry/react" },
      { icon: "devicon:vuejs", content: "Vue.js", href: "/entry/vue" },
      { icon: "devicon:angularjs", content: "Angular", href: "/entry/angular" },
      { icon: "devicon:nextjs", content: "Next.js", href: "/entry/nextjs" },
      { icon: "devicon:nuxtjs", content: "Nuxt", href: "/entry/nuxt" },
      { icon: "devicon:svelte", content: "Svelte", href: "/entry/svelte" },
      { icon: "devicon:solidjs", content: "SolidJS", href: "/entry/solidjs" },
      { icon: "devicon:remix", content: "Remix", href: "/entry/remix" },
    ],
  },

  toolchain: {
    path: "toolchain",
    categoryLabel: "工具链",
    introductions: [
      {
        title: "Vite",
        linkedTerm: { href: "/entry/vite", label: "Vite" },
        description:
          "新一代前端构建工具，开发阶段基于原生 ES Module 实现极速冷启动与 HMR，生产环境使用 Rollup 打包。配置简洁、插件生态活跃，已成为 Vue、React 等项目的首选脚手架方案之一。",
      },
      {
        title: "Webpack",
        linkedTerm: { href: "/entry/webpack", label: "Webpack" },
        description:
          "模块打包器领域的经典方案，通过 Loader 与 Plugin 机制将 JS、CSS、图片等各类资源统一纳入依赖图管理。虽然配置相对繁琐，但在大型遗留项目与企业级工程化中仍广泛存在。",
      },
    ],
    fastLinks: [
      { icon: "devicon:vitejs", content: "Vite", href: "/entry/vite" },
      { icon: "devicon:webpack", content: "Webpack", href: "/entry/webpack" },
      { icon: "devicon:rollup", content: "Rollup", href: "/entry/rollup" },
      { icon: "material-icon-theme:esbuild", content: "esbuild", href: "/entry/esbuild" },
      { icon: "devicon:eslint", content: "ESLint", href: "/entry/eslint" },
      { icon: "material-icon-theme:prettier", content: "Prettier", href: "/entry/prettier" },
      { icon: "devicon:pnpm", content: "pnpm", href: "/entry/pnpm" },
      { icon: "devicon:npm", content: "npm", href: "/entry/npm" },
      { icon: "mdi:lightning-bolt", content: "Turbopack", href: "/entry/turbopack" },
    ],
  },

  fullstack: {
    path: "fullstack",
    categoryLabel: "JS全栈",
    introductions: [
      {
        title: "Node.js",
        linkedTerm: { href: "/entry/node-js", label: "Node.js" },
        description:
          "基于 Chrome V8 引擎的 JavaScript 运行时，使 JS 脱离浏览器运行在服务器端。事件驱动、非阻塞 I/O 模型适合高并发场景，配合 Express、Fastify 等框架可快速搭建 API 与 BFF 层。",
      },
      {
        title: "Next.js",
        linkedTerm: { href: "/entry/nextjs", label: "Next.js" },
        description:
          "基于 React 的全栈框架，内置 SSR、SSG、App Router 与 API Routes。支持服务端组件、流式渲染与边缘部署，让同一套技术栈覆盖从页面渲染到后端接口的完整开发流程。",
      },
    ],
    fastLinks: [
      { icon: "devicon:nodejs", content: "Node.js", href: "/entry/node-js" },
      { icon: "devicon:nextjs", content: "Next.js", href: "/entry/nextjs" },
      { icon: "devicon:express", content: "Express", href: "/entry/express" },
      { icon: "devicon:nestjs", content: "NestJS", href: "/entry/nestjs" },
      { icon: "devicon:prisma", content: "Prisma", href: "/entry/prisma" },
      { icon: "vscode-icons:file-type-mongo", content: "MongoDB", href: "/entry/MongoDB" },
      { icon: "devicon:denojs", content: "Deno", href: "/entry/deno" },
      { icon: "devicon:bun", content: "Bun", href: "/entry/bun" },
    ],
  },
};

export const navigationPaths = Object.keys(navigationPages);

export function getNavigationPage(path: string): NavigationPageData | null {
  return navigationPages[path] ?? null;
}

export function getCategoryLabelByPath(path: string): string | null {
  return navigationPages[path]?.categoryLabel ?? null;
}
