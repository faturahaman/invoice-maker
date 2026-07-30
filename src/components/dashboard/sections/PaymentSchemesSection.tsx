import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { TextField } from "../fields/TextField";
import { RemoveButton, AddButton } from "../fields/IconButton";
import { Card } from "../fields/Card";
import type { InvoiceFormValues } from "@/lib/schema/invoiceForm";

/**
 * One payment scheme card, with its own nested `installments` field array.
 * Split out from `PaymentSchemesSection` because a `useFieldArray` for
 * `installments` needs a stable `name` scoped to this specific scheme's
 * index — can't share one hook across all schemes.
 */
function InstallmentsFieldArray({ schemeIndex }: { schemeIndex: number }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `payment_schemes.${schemeIndex}.installments`,
  });

  const schemeErrors = errors.payment_schemes?.[schemeIndex]?.installments;

  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Termin
        </h3>
        <AddButton
          onClick={() => append({ label: "", amount: 0, va: "", period: "" })}
          label="Tambah Termin"
        />
      </div>
      {fields.map((field, instIndex) => (
        <div
          key={field.id}
          className="relative border border-border bg-background p-3 pr-8 animate-fade-in"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Label"
              placeholder="Tahap 1 (60%)"
              {...register(`payment_schemes.${schemeIndex}.installments.${instIndex}.label`)}
              error={schemeErrors?.[instIndex]?.label?.message}
            />
            <TextField
              label="Jumlah"
              type="number"
              min={0}
              prefix="Rp"
              inputMode="numeric"
              placeholder="0"
              {...register(`payment_schemes.${schemeIndex}.installments.${instIndex}.amount`)}
              error={schemeErrors?.[instIndex]?.amount?.message}
            />
            <TextField
              label="No. VA (opsional)"
              placeholder="—"
              {...register(`payment_schemes.${schemeIndex}.installments.${instIndex}.va`)}
            />
            <TextField
              label="Periode"
              placeholder="Mei 2024"
              {...register(`payment_schemes.${schemeIndex}.installments.${instIndex}.period`)}
              error={schemeErrors?.[instIndex]?.period?.message}
            />
          </div>
          {fields.length > 1 ? (
            <div className="absolute right-2 top-2">
              <RemoveButton onClick={() => remove(instIndex)} />
            </div>
          ) : null}
        </div>
      ))}
      {schemeErrors?.message ? (
        <p className="text-xs text-destructive">{schemeErrors.message}</p>
      ) : null}
    </div>
  );
}

/** Optional list of payment schemes (e.g. LUNAS / CICILAN), each with its own installments. */
export function PaymentSchemesSection() {
  const { register, control } = useFormContext<InvoiceFormValues>();

  const { fields, append, remove } = useFieldArray({ control, name: "payment_schemes" });

  return (
    <Card
      step={6}
      title="Skema Pembayaran"
      description="Opsional — mis. pembayaran lunas atau cicilan bertahap"
      action={
        <AddButton
          onClick={() =>
            append({
              method: "",
              total: 0,
              installments: [{ label: "", amount: 0, va: "", period: "" }],
            })
          }
          label="Tambah Skema"
        />
      }
    >
      <div className="space-y-4">
        {fields.map((field, schemeIndex) => (
          <div
            key={field.id}
            className="border border-border bg-muted/40 p-3 animate-fade-in"
          >
            <div className="relative grid grid-cols-1 gap-3 pr-8 sm:grid-cols-2">
              <TextField
                label="Metode"
                placeholder="LUNAS / CICILAN"
                {...register(`payment_schemes.${schemeIndex}.method`)}
              />
              <TextField
                label="Total"
                type="number"
                min={0}
                prefix="Rp"
                inputMode="numeric"
                placeholder="0"
                {...register(`payment_schemes.${schemeIndex}.total`)}
              />
              <div className="absolute right-0 top-0">
                <RemoveButton onClick={() => remove(schemeIndex)} label="Hapus Skema" />
              </div>
            </div>
            <InstallmentsFieldArray schemeIndex={schemeIndex} />
          </div>
        ))}
        {fields.length === 0 ? (
          <p className="border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
            Belum ada skema pembayaran ditambahkan.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
