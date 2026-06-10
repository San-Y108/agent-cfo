import { postJson, request } from "./client";
import type { CawStatus, ExecutePaymentRequest, PaymentExecutionResult } from "./types";

/**
 * Cobo Agentic Wallet execution adapter — POST /api/execute-payment
 * mock mode 下组件应使用 `lib/mock/caw-execution.ts`。
 */
export async function executePayment(
  payload: ExecutePaymentRequest
): Promise<PaymentExecutionResult> {
  return postJson<PaymentExecutionResult>("/api/execute-payment", payload);
}

/**
 * GET /api/caw-status/{cawRequestId}
 * 获取当前 CAW 状态（可能包含缓存值）。
 */
export async function getCawStatus(cawRequestId: string): Promise<CawStatus> {
  return request<CawStatus>(`/api/caw-status/${encodeURIComponent(cawRequestId)}`);
}

/**
 * GET /api/caw-status/{cawRequestId}/refresh
 * 刷新 CAW 最新状态（查询 provider）。
 */
export async function refreshCawStatus(cawRequestId: string): Promise<CawStatus> {
  return request<CawStatus>(`/api/caw-status/${encodeURIComponent(cawRequestId)}/refresh`);
}
