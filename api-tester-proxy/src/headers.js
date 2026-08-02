import { HOP_BY_HOP_HEADERS } from "./config.js";
import { ProxyError } from "./errors.js";

const PROXY_CONTROL_HEADERS = new Set([
  "x-proxy-url",
  "x-follow-redirects",
]);

export function filterRequestHeaders(inputHeaders) {
  const headers = new Headers();

  const entries = inputHeaders instanceof Headers
    ? Array.from(inputHeaders.entries())
    : Object.entries(inputHeaders || {});

  for (const [key, value] of entries) {
    const lowerKey = key.toLowerCase();

    if (HOP_BY_HOP_HEADERS.has(lowerKey) || PROXY_CONTROL_HEADERS.has(lowerKey)) {
      continue;
    }

    if (typeof value !== "string") {
      throw new ProxyError("Invalid header value", 400, `Header ${key} must be a string`);
    }

    headers.set(key, value);
  }

  return headers;
}

export function cloneResponseHeaders(sourceHeaders) {
  const headers = new Headers();

  for (const [key, value] of sourceHeaders.entries()) {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      continue;
    }

    headers.set(key, value);
  }

  return headers;
}
