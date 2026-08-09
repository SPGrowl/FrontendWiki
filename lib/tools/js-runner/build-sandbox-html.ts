const SANDBOX_SOURCE = "js-runner-sandbox";

export function buildSandboxHtml(code: string): string {
  const serializedCode = JSON.stringify(code);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
(function () {
  var SOURCE = ${JSON.stringify(SANDBOX_SOURCE)};
  var logs = [];

  function serialize(value) {
    if (value === undefined) return { __type: "undefined" };
    if (value === null) return null;
    if (value instanceof Error) {
      return {
        __type: "Error",
        message: value.message,
        stack: value.stack || "",
      };
    }
    if (typeof value === "function") return value.toString();
    if (typeof value === "symbol") return value.toString();
    if (typeof value === "bigint") return value.toString() + "n";
    try {
      JSON.stringify(value);
      return value;
    } catch (_err) {
      return String(value);
    }
  }

  function serializeArgs(args) {
    return Array.prototype.slice.call(args).map(serialize);
  }

  ["log", "warn", "error", "info"].forEach(function (method) {
    console[method] = function () {
      logs.push({ type: method, args: serializeArgs(arguments) });
    };
  });

  function finish(payload) {
    parent.postMessage({ source: SOURCE, payload: payload }, "*");
  }

  try {
    var userCode = ${serializedCode};
    var fn = new Function("console", userCode);
    var returnValue = fn(console);
    finish({
      success: true,
      logs: logs,
      returnValue: serialize(returnValue),
    });
  } catch (err) {
    finish({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      logs: logs,
    });
  }
})();
<\/script>
</body>
</html>`;
}
