import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";

import { styles } from "./styles";
import type { Issuer } from "@/lib/schema/invoice";
import type { PdfTheme } from "./InvoicePDF";

/**
 * Issuer header: logo + foundation name + institution name + address,
 * center-aligned, with the accent-colored bottom rule from `theme`.
 * All fields come from the user-editable `issuer` — no fixed registry.
 */
export function Header({ issuer, theme }: { issuer: Issuer; theme: PdfTheme }) {
  const hasLogo = Boolean(issuer.logoDataUri && issuer.logoDataUri.length > 0);
  return (
    <View style={[styles.headerContainer, { borderBottomColor: theme.accent }]}>
      {/* This is @react-pdf/renderer's <Image>, a PDF primitive with no `alt`
          concept — not an <img>/next Image, so the a11y rule doesn't apply. */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      {hasLogo ? <Image src={issuer.logoDataUri} style={styles.logo} /> : null}
      {issuer.foundationName ? (
        <Text style={styles.foundationName}>{issuer.foundationName}</Text>
      ) : null}
      <Text style={[styles.institutionName, { color: theme.accent }]}>{issuer.name}</Text>
      <Text style={styles.institutionAddress}>{issuer.address}</Text>
      {issuer.contact ? (
        <Text style={styles.institutionAddress}>{issuer.contact}</Text>
      ) : null}
    </View>
  );
}
