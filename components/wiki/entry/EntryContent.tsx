import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { MarkdownLink } from "@/components/wiki/entry/markdown-link";

interface EntryContentProps {
  content: string;
}

const markdownComponents = {
  a: MarkdownLink,
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
