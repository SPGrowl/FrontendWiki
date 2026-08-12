import { buildSandboxHtml } from "./build-sandbox-html";
import type { LogEntry, SandboxResult } from "./types";

const SANDBOX_SOURCE = "js-runner-sandbox";
const DEFAULT_TIMEOUT_MS = 5000;

type SandboxMessage =
  | { source?: string; type: "log"; entry: LogEntry }
  | { source?: string; type: "done"; payload: SandboxResult };

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
    const streamedLogs: LogEntry[] = [];

    const finish = (result: SandboxResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      window.removeEventListener("message", onMessage);
      iframe.remove();
      resolve({
        ...result,
        logs: result.logs.length > 0 ? result.logs : streamedLogs,
      });
    };

    const timeoutId = window.setTimeout(() => {
      finish({
        success: false,
        error: `执行超时（${timeoutMs / 1000}s）`,
        logs: streamedLogs,
      });
    }, timeoutMs);

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;

      const data = event.data as SandboxMessage;
      if (data?.source !== SANDBOX_SOURCE) return;

      if (data.type === "log" && data.entry) {
        streamedLogs.push(data.entry);
        return;
      }

      if (data.type === "done" && data.payload) {
        finish(data.payload);
      }
    };

    window.addEventListener("message", onMessage);
    iframe.srcdoc = buildSandboxHtml(code);
    document.body.appendChild(iframe);
  });
}
