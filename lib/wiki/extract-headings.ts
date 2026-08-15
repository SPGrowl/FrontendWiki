import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import type { Heading, PhrasingContent, Root } from "mdast";
import GithubSlugger from "github-slugger";
import type { TocItem } from "@/type/entry";

export type { TocItem };

function toPlainText(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text" || node.type === "inlineCode") {
        return node.value;
      }
      if (node.type === "break") {
        return " ";
      }
      if (node.type === "image" || node.type === "imageReference") {
        return node.alt ?? "";
      }
      // 循环子节点
      if ("children" in node) {
        return toPlainText(node.children as PhrasingContent[]);
      }
      return "";
    })
    .join("");
}

export function extractHeadings(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const slugger = new GithubSlugger();
  const headings: TocItem[] = [];

  visit(tree, "heading", (node: Heading) => {
    if (node.depth < 2) return;

    const text = toPlainText(node.children);
    // 拼接heading
    headings.push({
      id: slugger.slug(text),
      text,
      depth: node.depth,
    });
  });

  return headings;
}
