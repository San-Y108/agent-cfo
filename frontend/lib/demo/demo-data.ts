import type { PaymentPlan, RiskCheckResult, CAWExecution, AuditReport } from "@/lib/api/types";

import { mockPaymentPlan } from "@/lib/mock/payment-plan";
import { mockRiskCheckResult } from "@/lib/mock/risk-check";
import { mockCAWExecutions } from "@/lib/mock/caw-execution";
import { mockAuditReport } from "@/lib/mock/audit-report";

export interface DemoData {
  paymentPlan: PaymentPlan;
  riskResult: RiskCheckResult;
  executions: CAWExecution[];
  auditReport: AuditReport;
}

/**
 * Demo Console v0 的统一 mock 数据源。
 *
 * 当前阶段直接组合 `lib/mock/*` 中的静态数据。
 * 后续如需切换为真实 API，只需替换此文件的导出即可，
 * 页面层（`app/demo/page.tsx`）不直接依赖 `lib/mock/*`。
 */
export const demoData: DemoData = {
  paymentPlan: mockPaymentPlan,
  riskResult: mockRiskCheckResult,
  executions: mockCAWExecutions,
  auditReport: mockAuditReport,
};
