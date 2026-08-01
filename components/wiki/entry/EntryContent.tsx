import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

interface EntryContentProps {
  content: string;
}

export function EntryContent({ content }: EntryContentProps) {
  return (
    <div
      className={[
        "wiki-prose text-sm leading-relaxed",
        "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:scroll-mt-20",
        "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:scroll-mt-20",
        "[&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:font-medium [&_h4]:scroll-mt-20",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-0.5",
        "[&_a]:text-blue-600 [&_a]:underline",
        "[&_strong]:font-bold",
        "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse",
        "[&_th]:border [&_th]:border-[#8d8d8d] [&_th]:bg-[#e6eff4] [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left",
        "[&_td]:border [&_td]:border-[#8d8d8d] [&_td]:px-3 [&_td]:py-1.5",
        "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-[#e6eff4] [&_pre]:p-3",
        "[&_code]:rounded [&_code]:bg-[#e6eff4] [&_code]:px-1",
      ].join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
