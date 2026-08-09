/** 沙盒可直接执行的 Markdown 代码围栏语言标签 */
const RUNNABLE_JS_LANGS = new Set([
  "js",
  "javascript",
  "mjs",
  "cjs",
  "jsx",
]);

export function isRunnableJsLanguage(language: string): boolean {
  return RUNNABLE_JS_LANGS.has(language.trim().toLowerCase());
}
