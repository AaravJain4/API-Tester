import { ProxyError } from "./errors.js";

export function resolveCorsOrigin(request, config) {
  const origin = request.headers.get("Origin");

  if (config.allowAnyOrigin) {
    return origin || "*";
  }

  if (!origin) {
    return config.allowedOrigins[0] || "*";
  }

  if (!config.allowedOrigins.includes(origin)) {
    throw new ProxyError("Origin is not allowed", 403, `Origin ${origin} is not in ALLOWED_ORIGINS`);
  }

  return origin;
}

export function buildCorsHeaders(request, config) {
  const allowOrigin = resolveCorsOrigin(request, config);
  const requestedHeaders = request.headers.get("Access-Control-Request-Headers");

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": config.allowedMethods.join(", "),
    "Access-Control-Allow-Headers": requestedHeaders || "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Expose-Headers": "*",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin, Access-Control-Request-Headers",
  };
}

export function createPreflightResponse(request, config) {
  const corsHeaders = buildCorsHeaders(request, config);

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export function withCors(response, corsHeaders) {
  const headers = new Headers(response.headers);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
