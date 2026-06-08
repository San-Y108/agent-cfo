import { GlassPanel } from "@/components/ui/glass-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { UserCheck, CheckCircle, XCircle, Info } from "lucide-react";
import type { PaymentPlan, RiskCheckResult } from "@/lib/api/types";

interface HumanApprovalProps {
  plan: PaymentPlan;
  riskResult: RiskCheckResult;
}

export function HumanApproval({ plan, riskResult }: HumanApprovalProps) {
  const blockedWallets = riskResult.checks.whitelistCheck.blockedWallets ?? [];
  const approvedItems = plan.items.filter(
    (item) => !blockedWallets.includes(item.recipient.walletAddress)
  );
  const blockedItems = plan.items.filter(
    (item) => blockedWallets.includes(item.recipient.walletAddress)
  );

  return (
    <GlassPanel accent="emerald" className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Human Approval</h2>
            <p className="text-[11px] text-slate-500">Required before execution</p>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {/* Approved Queue */}
        {approvedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-300">{item.recipient.name}</p>
                <p className="text-[11px] text-emerald-400/70">{item.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-emerald-300 font-mono-numbers">
                {item.amount} {item.token}
              </p>
              <StatusPill status="success" className="mt-1">Approved</StatusPill>
            </div>
          </div>
        ))}

        {/* Blocked Queue */}
        {blockedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-red-500/15 bg-red-500/[0.04] px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <XCircle className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-300">{item.recipient.name}</p>
                <p className="text-[11px] text-red-400/70">{item.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-red-300 font-mono-numbers">
                {item.amount} {item.token}
              </p>
              <StatusPill status="danger" className="mt-1">Blocked</StatusPill>
            </div>
          </div>
        ))}

        {/* Policy Note */}
        <div className="flex items-start gap-2.5 rounded-lg border border-blue-500/15 bg-blue-500/[0.04] px-4 py-3">
          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300 leading-relaxed">
            <span className="font-semibold">Policy enforced:</span> All payouts require human
            approval. Blocked items (whitelist failure) are automatically rejected and cannot be
            approved.
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}
