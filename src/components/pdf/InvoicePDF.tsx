import React from "react";
import { Document, Page } from "@react-pdf/renderer";

import { styles } from "./styles";
import { Header } from "./Header";
import { DocumentInfo } from "./DocumentInfo";
import { RecipientBlock } from "./RecipientBlock";
import { ItemsTable } from "./ItemsTable";
import { PaymentSchemeTable } from "./PaymentSchemeTable";
import { Notes } from "./Notes";
import { SignatureBlock } from "./SignatureBlock";
import type { InvoicePayload, Issuer, Settings } from "@/lib/schema/invoice";
import { formatMoney } from "@/lib/format";

/**
 * Per-invoice theme derived from `settings`: a money formatter bound to the
 * chosen currency/locale, plus the brand accent color. Passed down to every
 * section so the whole document formats money and colors consistently — no
 * component re-derives these on its own.
 */
export interface PdfTheme {
  accent: string;
  locale: string;
  money: (n: number) => string;
}

/**
 * Root PDF document. Composes all invoice sections in order:
 * issuer header -> document info -> recipient -> items ->
 * payment schemes (optional) -> notes (optional) -> signature.
 *
 * Identity now comes from an inline `issuer` (fully editable) rather than a
 * fixed server-side registry entry. Kept as a pure, side-effect-free
 * component so it can be reused server-side (renderToBuffer, in the API route)
 * and client-side (PDFViewer, in the dashboard preview).
 */
export function InvoicePDF({
  payload,
  issuer,
}: {
  payload: InvoicePayload;
  issuer: Issuer;
}) {
  const settings: Settings = payload.settings;
  const theme: PdfTheme = {
    accent: settings.accentColor,
    locale: settings.locale,
    money: (n: number) => formatMoney(n, settings.currency, settings.locale),
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header issuer={issuer} theme={theme} />
        <DocumentInfo
          title={issuer.headerTitle}
          invoiceNumber={payload.invoice_number}
          date={payload.date}
          theme={theme}
        />
        <RecipientBlock fields={payload.recipient.fields} theme={theme} />
        <ItemsTable items={payload.items} settings={settings} theme={theme} />
        <PaymentSchemeTable schemes={payload.payment_schemes} theme={theme} />
        <Notes notes={payload.notes} theme={theme} />
        <SignatureBlock signatory={payload.signatory} />
      </Page>
    </Document>
  );
}
