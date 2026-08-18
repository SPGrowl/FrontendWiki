export type SandboxKind = "js" | "html";

const JS_LANGS = new Set([
  "js",
  "javascript",
  "mjs",
  "cjs",
  "jsx",
]);

function normalizeLang(language: string): string {
  return language.trim().toLowerCase();
}

export function isJsLanguage(language: string): boolean {
  return JS_LANGS.has(normalizeLang(language));
}

export function isHtmlLanguage(language: string): boolean {
  return normalizeLang(language) === "html";
}

export function isCssLanguage(language: string): boolean {
  return normalizeLang(language) === "css";
}

/** 展示块是否有资格出现运行按钮 */
export function isDisplayCandidate(language: string): boolean {
  return (
    isJsLanguage(language) ||
    isHtmlLanguage(language) ||
    isCssLanguage(language)
  );
}

/**
 * 完整版语言对应的沙盒。
 * css / 其它语言没有独立沙盒，返回 null（视为未匹配）。
 */
export function sandboxOfFullLanguage(language: string): SandboxKind | null {
  if (isJsLanguage(language)) return "js";
  if (isHtmlLanguage(language)) return "html";
  return null;
}
