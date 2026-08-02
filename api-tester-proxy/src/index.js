import { getConfig } from "./config.js";
import { buildCorsHeaders, createPreflightResponse, withCors } from "./cors.js";
import { ProxyError, jsonError } from "./errors.js";
import { createLogger } from "./logger.js";
import { forwardRequest } from "./proxy.js";
import { parseProxyRequest } from "./request.js";

export default {
  async fetch(request, env, ctx) {
    const config = getConfig(env);
    const log = createLogger(config);

    if (new URL(request.url).pathname !== config.routePath) {
      return new Response("Not Found", { status: 404 });
    }

    let corsHeaders;
    const startedAt = Date.now();

    try {
      corsHeaders = buildCorsHeaders(request, config);

      if (request.method === "OPTIONS") {
        return createPreflightResponse(request, config);
      }

      const proxyRequest = await parseProxyRequest(request, config);
      log("info", "Forwarding request", {
        method: proxyRequest.method,
        url: proxyRequest.url.toString(),
        followRedirects: proxyRequest.followRedirects,
      });

      const upstreamResponse = await forwardRequest(proxyRequest, config, log);
      const durationMs = Date.now() - startedAt;

      log("info", "Completed request", {
        method: proxyRequest.method,
        url: proxyRequest.url.toString(),
        status: upstreamResponse.status,
        durationMs,
      });

      return withCors(upstreamResponse, corsHeaders);
    } catch (error) {
      const handledError = error instanceof ProxyError
        ? error
        : new ProxyError("Internal proxy error", 500, error?.message || "Unexpected error");

      log("error", handledError.message, {
        status: handledError.status,
        details: handledError.details,
      });

      if (!corsHeaders) {
        try {
          corsHeaders = buildCorsHeaders(request, config);
        } catch {
          corsHeaders = {
            "Access-Control-Allow-Origin": config.allowAnyOrigin ? "*" : config.allowedOrigins[0] || "*",
            "Access-Control-Allow-Methods": config.allowedMethods.join(", "),
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
            "Access-Control-Expose-Headers": "*",
          };
        }
      }

      return jsonError(handledError.message, handledError.status, corsHeaders, handledError.details);
    }
  },
};
