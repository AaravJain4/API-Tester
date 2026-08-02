const DEFAULT_ALLOWED_ORIGINS = [
  "https://your-netlify-site.netlify.app",
];

const DEFAULT_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

export const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
]);

export const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.",
  "0.0.0.0",
  "127.0.0.1",
  "::1",
  "metadata.google.internal",
  "metadata",
]);

export function getConfig(env = {}) {
  const allowAnyOrigin = toBoolean(env.ALLOW_ANY_ORIGIN, false);
  const allowedOrigins = allowAnyOrigin
    ? ["*"]
    : parseCsv(env.ALLOWED_ORIGINS, DEFAULT_ALLOWED_ORIGINS);

  return {
    routePath: env.PROXY_ROUTE_PATH || "/proxy",
    developmentMode: toBoolean(env.DEVELOPMENT_MODE, false),
    loggingEnabled: toBoolean(env.LOGGING_ENABLED, false),
    allowAnyOrigin,
    allowedOrigins,
    allowedMethods: DEFAULT_METHODS,
    timeoutMs: toBoundedInteger(env.PROXY_TIMEOUT_MS, 30000, 1000, 120000),
    maxRequestBytes: toBoundedInteger(env.MAX_REQUEST_BYTES, 1048576, 1024, 104857600),
    maxResponseBytes: toBoundedInteger(env.MAX_RESPONSE_BYTES, 0, 0, 0),
    maxRedirects: toBoundedInteger(env.MAX_REDIRECTS, 5, 0, 20),
  };
}

function parseCsv(value, fallback) {
  if (!value) {
    return [...fallback];
  }

  const values = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return values.length > 0 ? values : [...fallback];
}

function toBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value).toLowerCase() === "true";
}

function toBoundedInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  if (max === 0) {
    return Math.max(min, parsed);
  }

  return Math.min(Math.max(parsed, min), max);
}
