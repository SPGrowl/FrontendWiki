"use client";

import * as React from "react";

export interface OpenPlaygroundOptions {
  /** 打开时写入编辑器的 HTML；省略则保留面板当前内容 */
  html?: string;
}

interface HtmlPlaygroundContextValue {
  open: boolean;
  pendingHtml: string | null;
  openPlayground: (options?: OpenPlaygroundOptions) => void;
  closePlayground: () => void;
  clearPendingHtml: () => void;
}

const HtmlPlaygroundContext =
  React.createContext<HtmlPlaygroundContextValue | null>(null);

export function HtmlPlaygroundProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [pendingHtml, setPendingHtml] = React.useState<string | null>(null);

  const value = React.useMemo<HtmlPlaygroundContextValue>(
    () => ({
      open,
      pendingHtml,
      openPlayground: (options) => {
        if (options?.html != null) {
          setPendingHtml(options.html);
        }
        setOpen(true);
      },
      closePlayground: () => setOpen(false),
      clearPendingHtml: () => setPendingHtml(null),
    }),
    [open, pendingHtml]
  );

  return (
    <HtmlPlaygroundContext.Provider value={value}>
      {children}
    </HtmlPlaygroundContext.Provider>
  );
}

export function useHtmlPlayground() {
  const context = React.useContext(HtmlPlaygroundContext);
  if (!context) {
    throw new Error(
      "useHtmlPlayground must be used within HtmlPlaygroundProvider"
    );
  }
  return context;
}
