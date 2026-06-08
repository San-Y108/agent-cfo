import type { BudgetRule } from "../api/types";

export const mockBudgetRules: BudgetRule = {
  monthlyBudget: 50,
  singlePaymentLimit: 25,
  allowedToken: "USDC",
  requiresHumanApproval: true,
  // Bob 的钱包不在白名单
  whitelist: [
    "0xAliceWalletAddress",
    "0xCharlieWalletAddress",
    // "0xBobWalletAddress" — intentionally excluded
  ],
};
