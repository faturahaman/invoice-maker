import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import { formatDate } from "@/lib/format";
import type { PdfTheme } from "./InvoicePDF";

/**
 * Document title (left) + invoice number/date info block (right).
 */
export function DocumentInfo({
  title,
  invoiceNumber,
  date,
  theme,
}: {
  title: string;
  invoiceNumber: string;
  date: string;
  theme: PdfTheme;
}) {
  return (
    <View style={styles.titleRow}>
      <Text style={[styles.docTitle, { color: theme.accent }]}>{title}</Text>
      <View style={styles.infoBlock}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>No. Invoice</Text>
          <Text style={styles.infoValue}>{invoiceNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tanggal</Text>
          <Text style={styles.infoValue}>{formatDate(date, theme.locale)}</Text>
        </View>
      </View>
    </View>
  );
}
