import { GlassPanel } from "@/components/ui/glass-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { Wallet, ShieldAlert, ShieldCheck } from "lucide-react";
import type { PaymentPlan, RiskCheckResult } from "@/lib/api/types";
import { partitionByRisk, planToken } from "@/lib/workflow/derive";

interface PaymentPlanProps {
  plan: PaymentPlan;
  riskResult: RiskCheckResult;
}

function truncateAddress(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function PaymentPlanBoard({ plan, riskResult }: PaymentPlanProps) {
  const { approved: approvedItems, blocked: blockedItems } =
    partitionByRisk(riskResult);
  const token = planToken(plan);
  const rows = riskResult.payments;

  return (
    <GlassPanel accent="blue" className="p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Payment Plan</h2>
            <p className="text-[11px] text-slate-500">
              {approvedItems.length} approved · {blockedItems.length} blocked
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white font-mono-numbers">
            {plan.totalAmount}
          </p>
          <p className="text-[11px] text-slate-500">{token}</p>
        </div>
      </div>

      {/* Transaction Board */}
      <div className="p-3 space-y-2">
        {rows.map((item) => {
          const isBlocked = item.status === "Blocked";

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-lg px-4 py-3 border ${
                isBlocked
                  ? "bg-red-500/[0.04] border-red-500/15"
                  : "bg-white/[0.02] border-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isBlocked
                      ? "bg-red-500/10 text-red-400"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {isBlocked ? (
                    <ShieldAlert className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {item.recipient}
                    </p>
                    {isBlocked ? (
                      <StatusPill status="danger">Blocked</StatusPill>
                    ) : (
                      <StatusPill status="success">Approved</StatusPill>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono-numbers">
                    {truncateAddress(item.wallet)} · {item.reason}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p
                  className={`text-sm font-bold font-mono-numbers ${
                    isBlocked ? "text-red-400" : "text-white"
                  }`}
                >
                  {item.amount} {item.token}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
