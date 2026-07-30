import React from "react";

/**
 * Shared card shell for each form section: hard 1px border, no shadow, and
 * an optional numbered/icon header. Swiss-modernist rule: structure comes
 * from borders and typography, not depth effects — so every section (recipient,
 * items, schemes, ...) reads as a distinct block in a strict grid.
 */
export function Card({
  step,
  title,
  description,
  icon,
  action,
  children,
}: {
  step?: number;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border bg-background">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-start gap-3">
          {step !== undefined ? (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-foreground font-mono text-[11px] font-semibold text-foreground">
              {String(step).padStart(2, "0")}
            </span>
          ) : icon ? (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center text-foreground">
              {icon}
            </div>
          ) : null}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
