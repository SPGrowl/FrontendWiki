import { buildSandboxHtml } from "./build-sandbox-html";
import type { SandboxResult } from "./types";

const SANDBOX_SOURCE = "js-runner-sandbox";
const DEFAULT_TIMEOUT_MS = 5000;

export function runInSandbox(
  code: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<SandboxResult> {
  if (typeof window === "undefined") {
    return Promise.resolve({
      success: false,
      error: "沙盒仅能在浏览器环境中运行",
      logs: [],
    });
  }

  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.sandbox.add("allow-scripts");
    iframe.setAttribute("title", "JS Runner Sandbox");
    iframe.style.cssText =
      "position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;";

    let settled = false;

    const finish = (result: SandboxResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      window.removeEventListener("message", onMessage);
      iframe.remove();
      resolve(result);
    };

    const timeoutId = window.setTimeout(() => {
      finish({
        success: false,
        error: `执行超时（${timeoutMs / 1000}s）`,
        logs: [],
      });
    }, timeoutMs);

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;

      const data = event.data as {
        source?: string;
        payload?: SandboxResult;
      };

      if (data?.source !== SANDBOX_SOURCE || !data.payload) return;
      finish(data.payload);
    };

    window.addEventListener("message", onMessage);
    iframe.srcdoc = buildSandboxHtml(code);
    document.body.appendChild(iframe);
  });
}
