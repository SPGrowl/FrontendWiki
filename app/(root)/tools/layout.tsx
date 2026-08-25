import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JS 运行器 | Frontend Atlas",
  description:
    "在隔离沙盒中运行原生 JavaScript，查看 console 输出与返回值，适合前端八股刷题验证。",
};

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-y-auto bg-wiki-surface px-4 py-4 md:px-6 md:py-6">
      {children}
    </div>
  );
}
