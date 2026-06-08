import { GlassPanel } from "@/components/ui/glass-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import type { RiskCheckResult } from "@/lib/api/types";

interface RiskGateProps {
  result: RiskCheckResult;
}

interface CheckItemProps {
  name: string;
  passed: boolean;
  reason?: string;
  warning?: string;
}

function CheckItem({ name, passed, reason, warning }: CheckItemProps) {
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 ${
        passed
          ? "border-emerald-500/15 bg-emerald-500/[0.04]"
          : "border-red-500/15 bg-red-500/[0.04]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
            passed ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}
        >
          {passed ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
        </div>
        <span className={`text-sm font-semibold ${passed ? "text-emerald-300" : "text-red-300"}`}>
          {name}
        </span>
      </div>
      {reason && (
        <p className={`mt-2 text-xs leading-relaxed ${passed ? "text-emerald-400/70" : "text-red-400/70"}`}>
          {reason}
        </p>
      )}
      {warning && (
        <p className="mt-2 text-xs font-semibold text-red-300">{warning}</p>
      )}
    </div>
  );
}

export function RiskGate({ result }: RiskGateProps) {
  const { checks } = result;
  const failedChecks = Object.entries(checks).filter(([, c]) => !c.passed);

  return (
    <GlassPanel accent="gold" className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Risk Gate</h2>
            <p className="text-[11px] text-slate-500">AI Agent policy enforcement</p>
          </div>
        </div>
        {result.passed ? (
          <StatusPill status="success">All Clear</StatusPill>
        ) : (
          <StatusPill status="danger">
            {failedChecks.length} check{failedChecks.length > 1 ? "s" : ""} failed
          </StatusPill>
        )}
      </div>

      <div className="p-3 space-y-2">
        <CheckItem
          name="Budget Check"
          passed={checks.budgetCheck.passed}
          reason={checks.budgetCheck.reason}
        />
        <CheckItem
          name="Whitelist Check"
          passed={checks.whitelistCheck.passed}
          reason={checks.whitelistCheck.reason}
          warning={
            checks.whitelistCheck.blockedWallets
              ? `Blocked: ${checks.whitelistCheck.blockedWallets.join(", ")}`
              : undefined
          }
        />
        <CheckItem
          name="Payment Limit"
          passed={checks.limitCheck.passed}
          reason={checks.limitCheck.reason}
        />
        <CheckItem
          name="Duplicate Check"
          passed={checks.duplicateCheck.passed}
          reason={checks.duplicateCheck.reason}
        />
      </div>
    </GlassPanel>
  );
}
