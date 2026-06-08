import { CommandCenterShell } from "@/components/demo/command-center-shell";
import { TreasuryKpiStrip } from "@/components/demo/treasury-kpi-strip";
import { WorkflowTimeline } from "@/components/workflow/workflow-timeline";
import { PaymentPlanBoard } from "@/components/payment/payment-plan";
import { RiskGate } from "@/components/risk/risk-gate";
import { HumanApproval } from "@/components/approval/human-approval";
import { ExecutionResult } from "@/components/execution/execution-result";
import { AuditReport } from "@/components/audit/audit-report";

import { demoData } from "@/lib/demo/demo-data";

export default function DemoPage() {
  return (
    <CommandCenterShell>
      <TreasuryKpiStrip
        paymentPlan={demoData.paymentPlan}
        riskResult={demoData.riskResult}
        executions={demoData.executions}
      />

      {/* Compact Workflow */}
      <div className="mb-8">
        <WorkflowTimeline riskResult={demoData.riskResult} />
      </div>

      {/* Main Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Payment Plan (Primary) */}
        <div className="lg:col-span-7">
          <PaymentPlanBoard
            plan={demoData.paymentPlan}
            riskResult={demoData.riskResult}
          />
        </div>

        {/* Right: Risk Gate (Control Panel) */}
        <div className="lg:col-span-5">
          <RiskGate result={demoData.riskResult} />
        </div>
      </div>

      {/* Lower Grid: Approval + Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <HumanApproval
          plan={demoData.paymentPlan}
          riskResult={demoData.riskResult}
        />
        <ExecutionResult executions={demoData.executions} />
      </div>

      {/* Audit Report: Full width, like final proof */}
      <AuditReport
        report={demoData.auditReport}
        plan={demoData.paymentPlan}
      />
    </CommandCenterShell>
  );
}
