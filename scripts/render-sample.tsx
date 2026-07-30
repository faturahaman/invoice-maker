/**
 * One-off dev script to smoke-test InvoicePDF end-to-end: builds a sample
 * payload, renders it to a real PDF file, and validates it against the
 * Zod schema first. Not part of the app runtime — safe to delete anytime.
 *
 * Run with: npx tsx scripts/render-sample.tsx
 */
import React from "react";
import { renderToFile } from "@react-pdf/renderer";

import { InvoicePayloadSchema } from "../src/lib/schema/invoice";
import { resolveIssuer } from "../src/lib/templates/registry";
import { InvoicePDF } from "../src/components/pdf/InvoicePDF";

const samplePayload = {
  issuer: {
    name: "SMA Harapan Bangsa",
    foundationName: "Yayasan Pendidikan Nusantara",
    headerTitle: "INVOICE PEMBAYARAN",
    address: "Jl. Merdeka No. 45, Jakarta Pusat 10110",
    contact: "(021) 555-0123 · keuangan@harapanbangsa.sch.id",
  },
  settings: {
    currency: "IDR",
    locale: "id-ID",
    accentColor: "#0F766E",
    tax: { enabled: true, label: "PPN", rate: 11 },
    discount: { enabled: false, label: "Diskon", amount: 0 },
  },
  invoice_number: "INV/2024/05/001",
  date: "2024-05-01",
  recipient: {
    fields: [
      { label: "Nama", value: "Budi Santoso" },
      { label: "NIM/No. Registrasi", value: "2024010045" },
      { label: "Program Studi", value: "Teknik Informatika" },
    ],
  },
  items: [
    { no: 1, description: "Biaya Pendaftaran", amount: 500000, va: "8808123456789" },
    { no: 2, description: "Biaya Pengembangan Institusi", amount: 5000000 },
  ],
  payment_schemes: [
    {
      method: "LUNAS",
      total: 5500000,
      installments: [
        { label: "Sekaligus", amount: 5500000, va: "8808111100002", period: "Mei 2024" },
      ],
    },
    {
      method: "CICILAN",
      total: 5500000,
      installments: [
        { label: "Tahap 1 (60%)", amount: 3300000, va: "8808111100003", period: "Mei 2024" },
        { label: "Tahap 2 (40%)", amount: 2200000, va: "8808111100004", period: "Juli 2024" },
      ],
    },
  ],
  notes: [
    "Pembayaran wajib dilakukan sebelum tanggal jatuh tempo.",
    "Simpan bukti pembayaran sebagai referensi.",
  ],
  signatory: {
    position: "Kepala Bagian Keuangan",
    name: "Dr. Siti Aminah, M.M.",
  },
  output: "pdf" as const,
};

async function main() {
  const payload = InvoicePayloadSchema.parse(samplePayload);
  const issuer = resolveIssuer(payload);
  if (!issuer) throw new Error("no issuer resolved from payload");

  await renderToFile(
    <InvoicePDF payload={payload} issuer={issuer} />,
    "sample-invoice.pdf"
  );

  console.log("Rendered sample-invoice.pdf");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
