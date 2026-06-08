import { StatusPill } from "@/components/ui/status-pill";

export function CommandCenterShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#030712] flex flex-col">
      {/* Command Center Header */}
      <header className="relative border-b border-white/[0.06] bg-[#030712]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Identity */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-lg font-bold text-white tracking-tight">AgentCFO</h1>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    Command Center
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Status */}
            <div className="flex items-center gap-3">
              <StatusPill status="warning" pulse>
                Simulated Mode
              </StatusPill>
              <span className="text-xs text-slate-600 hidden sm:inline">No real transactions</span>
              <a
                href="/"
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors hidden sm:inline"
              >
                ← Back
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#030712]/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-[11px] text-slate-700">
            AgentCFO · Mock-only demo for hackathon · No real blockchain transactions
          </p>
        </div>
      </footer>
    </div>
  );
}
