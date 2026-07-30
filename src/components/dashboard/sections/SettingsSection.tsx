"use client";

import React from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { TextField } from "../fields/TextField";
import { SelectField } from "../fields/SelectField";
import { Card } from "../fields/Card";
import type { InvoiceFormValues } from "@/lib/schema/invoiceForm";
import { CURRENCY_OPTIONS, LOCALE_OPTIONS } from "@/lib/schema/invoice";

const ACCENT_SWATCHES = [
  "#0F172A", // slate
  "#0F766E", // teal
  "#1D4ED8", // blue
  "#B91C1C", // red
  "#C2410C", // orange
  "#6D28D9", // violet
  "#047857", // green
  "#0A0A0A", // black
];

/**
 * Presentation & math settings: currency/locale for all money formatting, a
 * brand accent color propagated into the PDF, and optional tax/discount rows.
 * None of this existed before — the invoice was hardcoded to Rupiah with no
 * theming and no tax math.
 */
export function SettingsSection() {
  const { register, setValue, control } = useFormContext<InvoiceFormValues>();

  const accent = useWatch({ control, name: "settings.accentColor" });
  const taxEnabled = useWatch({ control, name: "settings.tax.enabled" });
  const discountEnabled = useWatch({ control, name: "settings.discount.enabled" });

  return (
    <Card
      step={2}
      title="Tampilan & Perhitungan"
      description="Mata uang, warna aksen, pajak & diskon"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Mata Uang"
          options={CURRENCY_OPTIONS.map((c) => ({ value: c, label: c }))}
          {...register("settings.currency")}
        />
        <SelectField
          label="Format Angka / Tanggal (Locale)"
          options={LOCALE_OPTIONS.map((l) => ({ value: l, label: l }))}
          {...register("settings.locale")}
        />
      </div>

      {/* Accent color */}
      <div className="mt-4">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-foreground">
          Warna Aksen
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {ACCENT_SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue("settings.accentColor", c, { shouldValidate: true })}
              aria-label={`Warna ${c}`}
              className={`h-8 w-8 border-2 transition-transform active:scale-90 ${
                accent?.toLowerCase() === c.toLowerCase()
                  ? "border-foreground"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <label className="ml-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="color"
              value={accent || "#0F172A"}
              onChange={(e) =>
                setValue("settings.accentColor", e.target.value, { shouldValidate: true })
              }
              className="h-8 w-10 cursor-pointer border border-border bg-background p-0.5"
            />
            <span className="font-mono">{accent}</span>
          </label>
        </div>
      </div>

      {/* Tax + discount toggles */}
      <div className="mt-5 space-y-4 border-t border-border pt-4">
        <div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              {...register("settings.tax.enabled")}
              className="h-4 w-4 cursor-pointer accent-foreground"
            />
            <span className="text-[11px] font-bold uppercase tracking-wide text-foreground">
              Aktifkan Pajak
            </span>
          </label>
          {taxEnabled ? (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Label Pajak" placeholder="PPN" {...register("settings.tax.label")} />
              <TextField
                label="Tarif (%)"
                type="number"
                min={0}
                max={100}
                step="0.1"
                inputMode="decimal"
                {...register("settings.tax.rate")}
              />
            </div>
          ) : null}
        </div>

        <div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              {...register("settings.discount.enabled")}
              className="h-4 w-4 cursor-pointer accent-foreground"
            />
            <span className="text-[11px] font-bold uppercase tracking-wide text-foreground">
              Aktifkan Diskon
            </span>
          </label>
          {discountEnabled ? (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Label Diskon"
                placeholder="Diskon"
                {...register("settings.discount.label")}
              />
              <TextField
                label="Nominal"
                type="number"
                min={0}
                prefix="Rp"
                inputMode="numeric"
                {...register("settings.discount.amount")}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
