import React from "react";
import { useFormContext } from "react-hook-form";

import { TextField } from "../fields/TextField";
import { Card } from "../fields/Card";
import type { InvoiceFormValues } from "@/lib/schema/invoiceForm";

/** Signatory position + name (rendered bottom-right of the invoice). */
export function SignatorySection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  return (
    <Card
      step={8}
      title="Tanda Tangan"
      description="Jabatan dan nama penanggung jawab invoice"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Jabatan"
          placeholder="Kepala Bagian Keuangan"
          {...register("signatory.position")}
          error={errors.signatory?.position?.message}
        />
        <TextField
          label="Nama"
          placeholder="Dr. Siti Aminah, M.M."
          {...register("signatory.name")}
          error={errors.signatory?.name?.message}
        />
      </div>
    </Card>
  );
}
