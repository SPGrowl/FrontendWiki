import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML Playground | Frontend Wiki",
  description:
    "在隔离沙盒中编辑完整 HTML，拖动预览宽度查看 CSS 媒体查询与原生 JS 效果。",
};

export default function HtmlPlaygroundLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
