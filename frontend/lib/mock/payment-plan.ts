import type { PaymentItem, PaymentPlan } from "../api/types";
import { mockContributions } from "./contribution-records";

/**
 * mock 版 POST /api/payment-plan 响应。
 * 严格镜像后端 create_payment_plan（app/routers/payments.py）:
 * id=pay_NNN、reason="Completed task: ..."、status=Ready、riskLevel=Unchecked。
 */
const payments: PaymentItem[] = mockContributions.map((contribution, index) => ({
  id: `pay_${String(index + 1).padStart(3, "0")}`,
  recipient: contribution.name,
  task: contribution.task,
  wallet: contribution.wallet,
  amount: contribution.amount,
  token: contribution.token,
  reason: `Completed task: ${contribution.task}`,
  status: "Ready",
  risks: [],
}));

export const mockPaymentPlan: PaymentPlan = {
  paymentPlanId: "plan_demo_001",
  summary: `AgentCFO generated a payment plan for ${payments.length} payment item(s).`,
  totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
  riskLevel: "Unchecked",
  payments,
};
