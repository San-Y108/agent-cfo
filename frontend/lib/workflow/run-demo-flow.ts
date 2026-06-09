import { createPaymentPlan } from "@/lib/api/payment";
import { runRiskCheck } from "@/lib/api/risk";
import { executePayment } from "@/lib/api/caw";
import { getAuditReport } from "@/lib/api/audit";
import type {
  AuditReport,
  PaymentExecutionResult,
  PaymentPlan,
  PaymentPlanRequest,
  RiskCheckResult,
} from "@/lib/api/types";

export interface DemoFlowResult {
  paymentPlan: PaymentPlan;
  riskResult: RiskCheckResult;
  execution: PaymentExecutionResult;
  auditReport: AuditReport;
}

/**
 * Real-mode 编排：把 demo happy path 串成真实后端调用链。
 * payment-plan → risk-check → execute-payment(自动批准非 Blocked 项) → audit-report。
 *
 * 注意：仅在 NEXT_PUBLIC_DEMO_MODE=real 时调用；mock 模式请直接用 lib/demo/demo-data。
 */
export async function runDemoFlow(
  request: PaymentPlanRequest
): Promise<DemoFlowResult> {
  const paymentPlan = await createPaymentPlan(request);

  const riskResult = await runRiskCheck({
    paymentPlanId: paymentPlan.paymentPlanId,
    budgetRule: request.budgetRule,
  });

  const approvedPaymentIds = riskResult.payments
    .filter((payment) => payment.status !== "Blocked")
    .map((payment) => payment.id);

  const execution = await executePayment({
    paymentPlanId: paymentPlan.paymentPlanId,
    approvedPaymentIds,
    humanApproval: { approved: true, approvedBy: "demo-operator" },
  });

  const auditReport = await getAuditReport(execution.auditReportId);

  return { paymentPlan, riskResult, execution, auditReport };
}
