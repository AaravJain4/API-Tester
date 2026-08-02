import { ProxyError } from "./errors.js";
import { cloneResponseHeaders } from "./headers.js";

export async function forwardRequest(proxyRequest, config, log) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort("Proxy timeout"), config.timeoutMs);

  try {
    const response = await fetch(proxyRequest.url.toString(), {
      method: proxyRequest.method,
      headers: proxyRequest.headers,
      body: proxyRequest.body,
      redirect: proxyRequest.followRedirects ? "follow" : "manual",
      signal: controller.signal,
    });

    const headers = cloneResponseHeaders(response.headers);

    if (config.maxResponseBytes > 0) {
      const contentLength = Number.parseInt(headers.get("content-length") || "0", 10);
      if (Number.isFinite(contentLength) && contentLength > config.maxResponseBytes) {
        response.body?.cancel();
        throw new ProxyError("Response body too large", 502, `Upstream response exceeds ${config.maxResponseBytes} bytes`);
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ProxyError("Upstream request timed out", 504, `The upstream server did not respond within ${config.timeoutMs}ms`);
    }

    if (error instanceof ProxyError) {
      throw error;
    }

    log("error", "Upstream fetch failed", {
      message: error?.message || "Unknown fetch failure",
    });

    throw new ProxyError("Network request failed", 502, error?.message || "Unknown upstream error");
  } finally {
    clearTimeout(timeoutId);
  }
}
