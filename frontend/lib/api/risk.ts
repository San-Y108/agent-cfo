import { postJson } from "./client";
import type { RiskCheckRequest, RiskCheckResult } from "./types";

/**
 * Risk Check adapter — POST /api/risk-check
 * mock mode 下组件应使用 `lib/mock/risk-check.ts`。
 */
export async function runRiskCheck(
  payload: RiskCheckRequest
): Promise<RiskCheckResult> {
  return postJson<RiskCheckResult>("/api/risk-check", payload);
}
