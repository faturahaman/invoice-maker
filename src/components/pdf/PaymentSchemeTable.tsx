import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import type { PaymentScheme } from "@/lib/schema/invoice";
import type { PdfTheme } from "./InvoicePDF";


/**
 * Payment scheme table: Metode | Total | (Termin | Jumlah | VA | Periode).
 *
 * `method` and `total` are rendered once per scheme and vertically centered
 * across the height of all its installment rows (react-pdf has no native
 * rowspan, so this is emulated with a fixed-width side column + a nested
 * column of installment rows next to it).
 */
const COL = {
  method: 0.18,
  total: 0.17,
  label: 0.2,
  amount: 0.2,
  va: 0.13,
  period: 0.12,
};

export function PaymentSchemeTable({
  schemes,
  theme,
}: {
  schemes: PaymentScheme[];
  theme: PdfTheme;
}) {
  if (schemes.length === 0) return null;

  const headCell = { backgroundColor: theme.accent, color: "#ffffff" };

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.accent }]}>Skema Pembayaran</Text>
      <View style={[styles.table, { borderColor: theme.accent }]}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeaderCell, headCell, { flexBasis: `${COL.method * 100}%` }]}>Metode</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellRight, headCell, { flexBasis: `${COL.total * 100}%` }]}>
            Total
          </Text>
          <Text style={[styles.tableHeaderCell, headCell, { flexBasis: `${COL.label * 100}%` }]}>Termin</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellRight, headCell, { flexBasis: `${COL.amount * 100}%` }]}>
            Jumlah
          </Text>
          <Text style={[styles.tableHeaderCell, headCell, { flexBasis: `${COL.va * 100}%` }]}>No. VA</Text>
          <Text
            style={[
              styles.tableHeaderCell,
              headCell,
              { flexBasis: `${COL.period * 100}%`, borderRightWidth: 0 },
            ]}
          >
            Periode
          </Text>
        </View>

        {schemes.map((scheme, schemeIdx) => (
          <View key={schemeIdx} style={styles.schemeGroupRow}>
            {/* method + total: span across all installment rows of this scheme */}
            <Text style={[styles.schemeSpanCell, { flexBasis: `${COL.method * 100}%` }]}>
              {scheme.method}
            </Text>
            <Text
              style={[
                styles.schemeSpanCell,
                styles.tableCellRight,
                { flexBasis: `${COL.total * 100}%`, fontFamily: "Helvetica-Bold" },
              ]}
            >
              {theme.money(scheme.total)}
            </Text>

            {/* installments: stacked rows next to the spanned method/total cells */}
            <View style={[styles.schemeInstallmentsColumn, { flexBasis: `${(COL.label + COL.amount + COL.va + COL.period) * 100}%` }]}>
              {scheme.installments.map((inst, instIdx) => (
                <View key={instIdx} style={styles.tableRow}>
                  <Text
                    style={[
                      styles.tableCell,
                      { flexBasis: `${(COL.label / (COL.label + COL.amount + COL.va + COL.period)) * 100}%` },
                    ]}
                  >
                    {inst.label}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableCellRight,
                      { flexBasis: `${(COL.amount / (COL.label + COL.amount + COL.va + COL.period)) * 100}%` },
                    ]}
                  >
                    {theme.money(inst.amount)}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { flexBasis: `${(COL.va / (COL.label + COL.amount + COL.va + COL.period)) * 100}%` },
                    ]}
                  >
                    {inst.va ?? "-"}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flexBasis: `${(COL.period / (COL.label + COL.amount + COL.va + COL.period)) * 100}%`,
                        borderRightWidth: 0,
                      },
                    ]}
                  >
                    {inst.period}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
