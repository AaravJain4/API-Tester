export class ProxyError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = "ProxyError";
    this.status = status;
    this.details = details;
  }
}

export function jsonError(message, status, corsHeaders, details = null) {
  const payload = {
    success: false,
    error: message,
  };

  if (details) {
    payload.details = details;
  }

  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders,
    },
  });
}
