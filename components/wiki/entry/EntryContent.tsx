import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { MarkdownCodeBlock } from "@/components/wiki/entry/markdown-code-block";
import { MarkdownLink } from "@/components/wiki/entry/markdown-link";

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
  pre({ children }: ComponentProps<"pre">) {
    return <>{children}</>;
  },
  code({ className, children, ...props }: ComponentProps<"code">) {
    const match = /language-(\w+)/.exec(className ?? "");
    const text = extractText(children).replace(/\n$/, "");
    const isBlock = Boolean(match) || text.includes("\n");

    if (isBlock) {
      return (
        <MarkdownCodeBlock language={match?.[1] ?? ""} code={text} />
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
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
