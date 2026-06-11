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
  auditVersion: "p0-evidence-v1",
  inputSummary: {
    paymentPlanId: mockPaymentPlan.paymentPlanId,
    paymentCount: mockPaymentPlan.payments.length,
    totalAmount: mockPaymentPlan.totalAmount,
    tokens: ["USDC"],
  },
  decisionTrail: [
    { step: "payment-plan", status: "created", id: mockPaymentPlan.paymentPlanId },
    { step: "risk-check", status: mockRiskCheckResult.overallStatus, id: mockRiskCheckResult.paymentPlanId },
    { step: "human-approval", status: "approved", approvedBy: "demo-operator" },
    { step: "caw-execution", status: "completed", id: mockExecutionResult.executionId },
    { step: "audit-snapshot", status: "captured", id: mockExecutionResult.auditReportId },
  ],
  riskRuleEvidence: mockRiskCheckResult.payments.flatMap((p) => {
    if (p.risks.length > 0) {
      return p.risks.map((risk) => ({
        ruleId: risk.toLowerCase().replace(/\s+/g, "-"),
        outcome: "blocked",
        affectedPaymentIds: [p.id],
        reason: risk,
      }));
    }
    return [
      {
        ruleId: "risk-check-passed",
        outcome: "passed",
        affectedPaymentIds: [p.id],
        reason: "No deterministic risk rules were triggered.",
      },
    ];
  }) as any[],
  humanApprovalEvidence: {
    approved: true,
    approvedBy: "demo-operator",
    approvedPaymentIds: mockExecutionResult.payments.map((p) => p.paymentItemId),
    source: "execute-payment-request",
  },
  cawEvidence: mockExecutionResult.payments.map((p) => ({
    paymentItemId: p.paymentItemId,
    mode: p.mode,
    network: p.network,
    agentWalletAddress: p.agentWalletAddress,
    cawRequestId: p.cawRequestId,
    txHash: p.txHash,
    txHashExplanation:
      p.mode === "mock" && p.txHash === null
        ? "mock execution does not create a real tx hash"
        : "tx hash returned by CAW",
    error: p.error,
    diagnosticCode: p.diagnosticCode,
  })),
  outcomeSummary: {
    executedPaymentIds: mockExecutionResult.payments
      .filter((p) => p.status === "Executed")
      .map((p) => p.paymentItemId),
    blockedPaymentIds: mockRiskCheckResult.payments
      .filter((p) => p.status === "Blocked")
      .map((p) => p.id),
    blockedReasons: Object.fromEntries(
      mockRiskCheckResult.payments
        .filter((p) => p.status === "Blocked")
        .map((p) => [p.id, p.risks])
    ),
    failedPaymentIds: [],
    failedReasons: {},
  },
  snapshot: {
    capturedAt: new Date().toISOString(),
    sourceExecutionId: mockExecutionResult.executionId,
    immutable: true,
  },
};
