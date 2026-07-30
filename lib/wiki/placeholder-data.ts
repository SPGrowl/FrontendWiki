export interface SidebarNavItem {
  title: string;
  herf: string;
  label: string;
}

export interface WikiCategory {
  content: string;
  href: string;
  label: string;
}

export const sidebarNavItems: SidebarNavItem[] = [
  { title: "参与贡献", herf: "/wiki/contribute", label: "编辑指南" },
  { title: "实用工具", herf: "/wiki/community", label: "社区门户" },
  { title: "常用文档", herf: "/wiki/games", label: "游戏概览" },
  { title: "版本", herf: "/wiki/versions", label: "Java 版 26.2" },
  { title: "常用页面", herf: "/wiki/blocks", label: "方块" },
  { title: "工具", herf: "/wiki/tools", label: "工具列表" },
];

export const wikiCategories: WikiCategory[] = [
  { content: "首页", href: "/", label: "Home" },
  { content: "原生", href: "/native", label: "Native" },
  { content: "框架", href: "/framework", label: "Framework" },
  { content: "工具链", href: "/tool", label: "tool" },
  { content: "JS全栈", href: "/fullstack", label: "FullStack" },
  { content: "项目", href: "/project", label: "Project" },
];
