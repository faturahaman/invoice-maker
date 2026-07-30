import React from "react";
import { CheckIcon, DownloadIcon, SpinnerIcon, AlertIcon } from "./icons";

/**
 * Submit button with explicit loading/success/error feedback states
 * (per UX guideline: never leave a submit action with no response).
 */
export function GenerateButton({
  status,
}: {
  status: "idle" | "loading" | "success" | "error";
}) {
  const config = {
    idle: { label: "Generate & Unduh PDF", icon: <DownloadIcon className="h-4 w-4" /> },
    loading: { label: "Membuat PDF…", icon: <SpinnerIcon className="h-4 w-4" /> },
    success: { label: "Berhasil diunduh", icon: <CheckIcon className="h-4 w-4" /> },
    error: { label: "Gagal, coba lagi", icon: <AlertIcon className="h-4 w-4" /> },
  } as const;

  const { label, icon } = config[status];

  return (
    <button
      type="submit"
      disabled={status === "loading"}
      className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 border px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto ${
        status === "error"
          ? "border-destructive bg-destructive hover:bg-destructive-700"
          : status === "success"
          ? "border-success bg-success hover:bg-success-600"
          : "border-foreground bg-foreground hover:bg-accent hover:border-accent"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
