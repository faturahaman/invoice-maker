/**
 * API key auth for the public invoice generation endpoint.
 *
 * MVP: reads a comma-separated allowlist from env var `VALID_API_KEYS`.
 * Swap `isValidApiKey` for a DB/KV lookup later (e.g. Vercel KV / Upstash)
 * without changing the call site in the route handler.
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function getValidApiKeys(): string[] {
  const raw = process.env.VALID_API_KEYS ?? "";
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

export function isValidApiKey(apiKey: string): boolean {
  return getValidApiKeys().includes(apiKey);
}
