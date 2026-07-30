import { z } from "zod";

/**
 * Issuer (the sender/institution) — the identity printed at the top of the
 * invoice. Previously this lived ONLY in a hardcoded server-side registry,
 * which is exactly why users could neither add their own institution nor
 * customize it. It's now a first-class, fully-editable part of the payload.
 *
 * `logoDataUri` is a base64 `data:` URI (uploaded client-side) so a logo can
 * travel with the invoice without any server-side asset storage.
 */
export const IssuerSchema = z.object({
  name: z.string().min(1, "issuer name is required"),
  foundationName: z.string().optional(),
  headerTitle: z.string().min(1, "header title is required").default("INVOICE"),
  address: z.string().min(1, "issuer address is required"),
  contact: z.string().optional(),
  logoDataUri: z
    .string()
    .max(1_200_000, "logo is too large (max ~800 KB image)")
    .refine(
      // Only raster formats @react-pdf/renderer's <Image> can actually decode.
      // SVG and non-image data would throw at render time (500), so reject early.
      (s) => s === "" || /^data:image\/(png|jpe?g|gif|webp);/i.test(s),
      "logo must be a PNG, JPG, GIF, or WebP data URI"
    )
    .optional(),
});

/** Currencies + locales offered in the UI. Any ISO 4217 / BCP-47 pair works. */
export const CURRENCY_OPTIONS = ["IDR", "USD", "EUR", "GBP", "SGD", "MYR", "JPY", "AUD"] as const;
export const LOCALE_OPTIONS = ["id-ID", "en-US", "en-GB", "de-DE", "ms-MY", "ja-JP"] as const;

const HEX_COLOR = /^#([0-9a-fA-F]{6})$/;

/**
 * Presentation + math settings: currency/locale for all money formatting,
 * a brand accent color used across the PDF, and optional tax/discount rows.
 */
export const SettingsSchema = z.object({
  // Constrained to the supported sets so an arbitrary locale/currency can't
  // reach Intl and throw a RangeError mid-render (would 500 the API).
  currency: z.enum(CURRENCY_OPTIONS).default("IDR"),
  locale: z.enum(LOCALE_OPTIONS).default("id-ID"),
  accentColor: z.string().regex(HEX_COLOR, "accentColor must be a #RRGGBB hex").default("#0F172A"),
  tax: z
    .object({
      enabled: z.boolean().default(false),
      label: z.string().default("PPN"),
      rate: z.coerce.number().min(0).max(100).default(0),
    })
    .default({ enabled: false, label: "PPN", rate: 0 }),
  discount: z
    .object({
      enabled: z.boolean().default(false),
      label: z.string().default("Diskon"),
      amount: z.coerce.number().nonnegative().default(0),
    })
    .default({ enabled: false, label: "Diskon", amount: 0 }),
});

/**
 * A single label/value pair used to render the "recipient data" block
 * on the invoice (e.g. { label: "Nama", value: "Budi Santoso" }).
 */
export const RecipientFieldSchema = z.object({
  label: z.string().min(1, "label is required"),
  value: z.string().min(1, "value is required"),
});

/**
 * One row of the invoice's billing/item table.
 */
export const InvoiceItemSchema = z.object({
  no: z.coerce.number().int().positive(),
  description: z.string().min(1, "description is required"),
  amount: z.coerce.number().nonnegative(),
  // Virtual Account number tied to this specific item, if any (optional
  // because not every invoice item is paid via its own VA).
  va: z.string().optional(),
});

/**
 * A single installment ("termin") belonging to a payment scheme.
 */
export const InstallmentSchema = z.object({
  label: z.string().min(1, "label is required"), // e.g. "Sekaligus" / "Tahap 1 (60%)"
  amount: z.coerce.number().nonnegative(),
  va: z.string().optional(),
  period: z.string().min(1, "period is required"),
});

/**
 * One payment scheme (e.g. "LUNAS" or "CICILAN"), grouping its
 * installments explicitly. Rendered in the PDF with `method` + `total`
 * spanning all rows of `installments` (rowspan-like grouping).
 */
export const PaymentSchemeSchema = z.object({
  method: z.string().min(1, "method is required"),
  total: z.coerce.number().nonnegative(),
  installments: z.array(InstallmentSchema).min(1, "at least one installment is required"),
});


/**
 * Signatory block (position + name), rendered near the bottom of the invoice.
 */
export const SignatorySchema = z.object({
  position: z.string().min(1, "position is required"),
  name: z.string().min(1, "name is required"),
});

/**
 * Full payload accepted by the invoice generation API / dashboard form.
 *
 * Identity is supplied EITHER inline via `issuer` (the new, fully-customizable
 * path used by the dashboard) OR by reference via `template_id` (legacy: the
 * server resolves it against the preset registry). At least one must be
 * present — enforced by the `.refine` below so the public API stays backward
 * compatible for existing callers that still send only `template_id`.
 */
export const InvoicePayloadSchema = z
  .object({
    // Inline, editable identity. Preferred.
    issuer: IssuerSchema.optional(),
    // Legacy/reference identity: resolved server-side against presets.
    template_id: z.string().min(1).optional(),

    // Presentation + math settings (currency, accent, tax, discount).
    settings: SettingsSchema.optional().default({}),

    invoice_number: z.string().min(1, "invoice_number is required"),
    // ISO 8601 date string, e.g. "2024-05-01"
    date: z.string().date("date must be an ISO 8601 date (YYYY-MM-DD)"),

    recipient: z.object({
      fields: z
        .array(RecipientFieldSchema)
        .min(1, "at least one recipient field is required")
        .max(50, "too many recipient fields"),
    }),

    items: z
      .array(InvoiceItemSchema)
      .min(1, "at least one item is required")
      .max(200, "too many items (max 200)"),

    // Optional: not every invoice has an installment/payment scheme table.
    payment_schemes: z.array(PaymentSchemeSchema).max(50, "too many payment schemes").optional().default([]),

    // Optional: numbered notes rendered at the bottom of the invoice.
    notes: z.array(z.string().min(1)).max(100, "too many notes").optional().default([]),

    signatory: SignatorySchema,

    output: z.enum(["pdf", "url"]),
  })
  .refine((v) => Boolean(v.issuer) || Boolean(v.template_id), {
    message: "either `issuer` or `template_id` is required",
    path: ["issuer"],
  });

export type Issuer = z.infer<typeof IssuerSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type RecipientField = z.infer<typeof RecipientFieldSchema>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type Installment = z.infer<typeof InstallmentSchema>;
export type PaymentScheme = z.infer<typeof PaymentSchemeSchema>;

export type Signatory = z.infer<typeof SignatorySchema>;
export type InvoicePayload = z.infer<typeof InvoicePayloadSchema>;
