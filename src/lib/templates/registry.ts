import type { Issuer, InvoicePayload } from "@/lib/schema/invoice";

/**
 * Issuer presets — starter identities, NOT the only source of truth anymore.
 *
 * The architecture changed: identity is now a first-class, user-editable part
 * of the invoice (`payload.issuer`). Presets exist only as (a) convenient
 * starting points the dashboard can offer, and (b) a back-compat resolution
 * target for the legacy public-API `template_id` field. End users are no
 * longer limited to what's registered here — they can create, edit, and save
 * their own senders entirely client-side (see `src/lib/senders.ts`).
 */
export interface Preset {
  id: string;
  /** Human label for the preset picker. */
  label: string;
  issuer: Issuer;
}

const PRESETS: Preset[] = [
  {
    id: "default",
    label: "Contoh Instansi",
    issuer: {
      name: "Nama Instansi",
      foundationName: "Yayasan Contoh",
      headerTitle: "INVOICE",
      address: "Alamat lengkap instansi, Kota, Kode Pos",
      contact: "(021) 000-0000 · info@example.org",
      logoDataUri: "",
    },
  },
  {
    id: "blank",
    label: "Kosong (isi sendiri)",
    issuer: {
      name: "",
      foundationName: "",
      headerTitle: "INVOICE",
      address: "",
      contact: "",
      logoDataUri: "",
    },
  },
];

export function listPresets(): Preset[] {
  return PRESETS;
}

export function getPreset(id: string): Preset | null {
  return PRESETS.find((p) => p.id === id) ?? null;
}

/**
 * Resolves the concrete issuer to render, from either source:
 *  1. an inline `payload.issuer` (preferred, fully editable), or
 *  2. a legacy `payload.template_id` looked up against the presets.
 *
 * Returns null only when neither yields an identity — the API surfaces that
 * as a 422 (`UNKNOWN_TEMPLATE`). The Zod `.refine` already guarantees at
 * least one field is present, so this is the last defensive check.
 */
export function resolveIssuer(payload: Pick<InvoicePayload, "issuer" | "template_id">): Issuer | null {
  if (payload.issuer) return payload.issuer;
  if (payload.template_id) {
    const preset = getPreset(payload.template_id);
    if (preset) return preset.issuer;
  }
  return null;
}
