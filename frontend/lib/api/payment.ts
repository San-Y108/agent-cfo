import { postJson, request } from "./client";
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

/**
 * GET /api/payment-plan/{paymentPlanId}
 * 查询已创建的付款计划。
 */
export async function getPaymentPlan(paymentPlanId: string): Promise<PaymentPlan> {
  return request<PaymentPlan>(`/api/payment-plan/${encodeURIComponent(paymentPlanId)}`);
}
