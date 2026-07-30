import { z } from "zod";

import {
  RecipientFieldSchema,
  SignatorySchema,
  IssuerSchema,
  SettingsSchema,
  InvoicePayloadSchema,
} from "./invoice";

/**
 * Form-facing schema, distinct from `InvoicePayloadSchema` (the API contract).
 *
 * Two fields are deliberately dropped from what the user types and
 * re-derived automatically before building the final payload:
 *  - `items[].no`      -> always sequential, no reason to make users manage it
 *  - `output`           -> the dashboard always renders "pdf" directly client-side
 *
 * `amount`/`total` use z.coerce.number() because HTML number inputs hand
 * react-hook-form strings; the zod resolver coerces them back to numbers
 * before `onSubmit` ever sees the data.
 */
export const FormItemSchema = z.object({
  description: z.string().min(1, "Deskripsi wajib diisi"),
  amount: z.coerce.number().nonnegative("Jumlah tidak boleh negatif"),
  va: z.string().optional(),
});

export const FormInstallmentSchema = z.object({
  label: z.string().min(1, "Label termin wajib diisi"),
  amount: z.coerce.number().nonnegative("Jumlah tidak boleh negatif"),
  va: z.string().optional(),
  period: z.string().min(1, "Periode wajib diisi"),
});

export const FormPaymentSchemeSchema = z.object({
  method: z.string().min(1, "Metode wajib diisi"),
  total: z.coerce.number().nonnegative("Total tidak boleh negatif"),
  installments: z
    .array(FormInstallmentSchema)
    .min(1, "Minimal satu termin diperlukan"),
});

export const InvoiceFormSchema = z.object({
  // Inline, fully-editable sender identity (the redesign's core change).
  issuer: IssuerSchema,
  settings: SettingsSchema,
  invoice_number: z.string().min(1, "Nomor invoice wajib diisi"),
  date: z.string().date("Tanggal wajib diisi"),
  recipient: z.object({
    fields: z.array(RecipientFieldSchema).min(1, "Minimal satu data penerima diperlukan"),
  }),
  items: z.array(FormItemSchema).min(1, "Minimal satu item diperlukan"),
  payment_schemes: z.array(FormPaymentSchemeSchema).optional().default([]),
  notes: z.array(z.string().min(1, "Catatan tidak boleh kosong")).optional().default([]),
  signatory: SignatorySchema,
});

// `payment_schemes`/`notes` are `.optional().default([])`, so Zod's *input*
// type (what react-hook-form's fields actually hold before submit) differs
// from its *output* type (what the resolver hands to onSubmit, with
// defaults already applied). react-hook-form v7.43+ models this with a
// third generic (TTransformedValues) on `useForm`, so both types are
// exported here explicitly instead of collapsing to a single z.infer.
export type InvoiceFormInput = z.input<typeof InvoiceFormSchema>;
export type InvoiceFormValues = z.output<typeof InvoiceFormSchema>;


/**
 * The set of default values react-hook-form starts with. Kept here (not
 * inline in the form component) so it's easy to reuse from tests later.
 */
export const defaultSettings: InvoiceFormInput["settings"] = {
  currency: "IDR",
  locale: "id-ID",
  accentColor: "#0F172A",
  tax: { enabled: false, label: "PPN", rate: 11 },
  discount: { enabled: false, label: "Diskon", amount: 0 },
};

export const invoiceFormDefaultValues: InvoiceFormInput = {
  issuer: {
    name: "",
    foundationName: "",
    headerTitle: "INVOICE",
    address: "",
    contact: "",
    logoDataUri: "",
  },
  settings: defaultSettings,
  invoice_number: "",
  date: new Date().toISOString().slice(0, 10),
  recipient: { fields: [{ label: "Nama", value: "" }] },
  items: [{ description: "", amount: 0, va: "" }],
  payment_schemes: [],
  notes: [],
  signatory: { position: "", name: "" },
};

/**
 * A fully filled-in example, used by the "Isi contoh" (load sample) action so
 * a first-time user can see a complete, realistic invoice — and its live
 * preview — in one click instead of facing an empty form.
 */
export const invoiceFormSampleValues: InvoiceFormInput = {
  issuer: {
    name: "SMA Harapan Bangsa",
    foundationName: "Yayasan Pendidikan Nusantara",
    headerTitle: "INVOICE PEMBAYARAN",
    address: "Jl. Merdeka No. 45, Jakarta Pusat 10110",
    contact: "(021) 555-0123 · keuangan@harapanbangsa.sch.id",
    logoDataUri: "",
  },
  settings: {
    currency: "IDR",
    locale: "id-ID",
    accentColor: "#0F766E",
    tax: { enabled: false, label: "PPN", rate: 11 },
    discount: { enabled: false, label: "Diskon", amount: 0 },
  },
  invoice_number: "INV/2026/07/001",
  date: new Date().toISOString().slice(0, 10),
  recipient: {
    fields: [
      { label: "Nama", value: "Budi Santoso" },
      { label: "Kelas", value: "X IPA 1" },
      { label: "NIS", value: "2026-00123" },
    ],
  },
  items: [
    { description: "Biaya Pendaftaran", amount: 500000, va: "8801234567890" },
    { description: "SPP Bulan Juli", amount: 350000, va: "" },
    { description: "Seragam & Buku", amount: 750000, va: "" },
  ],
  payment_schemes: [
    {
      method: "CICILAN",
      total: 1600000,
      installments: [
        { label: "Tahap 1 (60%)", amount: 960000, va: "8801234567890", period: "Juli 2026" },
        { label: "Tahap 2 (40%)", amount: 640000, va: "8809876543210", period: "Agustus 2026" },
      ],
    },
  ],
  notes: [
    "Pembayaran dapat dilakukan melalui Virtual Account yang tertera.",
    "Simpan bukti pembayaran hingga proses selesai.",
  ],
  signatory: { position: "Kepala Bagian Keuangan", name: "Dr. Siti Aminah, M.M." },
};

/**
 * Derives the final API-shaped `InvoicePayload` from validated form values:
 * injects sequential `no` per item and fixes `output` to "pdf". Re-parses
 * through `InvoicePayloadSchema` so the dashboard and the public API are
 * guaranteed to accept/reject the exact same shape.
 */
export function buildInvoicePayload(values: InvoiceFormValues) {
  return InvoicePayloadSchema.parse({
    ...values,
    items: values.items.map((item, index) => ({ ...item, no: index + 1 })),
    output: "pdf" as const,
  });
}
