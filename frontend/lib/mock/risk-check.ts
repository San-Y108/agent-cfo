import type { RiskCheckResult } from "../api/types";

export const mockRiskCheckResult: RiskCheckResult = {
  passed: false,
  checks: {
    budgetCheck: {
      passed: true,
      reason: "Total 50 USDC within monthly budget 50 USDC",
    },
    whitelistCheck: {
      passed: false,
      blockedWallets: ["0xBobWalletAddress"],
      reason: "Bob (0xBobWalletAddress) is not in whitelist",
    },
    limitCheck: {
      passed: true,
      reason: "All payments within single payment limit 25 USDC",
    },
    duplicateCheck: {
      passed: true,
      reason: "No duplicate payments detected",
    },
  },
};
