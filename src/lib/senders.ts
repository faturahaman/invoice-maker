"use client";

import type { Issuer } from "@/lib/schema/invoice";

/**
 * Client-side store of reusable senders ("Pengirim"). This is the feature that
 * was previously impossible: the old registry was server-side and fixed, so a
 * user could never add their own institution. Now any issuer the user fills in
 * can be saved (browser localStorage) and re-selected on future invoices —
 * unlimited, no backend.
 */
const KEY = "invoice-maker:senders:v1";

export interface SavedSender {
  id: string;
  issuer: Issuer;
}

/** Stable-ish id without Math.random/Date (both fine here, but keep it simple). */
function makeId(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const suffix = Math.floor(performance.now()).toString(36);
  return `${slug || "sender"}-${suffix}`;
}

export function listSenders(): SavedSender[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedSender[]) : [];
  } catch {
    return [];
  }
}

/** Returns true on success, false if the browser rejected the write. */
function persist(senders: SavedSender[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(senders));
    return true;
  } catch {
    // Storage blocked/full — non-fatal, saving simply won't persist.
    return false;
  }
}

export interface SaveResult {
  ok: boolean;
  senders: SavedSender[];
}

/**
 * Saves (or updates) a sender by matching name — so re-saving the same
 * institution overwrites rather than duplicating. Returns the (in-memory)
 * list plus whether the write actually persisted, so the UI can avoid
 * reporting a false success on quota errors.
 */
export function saveSender(issuer: Issuer): SaveResult {
  const senders = listSenders();
  const existingIdx = senders.findIndex(
    (s) => s.issuer.name.trim().toLowerCase() === issuer.name.trim().toLowerCase()
  );
  if (existingIdx >= 0) {
    senders[existingIdx] = { ...senders[existingIdx], issuer };
  } else {
    senders.push({ id: makeId(issuer.name), issuer });
  }
  const ok = persist(senders);
  return { ok, senders };
}

export function deleteSender(id: string): SavedSender[] {
  const senders = listSenders().filter((s) => s.id !== id);
  persist(senders);
  return senders;
}
