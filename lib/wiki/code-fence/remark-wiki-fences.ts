import type { Code, Root } from "mdast";
import { SKIP, visit } from "unist-util-visit";
import { sandboxOfFullLanguage } from "./languages";
import { parseFenceInfo } from "./parse-fence-info";
import { resolveDisplayRun, type FullFence } from "./resolve-run";

type HastProperties = Record<string, unknown>;

function getHProperties(node: Code): HastProperties {
  const data = node.data as { hProperties?: HastProperties } | undefined;
  return { ...(data?.hProperties ?? {}) };
}

/**
 * 配对 playground 展示块与 full 完整块：
 * - 从树中移除 full 节点（默认隐藏）
 * - 给可运行展示块写入 dataSandbox / dataRunPayload
 */
export function remarkWikiFences() {
  return (tree: Root) => {
    const fullById = new Map<string, FullFence>();

    visit(tree, "code", (node: Code) => {
      const info = parseFenceInfo(node.lang, node.meta);
      if (!info.full || !info.id) return;
      if (fullById.has(info.id)) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[wiki-fences] duplicate full id="${info.id}", using the first block`
          );
        }
        return;
      }
      if (!sandboxOfFullLanguage(info.language)) return;
      fullById.set(info.id, { language: info.language, value: node.value });
    });

    visit(tree, "code", (node: Code, index, parent) => {
      const info = parseFenceInfo(node.lang, node.meta);

      if (info.full) {
        if (parent && typeof index === "number") {
          parent.children.splice(index, 1);
          return [SKIP, index];
        }
        return;
      }

      const resolved = resolveDisplayRun(
        { language: info.language, id: info.id, value: node.value },
        fullById
      );
      if (!resolved) return;

      node.data = {
        ...node.data,
        hProperties: {
          ...getHProperties(node),
          dataSandbox: resolved.sandbox,
          dataRunPayload: resolved.payload,
        },
      };
    });
  };
}
