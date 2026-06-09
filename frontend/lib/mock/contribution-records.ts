import type { ContributionRecord } from "../api/types";

/**
 * Demo 输入数据：贡献记录 / 订阅账单（后端 ContributionRecord 形状）。
 * 这是 POST /api/payment-plan 的 `contributions` 输入，real mode 直接复用。
 */

export const WALLETS = {
  alice: "0xAliceWalletAddress",
  bob: "0xBobWalletAddress",
  charlie: "0xCharlieWalletAddress",
  vendor: "0xDataApiVendorAddress",
} as const;

export const mockContributions: ContributionRecord[] = [
  {
    name: "Alice",
    role: "Content Contributor",
    task: "Wrote event recap article",
    wallet: WALLETS.alice,
    amount: 20,
    token: "USDC",
  },
  {
    name: "Bob",
    role: "Designer",
    task: "Designed event poster",
    wallet: WALLETS.bob,
    amount: 15,
    token: "USDC",
  },
  {
    name: "Charlie",
    role: "Community Operator",
    task: "Hosted community AMA",
    wallet: WALLETS.charlie,
    amount: 10,
    token: "USDC",
  },
  {
    name: "Data API",
    role: "Tool Subscription",
    task: "Data API subscription (2026-06)",
    wallet: WALLETS.vendor,
    amount: 5,
    token: "USDC",
  },
];
