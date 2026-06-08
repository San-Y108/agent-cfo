"use client";

import { MetricCard } from "@/components/ui/metric-card";
import type { PaymentPlan, RiskCheckResult, CAWExecution } from "@/lib/api/types";
import { Wallet, CheckCircle, AlertTriangle, Zap, Activity } from "lucide-react";

interface TreasuryKpiStripProps {
  paymentPlan: PaymentPlan;
  riskResult: RiskCheckResult;
  executions: CAWExecution[];
}

export function TreasuryKpiStrip({ paymentPlan, riskResult, executions }: TreasuryKpiStripProps) {
  const blockedWallets = riskResult.checks.whitelistCheck.blockedWallets ?? [];

  const approvedItems = paymentPlan.items.filter(
    (item) => !blockedWallets.includes(item.recipient.walletAddress)
  );
  const blockedItems = paymentPlan.items.filter(
    (item) => blockedWallets.includes(item.recipient.walletAddress)
  );

  const totalExecuted = executions.reduce((sum, ex) => sum + ex.amount, 0);
  const approvedAmount = approvedItems.reduce((s, i) => s + i.amount, 0);
  const blockedAmount = blockedItems.reduce((s, i) => s + i.amount, 0);

  return (
    <section className="mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard
          label="Planned"
          value={`${paymentPlan.totalAmount} ${paymentPlan.token}`}
          subValue={`${paymentPlan.items.length} payouts`}
          tone="neutral"
          icon={<Wallet className="h-4 w-4" />}
        />
        <MetricCard
          label="Approved"
          value={`${approvedItems.length}`}
          subValue={`${approvedAmount} ${paymentPlan.token}`}
          tone="emerald"
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <MetricCard
          label="Blocked"
          value={`${blockedItems.length}`}
          subValue={`${blockedAmount} ${paymentPlan.token}`}
          tone="red"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <MetricCard
          label="Executed"
          value={`${totalExecuted} ${paymentPlan.token}`}
          subValue={`${executions.length} transactions`}
          tone="blue"
          icon={<Zap className="h-4 w-4" />}
        />
        <MetricCard
          label="Mode"
          value="Simulated"
          subValue="No real transactions"
          tone="amber"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>
    </section>
  );
}
