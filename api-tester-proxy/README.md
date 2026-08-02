# API Tester Proxy Worker

A production-ready Cloudflare Worker proxy for the React `API-Tester` frontend. It accepts the browser request using the original HTTP method, validates the target, blocks obvious SSRF paths, forwards the upstream request with streaming where possible, and returns the upstream response without wrapping successful responses in JSON.

## Features

- Supports `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, and `HEAD`
- Streams upstream response bodies back to the browser
- Preserves upstream status, status text, headers, and body
- Filters hop-by-hop headers before forwarding
- Supports JSON, raw text, XML, urlencoded forms, multipart uploads, and binary bodies
- Handles CORS preflight for a Netlify frontend
- Blocks localhost, private IP ranges, link-local ranges, and internal metadata targets
- Enforces configurable request timeout and optional size limits
- Returns consistent JSON errors for validation, timeout, and network failures

## Folder Structure

```txt
api-tester-proxy/
├── src/
│   ├── config.js
│   ├── cors.js
│   ├── errors.js
│   ├── headers.js
│   ├── index.js
│   ├── logger.js
│   ├── proxy.js
│   ├── request.js
│   └── url.js
├── test/
├── package.json
└── wrangler.jsonc
```

## Request Contract

The frontend should call the Worker with the same HTTP method it wants the upstream API to receive.

- Send the target URL in `x-proxy-url`
- Optionally send redirect preference in `x-follow-redirects: true|false`
- Send the original request body directly
- Send normal upstream headers directly, except headers that browsers or proxies control

Example:

```http
POST /proxy
x-proxy-url: https://httpbin.org/post
x-follow-redirects: true
content-type: application/json
authorization: Bearer token
```

The Worker also still accepts the older JSON-envelope `POST /proxy` format as a compatibility fallback, but the direct-method form is now the recommended interface.

### Standard JSON envelope

```json
{
  "url": "https://example.com/api/users?active=true",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token",
    "Accept": "application/json"
  },
  "body": null,
  "followRedirects": true
}
```

## Configuration

Set these in `wrangler.jsonc` under `vars` or with environment-specific values:

| Variable | Default | Purpose |
|---|---:|---|
| `ALLOWED_ORIGINS` | `https://your-netlify-site.netlify.app` | Comma-separated CORS allowlist |
| `ALLOW_ANY_ORIGIN` | `false` | Development-only wildcard CORS mode |
| `DEVELOPMENT_MODE` | `false` | Toggle development behavior |
| `LOGGING_ENABLED` | `false` | Enable request/error logging |
| `PROXY_TIMEOUT_MS` | `30000` | Upstream timeout |
| `MAX_REQUEST_BYTES` | `1048576` | Max incoming proxy payload size |
| `MAX_RESPONSE_BYTES` | `0` | Optional upstream response size limit. `0` disables it |
| `MAX_REDIRECTS` | `5` | Reserved for future redirect policy extensions |
| `PROXY_ROUTE_PATH` | `/proxy` | Worker endpoint path |

## Why The Worker Does This

- CORS headers exist so the browser can call the Worker from your Netlify app.
- SSRF protection exists because a generic proxy can otherwise be abused to reach local or internal services.
- Hop-by-hop headers are filtered because they are connection-specific and must not be forwarded by proxies.
- Redirect handling uses `fetch(..., { redirect })` so the frontend can choose whether redirects are followed or surfaced.
- Streaming is used by returning `new Response(upstream.body, ...)`, which avoids buffering large responses in Worker memory.

## React Integration

Set the frontend environment variable:

```bash
VITE_PROXY_URL=http://127.0.0.1:8787/proxy
```

For production:

```bash
VITE_PROXY_URL=https://your-worker.your-subdomain.workers.dev/proxy
```

## Example Frontend Fetch Call

```js
await fetch(import.meta.env.VITE_PROXY_URL, {
  method: "GET",
  headers: {
    "x-proxy-url": "https://jsonplaceholder.typicode.com/posts/1",
    "x-follow-redirects": "true",
    Accept: "application/json",
  },
});
```

## Example POST Request

```js
await fetch(import.meta.env.VITE_PROXY_URL, {
  method: "POST",
  headers: {
    "x-proxy-url": "https://httpbin.org/post",
    "x-follow-redirects": "true",
    "Content-Type": "application/json",
    Authorization: "Bearer token",
  },
  body: JSON.stringify({
    name: "Arav",
    role: "developer"
  }),
});
```

## Example File Upload

```js
const form = new FormData();
form.append("title", "demo-file");
form.append("attachment", fileInput.files[0], fileInput.files[0].name);

await fetch(import.meta.env.VITE_PROXY_URL, {
  method: "POST",
  headers: {
    "x-proxy-url": "https://httpbin.org/post",
    "x-follow-redirects": "true",
    Accept: "application/json",
  },
  body: form,
});
```

## Example Binary Download

```js
const response = await fetch(import.meta.env.VITE_PROXY_URL, {
  method: "GET",
  headers: {
    "x-proxy-url": "https://example.com/report.pdf",
    "x-follow-redirects": "true",
    Accept: "application/pdf",
  },
});

const blob = await response.blob();
const objectUrl = URL.createObjectURL(blob);
window.open(objectUrl, "_blank");
```

## Example CORS Preflight

```bash
curl -i -X OPTIONS http://127.0.0.1:8787/proxy \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, authorization"
```

## Local Development

1. Install Worker dependencies:

```bash
cd api-tester-proxy
npm install
```

2. Update `wrangler.jsonc` with your allowed origin:

```jsonc
"vars": {
  "ALLOWED_ORIGINS": "http://localhost:5173,https://your-netlify-site.netlify.app",
  "LOGGING_ENABLED": "true",
  "DEVELOPMENT_MODE": "true"
}
```

3. Start the Worker:

```bash
npm run dev
```

4. Start the frontend from the repo root:

```bash
npm run dev
```

## Deployment With Wrangler

1. Configure production vars in `wrangler.jsonc` or your Cloudflare dashboard.
2. Deploy:

```bash
cd api-tester-proxy
npm run deploy
```

3. Set your Netlify app’s `VITE_PROXY_URL` to the deployed Worker URL.

## Security Notes

- The Worker blocks direct requests to private IP literals and known metadata/internal hostnames.
- Non-HTTP protocols are rejected.
- The strongest SSRF posture is still an allowlist of trusted upstream APIs. If your use case eventually narrows, add host allowlisting on top of the current denylist model.
- Cloudflare Workers cannot independently resolve DNS to inspect the final IP of arbitrary public hostnames, so DNS rebinding-resistant allowlisting is the next hardening step if you need stricter guarantees.
