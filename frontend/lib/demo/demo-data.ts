import type { PaymentPlanRequest } from "@/lib/api/types";
import type { DemoFlowResult } from "@/lib/workflow/run-demo-flow";

import { mockContributions } from "@/lib/mock/contribution-records";
import { mockBudgetRule } from "@/lib/mock/budget-rules";
import { mockPaymentPlan } from "@/lib/mock/payment-plan";
import { mockRiskCheckResult } from "@/lib/mock/risk-check";
import { mockExecutionResult } from "@/lib/mock/caw-execution";
import { mockAuditReport } from "@/lib/mock/audit-report";

/**
 * Demo Console 的统一 mock 数据源。
 *
 * `result` 与 real mode 的 `runDemoFlow()` 返回同一套类型（DemoFlowResult），
 * 因此页面层在 mock / real 之间切换时不需要改组件 props。
 * `request` 是对应的输入 payload，real mode 直接 `runDemoFlow(demoData.request)`。
 */
export interface DemoData extends DemoFlowResult {
  request: PaymentPlanRequest;
}

export const demoData: DemoData = {
  request: { contributions: mockContributions, budgetRule: mockBudgetRule },
  paymentPlan: mockPaymentPlan,
  riskResult: mockRiskCheckResult,
  execution: mockExecutionResult,
  auditReport: mockAuditReport,
};
