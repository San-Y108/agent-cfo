import { GlassPanel } from "@/components/ui/glass-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { Zap, CheckCircle } from "lucide-react";
import type { CAWExecution } from "@/lib/api/types";

interface ExecutionResultProps {
  executions: CAWExecution[];
}

function truncateHash(hash: string): string {
  if (hash.length <= 18) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export function ExecutionResult({ executions }: ExecutionResultProps) {
  const totalExecuted = executions.reduce((sum, ex) => sum + ex.amount, 0);

  return (
    <GlassPanel accent="blue" className="p-0 overflow-hidden">
      {/* Simulated banner */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-500/15 bg-amber-500/[0.04]">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[11px] font-semibold text-amber-400">
          Simulated Execution — No real blockchain transaction occurred
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Execution Result</h2>
              <p className="text-[11px] text-slate-500">Base Sepolia (testnet)</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {executions.map((ex, index) => (
            <div
              key={ex.transactionHash + index}
              className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {ex.amount} {ex.token}{" "}
                  <span className="text-slate-500 font-normal">→</span>{" "}
                  <span className="font-mono-numbers text-slate-400">
                    {ex.recipientWallet.slice(0, 8)}...{ex.recipientWallet.slice(-4)}
                  </span>
                </p>
                <p className="mt-1 text-[11px] text-slate-600 font-mono-numbers">
                  Mock tx: {truncateHash(ex.transactionHash)}
                </p>
              </div>
              <StatusPill status="success" className="shrink-0 ml-3">
                <CheckCircle className="h-3 w-3" />
                {ex.paymentStatus}
              </StatusPill>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
              Agent Wallet
            </p>
            <p className="mt-0.5 text-sm font-mono-numbers text-slate-400">
              {executions[0]?.agentWalletAddress?.slice(0, 10)}...
              {executions[0]?.agentWalletAddress?.slice(-6) ?? "N/A"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
              Total Executed
            </p>
            <p className="mt-0.5 text-lg font-bold text-white font-mono-numbers">
              {totalExecuted} USDC
            </p>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
