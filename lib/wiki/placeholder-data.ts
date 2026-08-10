export interface SidebarNavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface SidebarNavGroup {
  title: string;
  items: SidebarNavLink[];
}

export interface WikiCategory {
  content: string;
  href: string;
  label: string;
}

export const sidebarNavGroups: SidebarNavGroup[] = [
  {
    title: "参与贡献",
    items: [
      { label: "编辑指南", href: "/wiki/contribute" },
      { label: "贡献规范", href: "/wiki/guidelines" },
      { label: "待完善词条", href: "/wiki/stubs" },
    ],
  },
  {
    title: "实用工具",
    items: [
      { label: "调色盘", href: "/tools/color-picker" },
      { label: "JS 运行器", href: "/tools/js-runner" },
      { label: "正则测试", href: "/tools/regex" },
      { label: "JSON 格式化", href: "/tools/json-formatter" },
      { label: "全部工具", href: "/tools" },
    ],
  },
  {
    title: "常用文档",
    items: [
      { label: "JavaScript", href: "/entry/javascript" },
      { label: "TypeScript", href: "/entry/typescript" },
      { label: "HTML", href: "/entry/html" },
      { label: "CSS", href: "/entry/css" },
      { label: "React", href: "/entry/react" },
    ],
  },
  {
    title: "外站链接",
    items: [
      { label: "MDN Web Docs", href: "https://developer.mozilla.org", external: true },
      { label: "React", href: "https://react.dev", external: true },
      { label: "Vue.js", href: "https://vuejs.org", external: true },
      { label: "TypeScript", href: "https://www.typescriptlang.org", external: true },
      { label: "Node.js", href: "https://nodejs.org", external: true },
      { label: "Can I Use", href: "https://caniuse.com", external: true },
      { label: "npm", href: "https://www.npmjs.com", external: true },
    ],
  },
];

export const wikiCategories: WikiCategory[] = [
  { content: "首页", href: "/", label: "首页" },
  { content: "原生", href: "/navigation/native", label: "原生" },
  { content: "框架", href: "/navigation/framework", label: "框架" },
  { content: "工具链", href: "/navigation/toolchain", label: "工具链" },
  { content: "JS全栈", href: "/navigation/fullstack", label: "JS全栈" },
];
