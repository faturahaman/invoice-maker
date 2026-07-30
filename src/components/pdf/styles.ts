import { StyleSheet } from "@react-pdf/renderer";


/**
 * Shared style tokens + StyleSheet used across all InvoicePDF sub-components.
 * react-pdf has its own layout engine (flexbox-based) — Tailwind classes
 * don't apply here, so styles are centralized in this file to keep the
 * visual language consistent across sections.
 */

export const colors = {
  text: "#1a1a1a",
  muted: "#555555",
  border: "#333333",
  borderLight: "#cccccc",
  headerBg: "#f2f2f2",
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    color: colors.text,
    fontFamily: "Helvetica",
  },

  // ---- Header (institution) ----
  headerContainer: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: 6,
  },
  foundationName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  institutionName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  institutionAddress: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 2,
  },

  // ---- Document title / invoice info ----
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  docTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  infoBlock: {
    alignItems: "flex-end",
  },
  infoRow: {
    flexDirection: "row",
  },
  infoLabel: {
    fontSize: 9,
    color: colors.muted,
    width: 70,
    textAlign: "right",
    marginRight: 6,
  },
  infoValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },

  // ---- Section heading ----
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    marginTop: 14,
    textTransform: "uppercase",
  },

  // ---- Recipient fields ----
  recipientBlock: {
    marginBottom: 4,
  },
  recipientRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  recipientLabel: {
    width: 110,
    fontSize: 9,
    color: colors.muted,
  },
  recipientColon: {
    width: 10,
    fontSize: 9,
    color: colors.muted,
  },
  recipientValue: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },

  // ---- Tables (shared) ----
  table: {
    display: "flex",
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableHeaderCell: {
    backgroundColor: colors.headerBg,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCell: {
    fontSize: 8.5,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableCellLast: {
    fontSize: 8.5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableCellRight: {
    textAlign: "right",
  },
  tableCellCenter: {
    textAlign: "center",
  },

  // ---- Payment scheme table (rowspan-like grouping) ----
  schemeGroupRow: {
    flexDirection: "row",
  },
  schemeSpanCell: {
    fontSize: 8.5,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  schemeInstallmentsColumn: {
    flexDirection: "column",
  },

  // ---- Notes ----

  notesBlock: {
    marginTop: 8,
  },
  noteRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  noteIndex: {
    width: 14,
    fontSize: 8.5,
  },
  noteText: {
    flex: 1,
    fontSize: 8.5,
  },

  // ---- Signature ----
  signatureBlock: {
    marginTop: 30,
    alignItems: "flex-end",
  },
  signatureInner: {
    width: 200,
    alignItems: "center",
  },
  signaturePosition: {
    fontSize: 9,
  },
  signatureSpacer: {
    height: 50,
  },
  signatureName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
  },
});
