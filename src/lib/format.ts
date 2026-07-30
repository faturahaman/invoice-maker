import type { Settings } from "@/lib/schema/invoice";

/**
 * Formats a number as currency using the invoice's chosen currency + locale.
 * Falls back to Indonesian Rupiah so existing call sites (and the legacy
 * `formatCurrency`) keep their original behavior.
 */
export function formatMoney(
  amount: number,
  currency = "IDR",
  locale = "id-ID"
): string {
  const noFraction = currency === "IDR" || currency === "JPY";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: noFraction ? 0 : 2,
      maximumFractionDigits: noFraction ? 0 : 2,
    }).format(amount);
  } catch {
    // Unknown currency/locale — degrade gracefully rather than throw. Note the
    // fallback must NOT pass `locale` to toLocaleString (it would re-throw the
    // same RangeError); use the default locale and prefix the currency code.
    try {
      return `${currency} ${amount.toLocaleString()}`;
    } catch {
      return `${currency} ${amount}`;
    }
  }
}

/** Back-compat: Indonesian Rupiah, e.g. 1500000 -> "Rp1.500.000". */
export function formatCurrency(amount: number): string {
  return formatMoney(amount, "IDR", "id-ID");
}

/** Formats an ISO date string (YYYY-MM-DD) using the given locale. */
export function formatDate(isoDate: string, locale = "id-ID"): string {
  const d = new Date(`${isoDate}T00:00:00`);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  try {
    return new Intl.DateTimeFormat(locale, opts).format(d);
  } catch {
    // Invalid locale — fall back to the runtime default rather than throw
    // (an uncaught RangeError here would 500 the whole PDF render).
    return new Intl.DateTimeFormat(undefined, opts).format(d);
  }
}

export interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
}

/**
 * Single source of truth for invoice math: subtotal → +tax% → −discount →
 * grand total. Used by the items table, the live form footer, and the PDF so
 * every surface agrees to the cent.
 */
export function computeTotals(
  items: { amount: number }[],
  settings?: Pick<Settings, "tax" | "discount">
): InvoiceTotals {
  const subtotal = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const taxRate = settings?.tax?.enabled ? Number(settings.tax.rate) || 0 : 0;
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const discountAmount = settings?.discount?.enabled ? Number(settings.discount.amount) || 0 : 0;
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);
  return { subtotal, taxAmount, discountAmount, grandTotal };
}
