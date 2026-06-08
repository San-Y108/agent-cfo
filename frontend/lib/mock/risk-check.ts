import type { PaymentItem, PaymentStatus, RiskCheckResult } from "../api/types";
import { mockPaymentPlan } from "./payment-plan";
import { mockBudgetRule } from "./budget-rules";

/**
 * mock 版 POST /api/risk-check 响应。
 * 镜像后端 risk_engine：Bob (pay_002) 不在白名单 → Blocked + risk string；
 * 其余因 requiresHumanApproval → NeedsApproval。任一 blocked → overallStatus=Blocked。
 */
const RISK_OVERRIDES: Record<string, { status: PaymentStatus; risks: string[] }> = {
  pay_002: {
    status: "Blocked",
    risks: ["Recipient wallet is not in whitelist"],
  },
};

const checkedPayments: PaymentItem[] = mockPaymentPlan.payments.map((payment) => {
  const override = RISK_OVERRIDES[payment.id];
  if (override) {
    return { ...payment, status: override.status, risks: override.risks };
  }
  return { ...payment, status: "NeedsApproval", risks: [] };
});

const totalAmount = mockPaymentPlan.totalAmount;

export const mockRiskCheckResult: RiskCheckResult = {
  paymentPlanId: mockPaymentPlan.paymentPlanId,
  overallStatus: "Blocked",
  riskLevel: "Blocked",
  remainingBudget: mockBudgetRule.monthlyBudget - totalAmount,
  requiresHumanApproval: mockBudgetRule.requiresHumanApproval,
  payments: checkedPayments,
};
