import React, { forwardRef } from "react";
import { AlertIcon } from "../icons";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  /** Small fixed affix rendered inside the input's left edge, e.g. "Rp". */
  prefix?: string;
}

/**
 * Labeled text/number/date input, wired for react-hook-form's `register()`
 * (which needs a forwarded ref). Renders an inline error message below the
 * input when present — per UX guideline, inputs always keep an associated
 * <label>, never placeholder-only. Sharp 1px borders, no radius/shadow, per
 * Swiss-modernist system.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, prefix, className, ...rest }, ref) => (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-foreground">
        {label}
      </span>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute left-0 top-0 flex h-full items-center border-r border-border px-2.5 font-mono text-xs font-semibold text-muted-foreground">
            {prefix}
          </span>
        ) : null}
        <input
          ref={ref}
          className={`w-full rounded-none border bg-background py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors duration-150 focus:border-foreground focus:ring-1 focus:ring-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground ${
            prefix ? "pl-12 pr-3" : "px-3"
          } ${
            error
              ? "border-destructive focus:border-destructive focus:ring-destructive"
              : "border-border"
          } ${className ?? ""}`}
          {...rest}
        />
      </div>
      {error ? (
        <span className="mt-1 flex items-center gap-1 text-xs text-destructive">
          <AlertIcon className="h-3 w-3 shrink-0" />
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  )
);
TextField.displayName = "TextField";
