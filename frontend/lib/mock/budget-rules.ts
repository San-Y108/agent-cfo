import type { BudgetRule } from "../api/types";
import { MOCK_RULES } from "@/lib/demo/console-mock";

/**
 * Demo 预算规则（后端 BudgetRule 形状）。
 * 这是 POST /api/payment-plan & /api/risk-check 的 `budgetRule` 输入。
 * 以 lib/demo/console-mock.ts 为唯一数据源，避免维护两套 mock。
 */
export const mockBudgetRule: BudgetRule = {
  ...MOCK_RULES,
  requiresHumanApproval: true,
};
