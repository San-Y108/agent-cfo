import { PROJECT_NAME, PROJECT_TAGLINE } from "@/lib/constants/project";

export function DemoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                    {PROJECT_NAME}
                  </h1>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
                    Demo
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {PROJECT_TAGLINE} · AI Treasury Command Center
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:text-right">
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Mock Mode
              </span>
              <span className="text-xs text-slate-400">
                No real transactions
              </span>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
