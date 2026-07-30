import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import type { PdfTheme } from "./InvoicePDF";


/** Numbered list of free-form notes rendered below the tables. */
export function Notes({ notes, theme }: { notes: string[]; theme: PdfTheme }) {
  if (notes.length === 0) return null;

  return (
    <View style={styles.notesBlock}>
      <Text style={[styles.sectionTitle, { color: theme.accent }]}>Catatan</Text>
      {notes.map((note, i) => (
        <View key={i} style={styles.noteRow}>
          <Text style={styles.noteIndex}>{i + 1}.</Text>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      ))}
    </View>
  );
}
