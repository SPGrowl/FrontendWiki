function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function formatDisplayValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (isPlainObject(value) && value.__type === "undefined") {
    return "undefined";
  }

  if (isPlainObject(value) && value.__type === "Error") {
    const message = String(value.message ?? "Error");
    const stack = value.stack ? `\n${String(value.stack)}` : "";
    return `${message}${stack}`;
  }

  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "bigint") return `${value.toString()}n`;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function formatLogArgs(args: unknown[]): string {
  return args.map((arg) => formatDisplayValue(arg)).join(" ");
}
