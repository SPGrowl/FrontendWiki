"use client";

import * as React from "react";

interface JsRunnerContextValue {
  open: boolean;
  openRunner: () => void;
  closeRunner: () => void;
}

const JsRunnerContext = React.createContext<JsRunnerContextValue | null>(null);

export function JsRunnerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  const value = React.useMemo(
    () => ({
      open,
      openRunner: () => setOpen(true),
      closeRunner: () => setOpen(false),
    }),
    [open]
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
