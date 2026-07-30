import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { TextField } from "../fields/TextField";
import { RemoveButton, AddButton } from "../fields/IconButton";
import { Card } from "../fields/Card";
import type { InvoiceFormValues } from "@/lib/schema/invoiceForm";

/** Optional numbered notes list. react-hook-form treats string[] fields as `{ value: string }[]` internally via useFieldArray. */
export function NotesSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    // react-hook-form's useFieldArray requires array-of-objects; a plain
    // string[] is registered the same way, with each row keyed by field.id.
    name: "notes" as never,
  }) as unknown as {
    fields: { id: string }[];
    append: (value: string) => void;
    remove: (index: number) => void;
  };

  return (
    <Card
      step={7}
      title="Catatan"
      description="Opsional — daftar catatan bernomor di bagian bawah invoice"
      action={<AddButton onClick={() => append("")} label="Tambah Catatan" />}
    >
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2 animate-fade-in">
            <span className="flex h-9 w-6 shrink-0 items-center justify-center pt-6 font-mono text-xs font-semibold text-muted-foreground">
              {index + 1}.
            </span>
            <TextField
              label={`Catatan ${index + 1}`}
              {...register(`notes.${index}` as const)}
              error={errors.notes?.[index]?.message}
            />
            <div className="pt-6">
              <RemoveButton onClick={() => remove(index)} />
            </div>
          </div>
        ))}
        {fields.length === 0 ? (
          <p className="border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
            Belum ada catatan ditambahkan.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
