import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import type { Heading, PhrasingContent, Root } from "mdast";
import GithubSlugger from "github-slugger";

export interface TocItem {
  id: string;
  text: string;
  depth: number;
}

function toPlainText(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") return node.value;
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
    headings.push({
      id: slugger.slug(text),
      text,
      depth: node.depth,
    });
  });

  return headings;
}
