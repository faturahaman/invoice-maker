"use client";

import React from "react";
import dynamic from "next/dynamic";

import type { InvoicePayload, Issuer } from "@/lib/schema/invoice";
import { InvoicePDF } from "@/components/pdf/InvoicePDF";
import { SpinnerIcon } from "./icons";

// react-pdf's PDFViewer touches browser-only APIs (it renders through an
// internal <iframe>), so it must never be part of the server-rendered tree.
// `ssr: false` defers the import entirely to the client.
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <PreviewPlaceholder text="Memuat preview…" loading /> }
);

function PreviewPlaceholder({ text, loading }: { text: string; loading?: boolean }) {
  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center gap-3 border border-dashed border-border bg-muted/40 px-6 text-center">
      {loading ? (
        <SpinnerIcon className="h-6 w-6 text-accent" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10 text-muted-foreground/50"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M9 13h6M9 17h6" />
        </svg>
      )}
      <p className="max-w-[220px] text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

/**
 * Live PDF preview, re-rendered whenever `payload` is null (invalid form
 * state) vs a validated `InvoicePayload`. Kept as its own component so the
 * (fairly heavy) dynamic import only loads once, not per form re-render.
 */
export function InvoicePreview({
  payload,
  issuer,
}: {
  payload: InvoicePayload | null;
  issuer: Issuer | null;
}) {
  if (!payload || !issuer) {
    return <PreviewPlaceholder text="Lengkapi form untuk melihat preview invoice." />;
  }

  return (
    <div className="overflow-hidden border border-border bg-background">
      <PDFViewer width="100%" height="100%" showToolbar={false} className="min-h-[600px]">
        <InvoicePDF payload={payload} issuer={issuer} />
      </PDFViewer>
    </div>
  );
}
