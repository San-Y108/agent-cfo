import type { AuditReport } from "../api/types";
import { mockPaymentPlan } from "./payment-plan";
import { mockRiskCheckResult } from "./risk-check";
import { mockCAWExecutions } from "./caw-execution";

export const mockAuditReport: AuditReport = {
  id: "audit-1",
  paymentPlanId: mockPaymentPlan.id,
  timestamp: "2026-06-07T12:00:00Z",
  summary: "Payment plan executed with 3 successful transactions. 1 item blocked by whitelist check (Bob).",
  transactions: mockCAWExecutions,
  riskCheck: mockRiskCheckResult,
  approvedBy: "HumanOperator",
};
