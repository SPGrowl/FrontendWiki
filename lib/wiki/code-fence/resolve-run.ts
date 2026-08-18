import {
  isDisplayCandidate,
  isJsLanguage,
  sandboxOfFullLanguage,
  type SandboxKind,
} from "./languages";

export interface DisplayFence {
  language: string;
  id?: string;
  value: string;
}

export interface FullFence {
  language: string;
  value: string;
}

export interface FenceRunTarget {
  payload: string;
  sandbox: SandboxKind;
}

/**
 * 展示块 → 运行载荷。
 * - 命中合法 full：注入 full，沙盒由 full 语言决定
 * - JS 未匹配：注入自身，进 JS 沙盒
 * - html/css 未匹配：不运行
 */
export function resolveDisplayRun(
  display: DisplayFence,
  fullById: Map<string, FullFence>
): FenceRunTarget | null {
  if (!isDisplayCandidate(display.language)) return null;

  const full = display.id ? fullById.get(display.id) : undefined;
  const fullSandbox = full ? sandboxOfFullLanguage(full.language) : null;

  if (full && fullSandbox) {
    return { payload: full.value, sandbox: fullSandbox };
  }

  if (isJsLanguage(display.language)) {
    return { payload: display.value, sandbox: "js" };
  }

  return null;
}
