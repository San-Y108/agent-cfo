import type { BudgetRule } from "../api/types";
import { WALLETS } from "./contribution-records";

/**
 * Demo 预算规则（后端 BudgetRule 形状）。
 * 这是 POST /api/payment-plan & /api/risk-check 的 `budgetRule` 输入。
 * Bob 的钱包刻意排除在白名单外，用于演示 risk gate 拦截。
 */
export const mockBudgetRule: BudgetRule = {
  monthlyBudget: 50,
  singlePaymentLimit: 25,
  allowedToken: "USDC",
  whitelist: [WALLETS.alice, WALLETS.charlie, WALLETS.vendor],
  requiresHumanApproval: true,
};
