import type { SandboxKind } from "./languages";

function firstString(
  props: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = props[key];
    if (typeof value === "string") return value;
  }
  return undefined;
}

/** 从 react-markdown 传到 code 组件的 hProperties 中读取运行信息 */
export function readCodeFenceRunProps(props: Record<string, unknown>): {
  sandbox?: SandboxKind;
  runPayload?: string;
} {
  const sandboxRaw = firstString(props, [
    "dataSandbox",
    "data-sandbox",
    "datasandbox",
  ]);
  const runPayload = firstString(props, [
    "dataRunPayload",
    "data-run-payload",
    "datarunpayload",
  ]);

  const sandbox: SandboxKind | undefined =
    sandboxRaw === "js" || sandboxRaw === "html" ? sandboxRaw : undefined;

  if (!sandbox || runPayload == null) {
    return {};
  }

  return { sandbox, runPayload };
}
