"use client";

import { MetricCard } from "@/components/ui/metric-card";
import type { PaymentPlan, RiskCheckResult, PaymentExecutionResult } from "@/lib/api/types";
import { partitionByRisk, executedSummary, planToken } from "@/lib/workflow/derive";
import { Wallet, CheckCircle, AlertTriangle, Zap, Activity } from "lucide-react";

interface TreasuryKpiStripProps {
  paymentPlan: PaymentPlan;
  riskResult: RiskCheckResult;
  execution: PaymentExecutionResult;
}

export function TreasuryKpiStrip({ paymentPlan, riskResult, execution }: TreasuryKpiStripProps) {
  const { approved: approvedItems, blocked: blockedItems } = partitionByRisk(riskResult);
  const token = planToken(paymentPlan);

  const executed = executedSummary(execution, paymentPlan);
  const approvedAmount = approvedItems.reduce((sum, item) => sum + item.amount, 0);
  const blockedAmount = blockedItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard
          label="Planned"
          value={`${paymentPlan.totalAmount} ${token}`}
          subValue={`${paymentPlan.payments.length} payouts`}
          tone="neutral"
          icon={<Wallet className="h-4 w-4" />}
        />
        <MetricCard
          label="Approved"
          value={`${approvedItems.length}`}
          subValue={`${approvedAmount} ${token}`}
          tone="emerald"
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <MetricCard
          label="Blocked"
          value={`${blockedItems.length}`}
          subValue={`${blockedAmount} ${token}`}
          tone="red"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <MetricCard
          label="Executed"
          value={`${executed.amount} ${token}`}
          subValue={`${executed.count} transactions`}
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
