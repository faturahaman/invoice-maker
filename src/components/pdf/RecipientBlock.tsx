import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import type { RecipientField } from "@/lib/schema/invoice";
import type { PdfTheme } from "./InvoicePDF";


/**
 * "Kepada Yth" style block: a list of label/value pairs describing the
 * invoice recipient.
 */
export function RecipientBlock({
  fields,
  theme,
}: {
  fields: RecipientField[];
  theme: PdfTheme;
}) {
  return (
    <View style={styles.recipientBlock}>
      <Text style={[styles.sectionTitle, { color: theme.accent }]}>Data Penerima</Text>
      {fields.map((field, i) => (
        <View key={i} style={styles.recipientRow}>
          <Text style={styles.recipientLabel}>{field.label}</Text>
          <Text style={styles.recipientColon}>:</Text>
          <Text style={styles.recipientValue}>{field.value}</Text>
        </View>
      ))}
    </View>
  );
}
