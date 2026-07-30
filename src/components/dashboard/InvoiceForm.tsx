"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  InvoiceFormSchema,
  invoiceFormDefaultValues,
  invoiceFormSampleValues,
  buildInvoicePayload,
  type InvoiceFormInput,
  type InvoiceFormValues,
} from "@/lib/schema/invoiceForm";

import { resolveIssuer } from "@/lib/templates/registry";
import { InvoicePayloadSchema, type InvoicePayload } from "@/lib/schema/invoice";
import { downloadBlob } from "@/lib/download";
import { useAutosave } from "@/lib/useAutosave";

import { IssuerSection } from "./sections/IssuerSection";
import { SettingsSection } from "./sections/SettingsSection";
import { InvoiceMetaSection } from "./sections/InvoiceMetaSection";
import { RecipientSection } from "./sections/RecipientSection";
import { ItemsSection } from "./sections/ItemsSection";
import { PaymentSchemesSection } from "./sections/PaymentSchemesSection";
import { NotesSection } from "./sections/NotesSection";
import { SignatorySection } from "./sections/SignatorySection";
import { InvoicePreview } from "./InvoicePreview";
import { GenerateButton } from "./GenerateButton";
import { SparkleIcon, RefreshIcon, EyeIcon, PencilIcon } from "./icons";

type SubmitStatus = "idle" | "loading" | "success" | "error";
type MobileTab = "form" | "preview";

/**
 * Top-level dashboard: owns the react-hook-form instance, derives a live
 * preview payload from the current (possibly invalid) form state, and
 * handles PDF generation entirely client-side via `@react-pdf/renderer`'s
 * `pdf().toBlob()` — no network round-trip to the API route needed here,
 * since the dashboard has direct access to the same InvoicePDF component
 * the API uses.
 */
export function InvoiceForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("form");

  const methods = useForm<InvoiceFormInput, unknown, InvoiceFormValues>({
    resolver: zodResolver(InvoiceFormSchema),
    defaultValues: invoiceFormDefaultValues,
    mode: "onBlur",
  });

  const { handleSubmit, watch, reset } = methods;
  const { state: saveState, clearDraft } = useAutosave(methods);

  // Best-effort live preview: re-validate the *current* raw values against
  // the full API schema on every render. If they don't parse yet (user
  // mid-edit), just show the placeholder instead of crashing the preview.
  const watchedValues = watch();
  const previewPayload = useMemo<InvoicePayload | null>(() => {
    const result = InvoicePayloadSchema.safeParse({
      ...watchedValues,
      items: watchedValues.items?.map((item, index) => ({ ...item, no: index + 1 })),
      output: "pdf",
    });
    return result.success ? result.data : null;
  }, [watchedValues]);

  const previewIssuer = previewPayload ? resolveIssuer(previewPayload) : null;

  // Auto-clear the transient success/error button state so it doesn't linger.
  useEffect(() => {
    if (status !== "success" && status !== "error") return;
    const t = setTimeout(() => setStatus("idle"), 2600);
    return () => clearTimeout(t);
  }, [status]);

  const loadSample = () => {
    reset(invoiceFormSampleValues);
    setStatus("idle");
    setSubmitError(null);
  };

  const resetForm = () => {
    if (!confirm("Kosongkan semua isian dan mulai dari awal?")) return;
    reset(invoiceFormDefaultValues);
    clearDraft();
    setStatus("idle");
    setSubmitError(null);
  };

  const onSubmit: SubmitHandler<InvoiceFormValues> = async (values) => {
    setStatus("loading");
    setSubmitError(null);
    try {
      const payload = buildInvoicePayload(values);
      const issuer = resolveIssuer(payload);
      if (!issuer) throw new Error("Data pengirim belum lengkap.");

      const { pdf } = await import("@react-pdf/renderer");
      const { InvoicePDF } = await import("@/components/pdf/InvoicePDF");

      const blob = await pdf(InvoicePDF({ payload, issuer })).toBlob();
      downloadBlob(blob, `${payload.invoice_number.replace(/\//g, "-")}.pdf`);

      setStatus("success");
    } catch (err) {
      console.error("Failed to generate invoice PDF:", err);
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.");
      setStatus("error");
    }
  };

  // Cmd/Ctrl+Enter submits from anywhere in the form — a small power-user nicety.
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <FormProvider {...methods}>
      {/* Action toolbar: sample / reset / autosave indicator */}
      <div className="mb-5 flex flex-wrap items-center gap-2 border border-border bg-muted/40 px-3 py-2.5">
        <button
          type="button"
          onClick={loadSample}
          className="inline-flex cursor-pointer items-center gap-1.5 border border-foreground bg-background px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:scale-95"
        >
          <SparkleIcon className="h-3.5 w-3.5" />
          Isi Contoh
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex cursor-pointer items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground transition-colors duration-150 hover:border-destructive hover:text-destructive active:scale-95"
        >
          <RefreshIcon className="h-3.5 w-3.5" />
          Reset
        </button>
        <span
          className={`ml-auto flex items-center gap-1.5 text-[11px] font-medium ${
            saveState === "error" ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              saveState === "error"
                ? "bg-destructive"
                : saveState === "saved"
                ? "bg-success"
                : "bg-border"
            }`}
          />
          {saveState === "error"
            ? "Gagal menyimpan (penyimpanan penuh)"
            : saveState === "saved"
            ? "Tersimpan otomatis"
            : "Belum tersimpan"}
        </span>
      </div>

      {/* Mobile-only tab switch between form and live preview */}
      <div className="mb-4 grid grid-cols-2 gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("form")}
          className={`inline-flex items-center justify-center gap-1.5 border px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${
            mobileTab === "form"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground"
          }`}
        >
          <PencilIcon className="h-3.5 w-3.5" />
          Form
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`inline-flex items-center justify-center gap-1.5 border px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${
            mobileTab === "preview"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground"
          }`}
        >
          <EyeIcon className="h-3.5 w-3.5" />
          Preview
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
          className={`space-y-5 ${mobileTab === "preview" ? "hidden lg:block" : ""}`}
        >
          <IssuerSection />
          <SettingsSection />
          <InvoiceMetaSection />
          <RecipientSection />
          <ItemsSection />
          <PaymentSchemesSection />
          <NotesSection />
          <SignatorySection />

          <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 border-t border-foreground bg-background/95 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-3">
            <GenerateButton status={status} />
            {submitError ? (
              <p className="flex items-center gap-1.5 text-sm text-destructive">{submitError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Dibuat di browser Anda — data tidak dikirim ke server.
                <span className="ml-1 hidden font-mono text-muted-foreground/70 sm:inline">
                  (⌘/Ctrl + Enter)
                </span>
              </p>
            )}
          </div>
        </form>

        <div
          className={`lg:sticky lg:top-24 lg:self-start ${
            mobileTab === "form" ? "hidden lg:block" : ""
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">Preview</h2>
            <span className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
              Live
            </span>
          </div>
          <InvoicePreview payload={previewPayload} issuer={previewIssuer} />

          {/* Mobile: the real submit button lives inside the (now hidden) form,
              so surface a generate action here on the Preview tab. */}
          <div className="mt-4 lg:hidden">
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={status === "loading"}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-foreground bg-foreground px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-background transition-colors hover:border-accent hover:bg-accent active:scale-[0.98] disabled:opacity-70"
            >
              {status === "loading" ? "Membuat PDF…" : "Generate & Unduh PDF"}
            </button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
