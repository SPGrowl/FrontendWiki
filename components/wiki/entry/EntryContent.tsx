import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { MarkdownCodeBlock } from "@/components/wiki/entry/markdown-code-block";
import { MarkdownImage } from "@/components/wiki/entry/markdown-image";
import { MarkdownLink } from "@/components/wiki/entry/markdown-link";
import { readCodeFenceRunProps } from "@/lib/wiki/code-fence/read-run-props";
import { remarkWikiFences } from "@/lib/wiki/code-fence/remark-wiki-fences";

interface EntryContentProps {
  content: string;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  if (node && typeof node === "object" && "props" in node) {
    return extractText(
      (node as { props?: { children?: ReactNode } }).props?.children
    );
  }
  return "";
}

const markdownComponents = {
  a: MarkdownLink,
  img: MarkdownImage,
  pre({ children }: ComponentProps<"pre">) {
    return <>{children}</>;
  },
  code({
    className,
    children,
    node,
    ...props
  }: ComponentProps<"code"> & {
    node?: { properties?: Record<string, unknown> };
  }) {
    const match = /language-(\w+)/.exec(className ?? "");
    const text = extractText(children).replace(/\n$/, "");
    const isBlock = Boolean(match) || text.includes("\n");

    if (isBlock) {
      const { sandbox, runPayload } = readCodeFenceRunProps({
        ...(node?.properties ?? {}),
        ...(props as Record<string, unknown>),
      });
      return (
        <MarkdownCodeBlock
          language={match?.[1] ?? ""}
          code={text}
          sandbox={sandbox}
          runPayload={runPayload}
        />
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

export function EntryContent({ content }: EntryContentProps) {
  return (
    <div className="wiki-prose">
      <ReactMarkdown
      // 表格、删除线、任务列表、自动链接、脚注
        remarkPlugins={[remarkGfm, remarkWikiFences]}
        // 转化为HTML语义化标签，为标题层级添加ID，便于TOC跳转
        rehypePlugins={[rehypeSlug]}
        // 自定义Markdown组件
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
