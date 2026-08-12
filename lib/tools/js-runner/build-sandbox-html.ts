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
  var finished = false;
  var pendingTimers = Object.create(null);
  var checkTimer = null;

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

  function emitLog(entry) {
    logs.push(entry);
    parent.postMessage({ source: SOURCE, type: "log", entry: entry }, "*");
  }

  ["log", "warn", "error", "info"].forEach(function (method) {
    console[method] = function () {
      emitLog({ type: method, args: serializeArgs(arguments) });
    };
  });

  function finish(payload) {
    if (finished) return;
    finished = true;
    if (checkTimer !== null) {
      nativeClearTimeout(checkTimer);
      checkTimer = null;
    }
    parent.postMessage(
      {
        source: SOURCE,
        type: "done",
        payload: {
          success: payload.success,
          error: payload.error,
          logs: logs,
        },
      },
      "*"
    );
  }

  var nativeSetTimeout = setTimeout.bind(window);
  var nativeClearTimeout = clearTimeout.bind(window);
  var nativeSetInterval = setInterval.bind(window);
  var nativeClearInterval = clearInterval.bind(window);

  function trackTimer(id) {
    pendingTimers[id] = true;
  }

  function untrackTimer(id) {
    delete pendingTimers[id];
  }

  function hasPendingTimers() {
    for (var key in pendingTimers) {
      if (Object.prototype.hasOwnProperty.call(pendingTimers, key)) {
        return true;
      }
    }
    return false;
  }

  function scheduleSettle(errorMessage) {
    if (finished) return;
    if (checkTimer !== null) nativeClearTimeout(checkTimer);
    checkTimer = nativeSetTimeout(function () {
      checkTimer = null;
      Promise.resolve()
        .then(function () {})
        .then(function () {
          if (finished) return;
          if (hasPendingTimers()) return;
          if (errorMessage) {
            finish({ success: false, error: errorMessage });
          } else {
            finish({ success: true });
          }
        });
    }, 0);
  }

  function runCallback(fn, args) {
    // 与浏览器定时器一致：不强制绑定 this（非严格 → window，严格 → undefined）
    if (typeof fn === "function") {
      fn.apply(undefined, args);
    }
  }

  function logCallbackError(err) {
    emitLog({
      type: "error",
      args: [serialize(err instanceof Error ? err : new Error(String(err)))],
    });
  }

  window.setTimeout = function (fn, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    var id = nativeSetTimeout(function () {
      untrackTimer(id);
      try {
        runCallback(fn, args);
      } catch (err) {
        logCallbackError(err);
      } finally {
        scheduleSettle();
      }
    }, delay);
    trackTimer(id);
    return id;
  };

  window.clearTimeout = function (id) {
    untrackTimer(id);
    return nativeClearTimeout(id);
  };

  window.setInterval = function (fn, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    var id = nativeSetInterval(function () {
      try {
        runCallback(fn, args);
      } catch (err) {
        logCallbackError(err);
      }
    }, delay);
    trackTimer(id);
    return id;
  };

  window.clearInterval = function (id) {
    untrackTimer(id);
    var result = nativeClearInterval(id);
    scheduleSettle();
    return result;
  };

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    emitLog({
      type: "error",
      args: [
        serialize(
          reason instanceof Error
            ? reason
            : new Error(
                typeof reason === "string" ? reason : String(reason)
              )
        ),
      ],
    });
    scheduleSettle();
  });

  try {
    var userCode = ${serializedCode};
    // 间接 eval：全局作用域，顶层 this === window（非严格），与经典 <script> 一致
    (0, eval)(userCode);
    scheduleSettle();
  } catch (err) {
    finish({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
})();
<\/script>
</body>
</html>`;
}
