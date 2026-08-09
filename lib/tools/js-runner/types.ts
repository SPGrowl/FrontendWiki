export type LogType = "log" | "warn" | "error" | "info";

export interface LogEntry {
  type: LogType;
  args: unknown[];
}

export interface SandboxResult {
  success: boolean;
  error?: string;
  logs: LogEntry[];
  returnValue?: unknown;
}
