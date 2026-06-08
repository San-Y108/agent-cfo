import { request } from "./client";
import type { PaymentPlan, ApiResponse } from "./types";

/**
 * Payment Plan API adapter.
 *
 * 当前为 Mock-first，组件层应使用 `lib/mock/payment-plan.ts`。
 * 后续联调时在此处接入真实 request()。
 */

export async function getPaymentPlans(): Promise<ApiResponse<PaymentPlan[]>> {
  return request<ApiResponse<PaymentPlan[]>>("/api/payment-plans");
}

export async function getPaymentPlan(id: string): Promise<ApiResponse<PaymentPlan>> {
  return request<ApiResponse<PaymentPlan>>(`/api/payment-plans/${id}`);
}

export async function approvePaymentPlan(
  id: string
): Promise<ApiResponse<PaymentPlan>> {
  return request<ApiResponse<PaymentPlan>>(`/api/payment-plans/${id}/approve`, {
    method: "POST",
  });
}
