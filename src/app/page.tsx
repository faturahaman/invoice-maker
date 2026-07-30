import { InvoiceForm } from "@/components/dashboard/InvoiceForm";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-foreground bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-foreground bg-foreground text-background">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M9 13h6" />
                <path d="M9 17h6" />
                <path d="M9 9h1" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-tight text-foreground">
                Invoice Generator
              </h1>
              <p className="hidden text-xs leading-tight text-muted-foreground sm:block">
                Buat & unduh invoice PDF dalam hitungan detik
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 border border-foreground px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Sepenuhnya Dapat Dikustom
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <InvoiceForm />
      </main>
    </div>
  );
}
