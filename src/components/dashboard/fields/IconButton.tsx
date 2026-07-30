import React from "react";
import { PlusIcon, TrashIcon } from "../icons";

/** Small icon-based remove action button, used per-row inside dynamic field arrays. */
export function RemoveButton({ onClick, label = "Hapus" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="group flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border border-transparent text-muted-foreground transition-colors duration-150 hover:border-destructive hover:bg-destructive-50 hover:text-destructive-600 active:scale-95"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 border border-foreground bg-background px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:scale-95"
    >
      <PlusIcon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
