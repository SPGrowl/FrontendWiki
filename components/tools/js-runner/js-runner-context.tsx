"use client";

import * as React from "react";

export interface OpenRunnerOptions {
  /** 打开时写入编辑器的代码；省略则保留面板当前内容 */
  code?: string;
}

interface JsRunnerContextValue {
  open: boolean;
  /** 待注入的代码；Panel 消费后应调用 clearPendingCode */
  pendingCode: string | null;
  openRunner: (options?: OpenRunnerOptions) => void;
  closeRunner: () => void;
  clearPendingCode: () => void;
}

const JsRunnerContext = React.createContext<JsRunnerContextValue | null>(null);

export function JsRunnerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [pendingCode, setPendingCode] = React.useState<string | null>(null);

  const value = React.useMemo<JsRunnerContextValue>(
    () => ({
      open,
      pendingCode,
      openRunner: (options) => {
        if (options?.code != null) {
          setPendingCode(options.code);
        }
        setOpen(true);
      },
      closeRunner: () => setOpen(false),
      clearPendingCode: () => setPendingCode(null),
    }),
    [open, pendingCode]
  );

  return (
    <JsRunnerContext.Provider value={value}>{children}</JsRunnerContext.Provider>
  );
}

export function useJsRunner() {
  const context = React.useContext(JsRunnerContext);
  if (!context) {
    throw new Error("useJsRunner must be used within JsRunnerProvider");
  }
  return context;
}
