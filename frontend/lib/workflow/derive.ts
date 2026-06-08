import type {
  PaymentExecutionResult,
  PaymentItem,
  PaymentPlan,
  RiskCheckResult,
} from "@/lib/api/types";

/**
 * Presentation helpers: 把后端 contract 派生成 demo UI 需要的视图数据。
 * 组件不直接重复实现风险/拆分逻辑，统一走这里，保证 mock/real 一致。
 */

export function riskPassed(risk: RiskCheckResult): boolean {
  return risk.overallStatus !== "Blocked";
}

export function partitionByRisk(risk: RiskCheckResult): {
  approved: PaymentItem[];
  blocked: PaymentItem[];
} {
  const approved: PaymentItem[] = [];
  const blocked: PaymentItem[] = [];
  for (const payment of risk.payments) {
    if (payment.status === "Blocked") {
      blocked.push(payment);
    } else {
      approved.push(payment);
    }
  }
  return { approved, blocked };
}

export interface RiskCategoryView {
  name: string;
  passed: boolean;
  reason: string;
  flaggedWallets: string[];
}

/**
 * 把后端 per-payment `risks` 字符串聚合成 Risk Gate 的分类视图。
 * 风险字符串来源：app/services/risk_engine.py。
 */
export function deriveRiskCategories(risk: RiskCheckResult): RiskCategoryView[] {
  const matching = (needle: string) =>
    risk.payments.filter((payment) =>
      payment.risks.some((entry) => entry.includes(needle))
    );

  const category = (
    name: string,
    matched: PaymentItem[],
    passReason: string,
    failReason: string
  ): RiskCategoryView => ({
    name,
    passed: matched.length === 0,
    reason: matched.length === 0 ? passReason : failReason,
    flaggedWallets: matched.map((payment) => payment.wallet),
  });

  const overBudget = matching("exceeds monthly budget");
  const notWhitelisted = matching("not in whitelist");
  const overLimit = matching("exceeds single payment limit");
  const disallowedToken = matching("Token is not allowed");
  const duplicate = risk.payments.filter((payment) =>
    payment.risks.some((entry) => entry.startsWith("Duplicate"))
  );

  return [
    category(
      "Budget Check",
      overBudget,
      "Total within monthly budget",
      "Total payment amount exceeds monthly budget"
    ),
    category(
      "Whitelist Check",
      notWhitelisted,
      "All recipients whitelisted",
      `${notWhitelisted.length} recipient(s) not in whitelist`
    ),
    category(
      "Payment Limit",
      overLimit,
      "All within single-payment limit",
      "Payment amount exceeds single payment limit"
    ),
    category(
      "Token Check",
      disallowedToken,
      "All tokens allowed",
      "Disallowed token detected"
    ),
    category(
      "Duplicate Check",
      duplicate,
      "No duplicate payments detected",
      "Duplicate recipient wallet or task detected"
    ),
  ];
}

/**
 * 执行结果只带 paymentItemId，金额需 join payment plan 取回。
 */
export function executedSummary(
  execution: PaymentExecutionResult,
  plan: PaymentPlan
): { count: number; amount: number } {
  const amountById = new Map(
    plan.payments.map((payment) => [payment.id, payment.amount])
  );
  let count = 0;
  let amount = 0;
  for (const item of execution.payments) {
    if (item.status === "Executed") {
      count += 1;
      amount += amountById.get(item.paymentItemId) ?? 0;
    }
  }
  return { count, amount };
}

export function planToken(plan: PaymentPlan): string {
  return plan.payments[0]?.token ?? "USDC";
}

export function lookupPaymentItem(
  plan: PaymentPlan,
  paymentItemId: string
): PaymentItem | undefined {
  return plan.payments.find((payment) => payment.id === paymentItemId);
}
