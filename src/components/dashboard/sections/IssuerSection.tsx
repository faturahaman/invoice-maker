"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { TextField } from "../fields/TextField";
import { Card } from "../fields/Card";
import { TrashIcon, SparkleIcon } from "../icons";
import type { InvoiceFormValues } from "@/lib/schema/invoiceForm";
import type { Issuer } from "@/lib/schema/invoice";
import { listSenders, saveSender, deleteSender, type SavedSender } from "@/lib/senders";
import { listPresets } from "@/lib/templates/registry";

const MAX_LOGO_BYTES = 400 * 1024; // 400 KB — keeps the data URI (and PDF) small.

/**
 * Sender/issuer identity — the section that makes the tool actually
 * customizable. Users type their institution's details, optionally upload a
 * logo, and can save the whole thing as a reusable "sender" (localStorage) to
 * pick again later. Presets provide a starting point. This replaces the old
 * fixed, server-side, single-entry registry.
 */
export function IssuerSection() {
  const {
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  const [senders, setSenders] = useState<SavedSender[]>([]);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const presets = listPresets();

  const logoDataUri = watch("issuer.logoDataUri");

  useEffect(() => {
    setSenders(listSenders());
  }, []);

  const applyIssuer = (issuer: Issuer) => {
    setValue("issuer.name", issuer.name, { shouldValidate: true });
    setValue("issuer.foundationName", issuer.foundationName ?? "");
    setValue("issuer.headerTitle", issuer.headerTitle || "INVOICE", { shouldValidate: true });
    setValue("issuer.address", issuer.address, { shouldValidate: true });
    setValue("issuer.contact", issuer.contact ?? "");
    setValue("issuer.logoDataUri", issuer.logoDataUri ?? "");
  };

  const handlePick = (value: string) => {
    if (!value) return;
    const [kind, id] = value.split(":");
    if (kind === "preset") {
      const preset = presets.find((p) => p.id === id);
      if (preset) applyIssuer(preset.issuer);
    } else if (kind === "saved") {
      const saved = senders.find((s) => s.id === id);
      if (saved) applyIssuer(saved.issuer);
    }
  };

  const handleSave = () => {
    const issuer = getValues("issuer") as Issuer;
    if (!issuer.name.trim()) {
      setLogoError("Isi nama pengirim dulu sebelum menyimpan.");
      return;
    }
    setLogoError(null);
    const { ok, senders: next } = saveSender(issuer);
    setSenders(next);
    if (ok) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } else {
      setLogoError("Gagal menyimpan pengirim — penyimpanan browser penuh.");
    }
  };

  const handleDelete = (id: string) => {
    setSenders(deleteSender(id));
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    // Raster only — @react-pdf/renderer's <Image> can't decode SVG, and the
    // payload schema rejects it, so block it here for immediate feedback.
    if (!/^image\/(png|jpe?g|gif|webp)$/i.test(file.type)) {
      setLogoError("Logo harus PNG, JPG, GIF, atau WebP (SVG tidak didukung).");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Ukuran logo maksimal 400 KB.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setValue("issuer.logoDataUri", String(reader.result), { shouldValidate: true });
    };
    reader.onerror = () => setLogoError("Gagal membaca file logo.");
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setValue("issuer.logoDataUri", "");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Card
      step={1}
      title="Pengirim"
      description="Identitas instansi yang menerbitkan invoice — bisa disimpan & dipakai lagi"
    >
      {/* Preset / saved sender picker + save action */}
      <div className="mb-4 flex flex-wrap items-end gap-2 border border-border bg-muted/40 p-3">
        <label className="flex-1 text-sm">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-foreground">
            Pilih Pengirim Tersimpan / Contoh
          </span>
          <select
            defaultValue=""
            onChange={(e) => handlePick(e.target.value)}
            className="w-full appearance-none rounded-none border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
          >
            <option value="">— pilih untuk mengisi otomatis —</option>
            {senders.length > 0 ? (
              <optgroup label="Tersimpan">
                {senders.map((s) => (
                  <option key={s.id} value={`saved:${s.id}`}>
                    {s.issuer.name || "(tanpa nama)"}
                  </option>
                ))}
              </optgroup>
            ) : null}
            <optgroup label="Contoh">
              {presets.map((p) => (
                <option key={p.id} value={`preset:${p.id}`}>
                  {p.label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex cursor-pointer items-center gap-1.5 border border-foreground bg-background px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background active:scale-95"
        >
          <SparkleIcon className="h-3.5 w-3.5" />
          {justSaved ? "Tersimpan!" : "Simpan Pengirim"}
        </button>
      </div>

      {/* Saved-sender chips with delete */}
      {senders.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {senders.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 border border-border bg-background px-2.5 py-1 text-xs text-foreground"
            >
              <button
                type="button"
                onClick={() => applyIssuer(s.issuer)}
                className="cursor-pointer font-medium hover:text-accent"
                title="Pakai pengirim ini"
              >
                {s.issuer.name || "(tanpa nama)"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                aria-label={`Hapus ${s.issuer.name}`}
                title="Hapus"
                className="cursor-pointer text-muted-foreground hover:text-destructive"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Nama Instansi"
          placeholder="SMA Harapan Bangsa"
          {...register("issuer.name")}
          error={errors.issuer?.name?.message}
        />
        <TextField
          label="Yayasan (opsional)"
          placeholder="Yayasan Pendidikan Nusantara"
          {...register("issuer.foundationName")}
        />
        <TextField
          label="Judul Header"
          placeholder="INVOICE"
          {...register("issuer.headerTitle")}
          error={errors.issuer?.headerTitle?.message}
          hint="Teks besar di bawah header, mis. INVOICE PEMBAYARAN"
        />
        <TextField
          label="Kontak (opsional)"
          placeholder="(021) 555-0123 · email@instansi.id"
          {...register("issuer.contact")}
        />
        <div className="sm:col-span-2">
          <TextField
            label="Alamat"
            placeholder="Jl. Merdeka No. 45, Jakarta Pusat 10110"
            {...register("issuer.address")}
            error={errors.issuer?.address?.message}
          />
        </div>
      </div>

      {/* Logo upload */}
      <div className="mt-4 border-t border-border pt-4">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-foreground">
          Logo (opsional)
        </span>
        <div className="flex items-center gap-3">
          {logoDataUri ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoDataUri}
              alt="Logo pengirim"
              className="h-14 w-14 border border-border object-contain"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center border border-dashed border-border text-[10px] text-muted-foreground">
              None
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleLogo}
              className="block text-xs text-muted-foreground file:mr-3 file:cursor-pointer file:border file:border-foreground file:bg-background file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:uppercase file:tracking-wide file:text-foreground hover:file:bg-foreground hover:file:text-background"
            />
            {logoDataUri ? (
              <button
                type="button"
                onClick={clearLogo}
                className="w-fit cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-destructive"
              >
                Hapus logo
              </button>
            ) : null}
          </div>
        </div>
        {logoError ? <p className="mt-2 text-xs text-destructive">{logoError}</p> : null}
      </div>
    </Card>
  );
}
