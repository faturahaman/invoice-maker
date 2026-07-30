import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import type { Signatory } from "@/lib/schema/invoice";


/** Signatory block: position above, blank space for signature, name (underlined) below. */
export function SignatureBlock({ signatory }: { signatory: Signatory }) {
  return (
    <View style={styles.signatureBlock}>
      <View style={styles.signatureInner}>
        <Text style={styles.signaturePosition}>{signatory.position}</Text>
        <View style={styles.signatureSpacer} />
        <Text style={styles.signatureName}>{signatory.name}</Text>
      </View>
    </View>
  );
}
