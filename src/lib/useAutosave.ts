"use client";

import { useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { InvoiceFormInput } from "@/lib/schema/invoiceForm";

const STORAGE_KEY = "invoice-maker:draft:v2";
const DEBOUNCE_MS = 600;

type Methods = UseFormReturn<InvoiceFormInput, unknown, never>;

export type AutosaveState = "idle" | "saved" | "error";

/**
 * Persists the in-progress form to localStorage so a refresh (or an
 * accidental tab close) never loses work — the #1 frustration with any
 * single-page form tool. Restores once on mount, then debounces writes on
 * every change.
 *
 * Returns:
 *  - `state`      — "saved" once persisted, "error" if the browser rejected
 *                   the write (e.g. QuotaExceededError). The UI must NOT claim
 *                   "saved" on error, which was a real data-loss footgun.
 *  - `savedAt`    — timestamp of the last successful write.
 *  - `clearDraft` — wipe the saved draft. Suppresses the pending debounced
 *                   write so a `reset()`-triggered save can't immediately
 *                   re-persist the draft we just cleared (a race the previous
 *                   version had).
 */
export function useAutosave(methods: Pick<Methods, "watch" | "reset">) {
  const [restored, setRestored] = useState(false);
  const [state, setState] = useState<AutosaveState>("idle");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped by clearDraft so an already-scheduled write knows to no-op.
  const suppressUntil = useRef(0);

  // Restore a saved draft exactly once, before wiring up the save watcher.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as InvoiceFormInput;
        methods.reset(draft, { keepDefaultValues: true });
        setState("saved");
        setSavedAt(Date.now());
      }
    } catch {
      // Corrupt/blocked storage — silently fall back to defaults.
    }
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced persistence on every field change.
  useEffect(() => {
    if (!restored) return;
    const subscription = methods.watch((values) => {
      if (timer.current) clearTimeout(timer.current);
      const scheduledAt = Date.now();
      timer.current = setTimeout(() => {
        // A clearDraft() that happened after this write was scheduled wins.
        if (scheduledAt < suppressUntil.current) return;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
          setState("saved");
          setSavedAt(Date.now());
        } catch {
          // Quota exceeded / storage blocked — surface it instead of lying.
          setState("error");
        }
      }, DEBOUNCE_MS);
    });
    return () => {
      subscription.unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [restored, methods]);

  const clearDraft = () => {
    // Cancel any pending write and block ones already scheduled from firing.
    if (timer.current) clearTimeout(timer.current);
    suppressUntil.current = Date.now();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // no-op
    }
    setState("idle");
    setSavedAt(null);
  };

  return { restored, state, savedAt, clearDraft };
}
