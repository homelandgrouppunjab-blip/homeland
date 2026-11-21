// Lightweight logger with environment-based filtering.
// In production builds (NODE_ENV === "production") these are no-ops, so no
// debugging information is leaked to the browser console or impacts perf.
// In development they behave like the matching console methods.
const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  warn: (...args) => { if (isDev) console.warn(...args); },
  error: (...args) => { if (isDev) console.error(...args); },
  info: (...args) => { if (isDev) console.info(...args); },
  log: (...args) => { if (isDev) console.log(...args); },
};

export default logger;
