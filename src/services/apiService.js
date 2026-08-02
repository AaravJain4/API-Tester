const TEXTUAL_CONTENT_TYPES = [
  "application/json",
  "application/xml",
  "application/javascript",
  "application/x-www-form-urlencoded",
  "text/",
  "image/svg+xml",
];

const DEFAULT_PROXY_URL = import.meta.env.VITE_PROXY_URL || "http://127.0.0.1:8787/proxy";

export const sendApiRequest = async ({
  method,
  url,
  headers,
  body,
  bodyType,
  formParams,
  authHeaders,
  replaceEnvVars,
}) => {
  const requestHeaders = { ...authHeaders };

  headers
    .filter((header) => header.enabled && header.key)
    .forEach((header) => {
      requestHeaders[header.key] = replaceEnvVars(header.value);
    });

  const proxyRequest = buildProxyRequest({
    method,
    url,
    headers: requestHeaders,
    body,
    bodyType,
    formParams,
    replaceEnvVars,
  });

  const startedAt = performance.now();
  const response = await fetch(DEFAULT_PROXY_URL, proxyRequest);
  const duration = Math.round(performance.now() - startedAt);

  const responseHeaders = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  if (!response.ok && response.headers.get("content-type")?.includes("application/json")) {
    const errorPayload = await response.json();
    throw new Error(errorPayload.details ? `${errorPayload.error}: ${errorPayload.details}` : errorPayload.error);
  }

  const parsedResponse = await parseProxyResponse(response);

  return {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body: parsedResponse.body,
    duration,
    size: parsedResponse.size,
    timestamp: new Date().toISOString(),
    isBinary: parsedResponse.isBinary,
    binaryBlob: parsedResponse.binaryBlob,
    binaryFileName: parsedResponse.binaryFileName,
  };
};

function buildProxyRequest({ method, url, headers, body, bodyType, formParams, replaceEnvVars }) {
  const normalizedMethod = method.toUpperCase();
  const proxyHeaders = new Headers();

  proxyHeaders.set("x-proxy-url", url);
  proxyHeaders.set("x-follow-redirects", "true");

  Object.entries(headers).forEach(([key, value]) => {
    proxyHeaders.set(key, value);
  });

  if (["GET", "HEAD"].includes(normalizedMethod)) {
    return {
      method: normalizedMethod,
      headers: proxyHeaders,
    };
  }

  if (bodyType === "form") {
    return buildFormProxyRequest(normalizedMethod, proxyHeaders, formParams, replaceEnvVars);
  }

  if (bodyType === "json") {
    proxyHeaders.set("Content-Type", proxyHeaders.get("Content-Type") || "application/json");
    return {
      method: normalizedMethod,
      headers: proxyHeaders,
      body: JSON.stringify(parseJsonRequestBody(body, replaceEnvVars)),
    };
  } else {
    return {
      method: normalizedMethod,
      headers: proxyHeaders,
      body: replaceEnvVars(body),
    };
  }
}

function buildFormProxyRequest(method, proxyHeaders, formParams, replaceEnvVars) {
  const enabledParams = formParams.filter((param) => param.enabled && param.key);
  const hasFiles = enabledParams.some((param) => param.type === "file" && param.file);

  if (hasFiles) {
    const formData = new FormData();

    enabledParams.forEach((param) => {
      if (param.type === "file" && param.file) {
        formData.append(param.key, param.file, param.file.name);
        return;
      }

      formData.append(param.key, replaceEnvVars(param.value));
    });

    proxyHeaders.delete("Content-Type");
    return {
      method,
      headers: proxyHeaders,
      body: formData,
    };
  }

  proxyHeaders.set("Content-Type", "application/x-www-form-urlencoded");
  const params = new URLSearchParams();

  enabledParams.forEach((param) => {
    params.append(param.key, replaceEnvVars(param.value));
  });

  return {
    method,
    headers: proxyHeaders,
    body: params.toString(),
  };
}

function parseJsonRequestBody(body, replaceEnvVars) {
  const resolvedBody = replaceEnvVars(body || "");

  if (!resolvedBody.trim()) {
    return {};
  }

  try {
    return JSON.parse(resolvedBody);
  } catch {
    // Keep raw text bodies available even when users type invalid JSON in the JSON tab.
    return resolvedBody;
  }
}

async function parseProxyResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (isTextualContentType(contentType)) {
    const text = await response.text();
    return {
      body: tryParseJson(text, contentType),
      size: new Blob([text]).size,
      isBinary: false,
      binaryBlob: null,
      binaryFileName: null,
    };
  }

  const blob = await response.blob();

  return {
    body: `[Binary response: ${contentType || "application/octet-stream"}]`,
    size: blob.size,
    isBinary: true,
    binaryBlob: blob,
    binaryFileName: getFileNameFromDisposition(response.headers.get("content-disposition")),
  };
}

function isTextualContentType(contentType) {
  return TEXTUAL_CONTENT_TYPES.some((value) => contentType.includes(value));
}

function tryParseJson(text, contentType) {
  if (!contentType.includes("application/json")) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getFileNameFromDisposition(contentDisposition) {
  if (!contentDisposition) {
    return null;
  }

  const match = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  return match ? decodeURIComponent(match[1].replace(/"/g, "")) : null;
}

export const runTests = (response, testScript) => {
  if (!testScript.trim()) return [];

  const results = [];
  const testContext = {
    response: {
      status: response.status,
      headers: response.headers,
      body: response.body,
      duration: response.duration,
    },
    expect: (actual) => ({
      toBe: (expected) => {
        const passed = actual === expected;
        results.push({
          passed,
          message: passed
            ? `Expected ${actual} to be ${expected}`
            : `Expected ${actual} to be ${expected}`,
        });
      },
      toEqual: (expected) => {
        const passed = JSON.stringify(actual) === JSON.stringify(expected);
        results.push({
          passed,
          message: passed ? "Values are equal" : "Values are not equal",
        });
      },
      toContain: (expected) => {
        const passed = JSON.stringify(actual).includes(expected);
        results.push({
          passed,
          message: passed
            ? `Contains ${expected}`
            : `Does not contain ${expected}`,
        });
      },
      toBeLessThan: (expected) => {
        const passed = actual < expected;
        results.push({
          passed,
          message: passed
            ? `${actual} < ${expected}`
            : `${actual} >= ${expected}`,
        });
      },
    }),
  };

  try {
    const testFunction = new Function("response", "expect", testScript);
    testFunction(testContext.response, testContext.expect);
  } catch (error) {
    results.push({
      passed: false,
      message: `Test error: ${error.message}`,
    });
  }

  return results;
};
