import React from "react";
import { useFormContext } from "react-hook-form";

import { TextField } from "../fields/TextField";
import { Card } from "../fields/Card";
import type { InvoiceFormValues } from "@/lib/schema/invoiceForm";

/** Invoice number + issue date. (Identity moved to IssuerSection.) */
export function InvoiceMetaSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  return (
    <Card step={3} title="Informasi Invoice" description="Nomor dan tanggal penerbitan">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Nomor Invoice"
          placeholder="INV/2026/07/001"
          {...register("invoice_number")}
          error={errors.invoice_number?.message}
        />
        <TextField
          label="Tanggal"
          type="date"
          {...register("date")}
          error={errors.date?.message}
        />
      </div>
    </Card>
  );
}
