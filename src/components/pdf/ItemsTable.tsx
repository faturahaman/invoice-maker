import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import { computeTotals } from "@/lib/format";
import type { InvoiceItem, Settings } from "@/lib/schema/invoice";
import type { PdfTheme } from "./InvoicePDF";


/**
 * Billing/item table: No | Deskripsi | VA | Jumlah, followed by a
 * subtotal → tax → discount → grand-total summary (rows that are only
 * emitted when the corresponding setting is enabled).
 *
 * Column widths are expressed as flex ratios so the table always fills
 * the page width regardless of content length.
 */
const COL = {
  no: 0.08,
  description: 0.52,
  va: 0.2,
  amount: 0.2,
};

/** A right-aligned summary row (label spanning the left, value on the right). */
function SummaryRow({
  label,
  value,
  bold,
  theme,
}: {
  label: string;
  value: string;
  bold?: boolean;
  theme: PdfTheme;
}) {
  return (
    <View style={styles.tableRow}>
      <Text
        style={[
          styles.tableCell,
          styles.tableCellRight,
          {
            flexBasis: `${(COL.no + COL.description + COL.va) * 100}%`,
            fontFamily: bold ? "Helvetica-Bold" : "Helvetica",
            ...(bold ? { color: theme.accent } : {}),
          },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.tableCell,
          styles.tableCellRight,
          {
            flexBasis: `${COL.amount * 100}%`,
            borderRightWidth: 0,
            fontFamily: bold ? "Helvetica-Bold" : "Helvetica",
            ...(bold ? { color: theme.accent } : {}),
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function ItemsTable({
  items,
  settings,
  theme,
}: {
  items: InvoiceItem[];
  settings: Settings;
  theme: PdfTheme;
}) {
  const totals = computeTotals(items, settings);
  const showBreakdown = settings.tax.enabled || settings.discount.enabled;

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.accent }]}>Rincian Tagihan</Text>
      <View style={[styles.table, { borderColor: theme.accent }]}>
        <View style={styles.tableRow}>
          <Text
            style={[
              styles.tableHeaderCell,
              styles.tableCellCenter,
              { flexBasis: `${COL.no * 100}%`, backgroundColor: theme.accent, color: "#ffffff" },
            ]}
          >
            No
          </Text>
          <Text
            style={[
              styles.tableHeaderCell,
              { flexBasis: `${COL.description * 100}%`, backgroundColor: theme.accent, color: "#ffffff" },
            ]}
          >
            Deskripsi
          </Text>
          <Text
            style={[
              styles.tableHeaderCell,
              { flexBasis: `${COL.va * 100}%`, backgroundColor: theme.accent, color: "#ffffff" },
            ]}
          >
            No. VA
          </Text>
          <Text
            style={[
              styles.tableHeaderCell,
              styles.tableCellRight,
              {
                flexBasis: `${COL.amount * 100}%`,
                borderRightWidth: 0,
                backgroundColor: theme.accent,
                color: "#ffffff",
              },
            ]}
          >
            Jumlah
          </Text>
        </View>

        {items.map((item) => (
          <View key={item.no} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableCellCenter, { flexBasis: `${COL.no * 100}%` }]}>
              {item.no}
            </Text>
            <Text style={[styles.tableCell, { flexBasis: `${COL.description * 100}%` }]}>
              {item.description}
            </Text>
            <Text style={[styles.tableCell, { flexBasis: `${COL.va * 100}%` }]}>
              {item.va ?? "-"}
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.tableCellRight,
                { flexBasis: `${COL.amount * 100}%`, borderRightWidth: 0 },
              ]}
            >
              {theme.money(item.amount)}
            </Text>
          </View>
        ))}

        {/* Subtotal is only interesting when a tax/discount breakdown follows;
            otherwise the single grand-total row reads as "Total". */}
        {showBreakdown ? (
          <SummaryRow label="Subtotal" value={theme.money(totals.subtotal)} theme={theme} />
        ) : null}
        {settings.tax.enabled ? (
          <SummaryRow
            label={`${settings.tax.label} (${settings.tax.rate}%)`}
            value={theme.money(totals.taxAmount)}
            theme={theme}
          />
        ) : null}
        {settings.discount.enabled ? (
          <SummaryRow
            label={settings.discount.label}
            value={`− ${theme.money(totals.discountAmount)}`}
            theme={theme}
          />
        ) : null}
        <SummaryRow label="Total" value={theme.money(totals.grandTotal)} bold theme={theme} />
      </View>
    </View>
  );
}
