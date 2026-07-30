/**
 * Basic CORS handling for the public invoice API.
 *
 * MVP: allowlist of exact origins from env var `ALLOWED_ORIGINS`
 * (comma-separated). If the request's Origin isn't in the list, no
 * Access-Control-Allow-Origin header is set (browser blocks the response;
 * server-to-server callers without an Origin header are unaffected).
 */
function getAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS ?? "";
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = getAllowedOrigins();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes("*"))) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (allowedOrigins.includes("*")) {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
}
