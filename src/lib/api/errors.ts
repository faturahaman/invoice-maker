import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/**
 * Standard JSON error shape returned by the public API on failure.
 */
export function jsonError(
  status: number,
  code: string,
  message: string,
  extraHeaders?: Record<string, string>,
  details?: unknown
) {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status, headers: extraHeaders }
  );
}

export function zodErrorDetails(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
