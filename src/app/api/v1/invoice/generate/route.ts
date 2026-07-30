import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { InvoicePayloadSchema } from "@/lib/schema/invoice";
import { resolveIssuer } from "@/lib/templates/registry";
import { InvoicePDF } from "@/components/pdf/InvoicePDF";
import { extractBearerToken, isValidApiKey } from "@/lib/api/auth";
import { getCorsHeaders } from "@/lib/api/cors";
import { jsonError, zodErrorDetails } from "@/lib/api/errors";

// @react-pdf/renderer needs the Node.js runtime (not Edge).
export const runtime = "nodejs";
// PDF rendering can take a few seconds for large invoices; raise the ceiling
// above Vercel's 10s Hobby default so complex documents don't time out.
export const maxDuration = 30;

/**
 * Public invoice generation endpoint.
 *
 * POST /api/v1/invoice/generate
 * Headers: Authorization: Bearer <api_key>
 * Body: InvoicePayload (see src/lib/schema/invoice.ts)
 *
 * On success: 200, Content-Type: application/pdf, body = rendered PDF.
 * On failure: JSON error body, status 401 (auth) / 422 (validation) / 500 (render).
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // --- Auth ---
  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token || !isValidApiKey(token)) {
    return jsonError(401, "UNAUTHORIZED", "Missing or invalid API key.", corsHeaders);
  }

  // --- Reject oversized bodies early (DoS guard) ---
  // Inline logos are base64 data URIs, so bodies can legitimately reach a few
  // hundred KB; cap at 2 MB before we buffer/parse anything.
  const MAX_BODY_BYTES = 2 * 1024 * 1024;
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return jsonError(413, "PAYLOAD_TOO_LARGE", "Request body exceeds 2 MB.", corsHeaders);
  }

  // --- Parse + validate body ---
  let rawBody: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return jsonError(413, "PAYLOAD_TOO_LARGE", "Request body exceeds 2 MB.", corsHeaders);
    }
    rawBody = JSON.parse(text);
  } catch {
    return jsonError(422, "INVALID_JSON", "Request body must be valid JSON.", corsHeaders);
  }

  const parsed = InvoicePayloadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonError(
      422,
      "VALIDATION_ERROR",
      "Request body failed validation.",
      corsHeaders,
      zodErrorDetails(parsed.error)
    );
  }
  const payload = parsed.data;

  // --- Resolve issuer (inline `issuer` OR legacy `template_id`) ---
  const issuer = resolveIssuer(payload);
  if (!issuer) {
    return jsonError(
      422,
      "UNKNOWN_TEMPLATE",
      `Provide an inline \`issuer\`, or a \`template_id\` that matches a registered preset (got "${payload.template_id ?? ""}").`,
      corsHeaders
    );
  }

  // --- Render ---
  try {
    const buffer = await renderToBuffer(
      InvoicePDF({ payload, issuer })
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${payload.invoice_number}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[invoice/generate] render failed:", err);
    return jsonError(500, "RENDER_FAILED", "Failed to render invoice PDF.", corsHeaders);
  }
}

/** CORS preflight. */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}
