import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../src/index.js";

const env = {
  ALLOWED_ORIGINS: "https://api-tester.netlify.app,http://localhost:5173",
  LOGGING_ENABLED: "false",
  PROXY_TIMEOUT_MS: "25",
};

function createProxyRequest(body, init = {}) {
  return new Request("https://worker.example/proxy", {
    method: init.method || "POST",
    headers: {
      Origin: "https://api-tester.netlify.app",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("api tester proxy worker", () => {
  it("responds to CORS preflight requests", async () => {
    const request = new Request("https://worker.example/proxy", {
      method: "OPTIONS",
      headers: {
        Origin: "https://api-tester.netlify.app",
        "Access-Control-Request-Headers": "content-type, authorization",
      },
    });

    const response = await worker.fetch(request, env, {});

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://api-tester.netlify.app");
    expect(response.headers.get("Access-Control-Allow-Headers")).toContain("content-type");
  });

  it("blocks SSRF requests to private targets", async () => {
    const response = await worker.fetch(createProxyRequest({
      url: "http://127.0.0.1/admin",
      method: "GET",
      headers: {},
      followRedirects: true,
    }), env, {});

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "Target URL is not allowed",
    });
  });

  it("supports direct GET requests to the worker itself", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    }));

    vi.stubGlobal("fetch", fetchMock);

    const request = new Request("https://worker.example/proxy", {
      method: "GET",
      headers: {
        Origin: "https://api-tester.netlify.app",
        "x-proxy-url": "https://example.com/data",
        Accept: "application/json",
      },
    });

    const response = await worker.fetch(request, env, {});
    const [targetUrl, init] = fetchMock.mock.calls[0];

    expect(targetUrl).toBe("https://example.com/data");
    expect(init.method).toBe("GET");
    expect(init.headers.get("x-proxy-url")).toBeNull();
    expect(response.status).toBe(200);
  });

  it("rejects malformed JSON payloads", async () => {
    const request = new Request("https://worker.example/proxy", {
      method: "POST",
      headers: {
        Origin: "https://api-tester.netlify.app",
        "Content-Type": "application/json",
      },
      body: "{invalid-json",
    });

    const response = await worker.fetch(request, env, {});

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "Invalid JSON payload",
    });
  });

  it("forwards requests and filters hop-by-hop headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("proxied", {
      status: 201,
      headers: {
        "content-type": "text/plain",
        "x-upstream": "ok",
      },
    }));

    vi.stubGlobal("fetch", fetchMock);

    const response = await worker.fetch(createProxyRequest({
      url: "https://example.com/users?active=true",
      method: "POST",
      headers: {
        Authorization: "Bearer abc",
        Host: "malicious-host",
        Connection: "keep-alive",
        "Content-Type": "application/json",
      },
      body: {
        name: "Arav",
      },
      followRedirects: true,
    }), env, {});

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [targetUrl, init] = fetchMock.mock.calls[0];

    expect(targetUrl).toBe("https://example.com/users?active=true");
    expect(init.method).toBe("POST");
    expect(init.redirect).toBe("follow");
    expect(init.headers.get("authorization")).toBe("Bearer abc");
    expect(init.headers.get("host")).toBeNull();
    expect(init.headers.get("connection")).toBeNull();
    expect(response.status).toBe(201);
    expect(await response.text()).toBe("proxied");
    expect(response.headers.get("x-upstream")).toBe("ok");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://api-tester.netlify.app");
  });

  it("respects followRedirects=false", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, {
      status: 302,
      headers: {
        location: "https://example.com/redirected",
      },
    }));

    vi.stubGlobal("fetch", fetchMock);

    const response = await worker.fetch(createProxyRequest({
      url: "https://example.com/redirect",
      method: "GET",
      headers: {},
      followRedirects: false,
    }), env, {});

    const [, init] = fetchMock.mock.calls[0];

    expect(init.redirect).toBe("manual");
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://example.com/redirected");
  });

  it("returns a timeout-style error for aborted upstream fetches", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(
      new DOMException("The operation was aborted.", "AbortError"),
    ));

    const response = await worker.fetch(createProxyRequest({
      url: "https://example.com/slow",
      method: "GET",
      headers: {},
      followRedirects: true,
    }), env, {});

    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "Upstream request timed out",
    });
  });
});
