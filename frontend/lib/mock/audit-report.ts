import type { AuditReport } from "../api/types";
import { mockPaymentPlan } from "./payment-plan";
import { mockRiskCheckResult } from "./risk-check";
import { mockExecutionResult } from "./caw-execution";

/**
 * mock 版 GET /api/audit-report/{auditReportId} 响应。
 * 镜像后端 AuditReport：聚合 paymentPlan / riskCheck / humanApproval / execution。
 */
export const mockAuditReport: AuditReport = {
  auditReportId: mockExecutionResult.auditReportId,
  mode: "mock",
  paymentPlan: mockPaymentPlan,
  riskCheck: mockRiskCheckResult,
  humanApproval: { approved: true, approvedBy: "demo-operator" },
  execution: mockExecutionResult,
  remainingBudget: mockRiskCheckResult.remainingBudget,
};
