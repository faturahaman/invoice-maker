import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { TextField } from "../fields/TextField";
import { RemoveButton, AddButton } from "../fields/IconButton";
import { Card } from "../fields/Card";
import type { InvoiceFormValues } from "@/lib/schema/invoiceForm";

/** Dynamic list of label/value pairs describing the invoice recipient. */
export function RecipientSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipient.fields",
  });

  return (
    <Card
      step={4}
      title="Data Penerima"
      description="Informasi pihak yang menerima invoice"
      action={<AddButton onClick={() => append({ label: "", value: "" })} label="Tambah Data" />}
    >
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative border border-border bg-muted/40 p-3 animate-fade-in"
          >
            <div className="grid grid-cols-1 gap-3 pr-8 sm:grid-cols-2">
              <TextField
                label="Label"
                placeholder="Nama"
                {...register(`recipient.fields.${index}.label`)}
                error={errors.recipient?.fields?.[index]?.label?.message}
              />
              <TextField
                label="Nilai"
                placeholder="Budi Santoso"
                {...register(`recipient.fields.${index}.value`)}
                error={errors.recipient?.fields?.[index]?.value?.message}
              />
            </div>
            {fields.length > 1 ? (
              <div className="absolute right-2 top-2">
                <RemoveButton onClick={() => remove(index)} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {errors.recipient?.fields?.message ? (
        <p className="mt-2 text-xs text-destructive">{errors.recipient.fields.message}</p>
      ) : null}
    </Card>
  );
}
