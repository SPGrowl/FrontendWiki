"use client";

import { JsRunnerPanel } from "./JsRunnerPanel";
import { JsRunnerProvider } from "./js-runner-context";

export function JsRunnerRoot({ children }: { children: React.ReactNode }) {
  return (
    <JsRunnerProvider>
      {children}
      <JsRunnerPanel />
    </JsRunnerProvider>
  );
}
