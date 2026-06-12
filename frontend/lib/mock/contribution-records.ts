import type { ContributionRecord } from "../api/types";
import { MOCK_RECORDS } from "@/lib/demo/console-mock";

/**
 * Demo 输入数据：贡献记录 / 订阅账单（后端 ContributionRecord 形状）。
 * 这是 POST /api/payment-plan 的 `contributions` 输入，real mode 直接复用。
 * 以 lib/demo/console-mock.ts 为唯一数据源，避免维护两套 mock。
 */

export const WALLETS = {
  alice: MOCK_RECORDS.find((r) => r.name === "Alice")?.wallet ?? "",
  bob: MOCK_RECORDS.find((r) => r.name === "Bob")?.wallet ?? "",
  charlie: MOCK_RECORDS.find((r) => r.name === "Charlie")?.wallet ?? "",
  vendor: MOCK_RECORDS.find((r) => r.name === "Data API")?.wallet ?? "",
} as const;

export const mockContributions: ContributionRecord[] = MOCK_RECORDS.map(
  ({ id: _id, ...rest }) => rest
);
