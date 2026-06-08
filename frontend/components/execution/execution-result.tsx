import { GlassPanel } from "@/components/ui/glass-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { Zap, CheckCircle } from "lucide-react";
import type { PaymentExecutionResult, PaymentPlan } from "@/lib/api/types";
import { executedSummary, lookupPaymentItem, planToken } from "@/lib/workflow/derive";

interface ExecutionResultProps {
  execution: PaymentExecutionResult;
  plan: PaymentPlan;
}

function truncateHash(hash: string): string {
  if (hash.length <= 18) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export function ExecutionResult({ execution, plan }: ExecutionResultProps) {
  const token = planToken(plan);
  const executed = executedSummary(execution, plan);
  const network = execution.payments[0]?.network ?? "mock-testnet";

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
              <p className="text-[11px] text-slate-500">{network}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {execution.payments.map((item) => {
            const planItem = lookupPaymentItem(plan, item.paymentItemId);
            const wallet = planItem?.wallet ?? item.paymentItemId;
            const reference = item.txHash ?? item.cawRequestId;
            return (
              <div
                key={item.paymentItemId}
                className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {planItem?.amount ?? 0} {planItem?.token ?? token}{" "}
                    <span className="text-slate-500 font-normal">→</span>{" "}
                    <span className="font-mono-numbers text-slate-400">
                      {planItem?.recipient ?? "Unknown"} · {wallet.slice(0, 8)}...
                      {wallet.slice(-4)}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-600 font-mono-numbers">
                    {item.txHash ? "Tx" : "Mock CAW ref"}: {truncateHash(reference)}
                  </p>
                </div>
                <StatusPill
                  status={item.status === "Failed" ? "danger" : "success"}
                  className="shrink-0 ml-3"
                >
                  <CheckCircle className="h-3 w-3" />
                  {item.status}
                </StatusPill>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
              Agent Wallet
            </p>
            <p className="mt-0.5 text-sm font-mono-numbers text-slate-400">
              {execution.agentWalletAddress}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
              Total Executed
            </p>
            <p className="mt-0.5 text-lg font-bold text-white font-mono-numbers">
              {executed.amount} {token}
            </p>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
