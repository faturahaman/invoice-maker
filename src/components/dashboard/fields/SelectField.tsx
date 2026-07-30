import React, { forwardRef } from "react";
import { AlertIcon } from "../icons";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, options, className, ...rest }, ref) => (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-foreground">
        {label}
      </span>
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none rounded-none border bg-background px-3 py-2 pr-9 text-sm text-foreground outline-none transition-colors duration-150 focus:border-foreground focus:ring-1 focus:ring-foreground ${
            error
              ? "border-destructive focus:border-destructive focus:ring-destructive"
              : "border-border"
          } ${className ?? ""}`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {error ? (
        <span className="mt-1 flex items-center gap-1 text-xs text-destructive">
          <AlertIcon className="h-3 w-3 shrink-0" />
          {error}
        </span>
      ) : null}
    </label>
  )
);
SelectField.displayName = "SelectField";
