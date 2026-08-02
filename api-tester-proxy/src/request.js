import { ProxyError } from "./errors.js";
import { filterRequestHeaders } from "./headers.js";
import { validateTargetUrl } from "./url.js";

export async function parseProxyRequest(request, config) {
  if (request.method === "POST") {
    const contentType = request.headers.get("content-type") || "";
    const contentLength = Number.parseInt(request.headers.get("content-length") || "0", 10);

    if (config.maxRequestBytes > 0 && Number.isFinite(contentLength) && contentLength > config.maxRequestBytes) {
      throw new ProxyError("Request body too large", 413, `Payload exceeds ${config.maxRequestBytes} bytes`);
    }

    if (contentType.includes("multipart/form-data")) {
      return parseMultipartEnvelope(request);
    }

    if (contentType.includes("application/json")) {
      return parseJsonEnvelope(request);
    }
  }

  return parseDirectRequest(request, config);
}

async function parseJsonEnvelope(request) {
  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    throw new ProxyError("Invalid JSON payload", 400, error.message);
  }

  return normalizePayload(payload);
}

async function parseMultipartEnvelope(request) {
  let formData;

  try {
    formData = await request.formData();
  } catch (error) {
    throw new ProxyError("Invalid multipart payload", 400, error.message);
  }

  const metadata = formData.get("metadata");

  if (typeof metadata !== "string") {
    throw new ProxyError("Invalid multipart payload", 400, "Missing metadata field");
  }

  let payload;

  try {
    payload = JSON.parse(metadata);
  } catch (error) {
    throw new ProxyError("Invalid JSON payload", 400, error.message);
  }

  return normalizePayload(payload, formData);
}

function normalizePayload(payload, formData = null) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ProxyError("Invalid JSON payload", 400, "Request payload must be an object");
  }

  const method = String(payload.method || "GET").toUpperCase();
  const allowedMethods = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]);

  if (!allowedMethods.has(method)) {
    throw new ProxyError("Unsupported method", 400, `Method ${method} is not supported`);
  }

  const url = validateTargetUrl(payload.url);
  const headers = filterRequestHeaders(payload.headers || {});
  const followRedirects = payload.followRedirects !== false;

  return {
    url,
    method,
    headers,
    followRedirects,
    body: buildRequestBody(payload, formData, headers, method),
  };
}

function parseDirectRequest(request, config) {
  const contentLength = Number.parseInt(request.headers.get("content-length") || "0", 10);
  if (config.maxRequestBytes > 0 && Number.isFinite(contentLength) && contentLength > config.maxRequestBytes) {
    throw new ProxyError("Request body too large", 413, `Payload exceeds ${config.maxRequestBytes} bytes`);
  }

  const rawUrl = request.headers.get("x-proxy-url") || new URL(request.url).searchParams.get("url");
  const url = validateTargetUrl(rawUrl);
  const headers = filterRequestHeaders(request.headers);
  const followRedirectsHeader = request.headers.get("x-follow-redirects");
  const followRedirects = followRedirectsHeader === null
    ? true
    : !["false", "0", "no"].includes(followRedirectsHeader.toLowerCase());

  return {
    url,
    method: request.method.toUpperCase(),
    headers,
    followRedirects,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
  };
}

function buildRequestBody(payload, formData, headers, method) {
  if (method === "GET" || method === "HEAD") {
    return undefined;
  }

  if (formData) {
    const bodyType = payload.bodyType || "multipart";

    if (bodyType === "multipart") {
      return buildMultipartBody(payload, formData, headers);
    }

    if (bodyType === "binary") {
      const binaryFile = formData.get("body");

      if (!(binaryFile instanceof File)) {
        throw new ProxyError("Invalid body", 400, "Multipart binary requests require a body file field");
      }

      if (!headers.has("content-type") && binaryFile.type) {
        headers.set("content-type", binaryFile.type);
      }

      return binaryFile.stream();
    }
  }

  if (!Object.hasOwn(payload, "body") || payload.body === null) {
    return undefined;
  }

  if (payload.bodyEncoding === "base64") {
    try {
      const bytes = Uint8Array.from(atob(payload.body), (char) => char.charCodeAt(0));
      return bytes;
    } catch {
      throw new ProxyError("Invalid body", 400, "body is not valid base64");
    }
  }

  if (typeof payload.body === "string") {
    return payload.body;
  }

  if (payload.body instanceof ArrayBuffer || ArrayBuffer.isView(payload.body)) {
    return payload.body;
  }

  if (typeof payload.body === "object") {
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    return JSON.stringify(payload.body);
  }

  throw new ProxyError("Invalid body", 400, "Unsupported request body");
}

function buildMultipartBody(payload, formData, headers) {
  const upstreamFormData = new FormData();
  const fields = Array.isArray(payload.formData) ? payload.formData : [];

  for (const field of fields) {
    if (!field || !field.name) {
      continue;
    }

    if (field.type === "file") {
      const file = formData.get(field.fileField || field.name);

      if (!(file instanceof File)) {
        throw new ProxyError("Invalid body", 400, `Missing file for field ${field.name}`);
      }

      upstreamFormData.append(field.name, file, file.name);
      continue;
    }

    upstreamFormData.append(field.name, String(field.value ?? ""));
  }

  headers.delete("content-type");
  return upstreamFormData;
}
