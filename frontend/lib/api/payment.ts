import { postJson } from "./client";
import type { PaymentPlan, PaymentPlanRequest } from "./types";

/**
 * Payment Plan adapter — POST /api/payment-plan
 * mock mode 下组件应使用 `lib/mock/payment-plan.ts`。
 */
export async function createPaymentPlan(
  payload: PaymentPlanRequest
): Promise<PaymentPlan> {
  return postJson<PaymentPlan>("/api/payment-plan", payload);
}
