import React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { TextField } from "../fields/TextField";
import { RemoveButton, AddButton } from "../fields/IconButton";
import { Card } from "../fields/Card";
import type { InvoiceFormValues } from "@/lib/schema/invoiceForm";
import { formatMoney, computeTotals } from "@/lib/format";

/** Live per-row formatted amount (e.g. "= Rp500.000") under the amount input. */
function AmountEcho({ index }: { index: number }) {
  const value = useWatch<InvoiceFormValues>({ name: `items.${index}.amount` });
  const currency = useWatch<InvoiceFormValues>({ name: "settings.currency" }) as string;
  const locale = useWatch<InvoiceFormValues>({ name: "settings.locale" }) as string;
  const n = Number(value) || 0;
  if (n <= 0) return null;
  return (
    <span className="mt-1 block font-mono text-xs text-muted-foreground">
      = {formatMoney(n, currency || "IDR", locale || "id-ID")}
    </span>
  );
}

/**
 * Live totals footer: subtotal → tax → discount → grand total, matching the
 * PDF exactly (both call `computeTotals`). Rows for tax/discount appear only
 * when enabled in settings.
 */
function ItemsTotal() {
  const items = useWatch<InvoiceFormValues>({ name: "items" }) as InvoiceFormValues["items"];
  const settings = useWatch<InvoiceFormValues>({ name: "settings" }) as InvoiceFormValues["settings"];
  const money = (n: number) =>
    formatMoney(n, settings?.currency || "IDR", settings?.locale || "id-ID");
  const t = computeTotals(items ?? [], settings);
  const showBreakdown = settings?.tax?.enabled || settings?.discount?.enabled;

  return (
    <div className="mt-4 space-y-1.5 border-t border-foreground pt-3">
      {showBreakdown ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-mono">{money(t.subtotal)}</span>
        </div>
      ) : null}
      {settings?.tax?.enabled ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {settings.tax.label} ({settings.tax.rate}%)
          </span>
          <span className="font-mono">{money(t.taxAmount)}</span>
        </div>
      ) : null}
      {settings?.discount?.enabled ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{settings.discount.label}</span>
          <span className="font-mono">− {money(t.discountAmount)}</span>
        </div>
      ) : null}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wide text-foreground">
          Total Tagihan
        </span>
        <span className="font-mono text-base font-bold text-foreground">{money(t.grandTotal)}</span>
      </div>
    </div>
  );
}

/** Dynamic list of billing items (No is auto-derived from array position). */
export function ItemsSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <Card
      step={5}
      title="Rincian Tagihan"
      description="Daftar item yang ditagihkan"
      action={
        <AddButton
          onClick={() => append({ description: "", amount: 0, va: "" })}
          label="Tambah Item"
        />
      }
    >
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative border border-border bg-muted/40 p-3 pl-9 animate-fade-in"
          >
            <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center border border-foreground/20 bg-background font-mono text-[11px] font-semibold text-muted-foreground">
              {index + 1}
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="sm:col-span-6">
                <TextField
                  label="Deskripsi"
                  placeholder="Biaya Pendaftaran"
                  {...register(`items.${index}.description`)}
                  error={errors.items?.[index]?.description?.message}
                />
              </div>
              <div className="sm:col-span-3">
                <TextField
                  label="Jumlah"
                  type="number"
                  min={0}
                  prefix="Rp"
                  inputMode="numeric"
                  placeholder="0"
                  {...register(`items.${index}.amount`)}
                  error={errors.items?.[index]?.amount?.message}
                />
                <AmountEcho index={index} />
              </div>
              <div className="sm:col-span-3">
                <TextField
                  label="No. VA (opsional)"
                  placeholder="—"
                  {...register(`items.${index}.va`)}
                  error={errors.items?.[index]?.va?.message}
                />
              </div>
            </div>
            {fields.length > 1 ? (
              <div className="absolute right-2 top-2">
                <RemoveButton onClick={() => remove(index)} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {errors.items?.message ? (
        <p className="mt-2 text-xs text-destructive">{errors.items.message}</p>
      ) : null}
      <ItemsTotal />
    </Card>
  );
}
