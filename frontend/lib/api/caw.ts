import { postJson } from "./client";
import type { ExecutePaymentRequest, PaymentExecutionResult } from "./types";

/**
 * Cobo Agentic Wallet execution adapter — POST /api/execute-payment
 * mock mode 下组件应使用 `lib/mock/caw-execution.ts`。
 */
export async function executePayment(
  payload: ExecutePaymentRequest
): Promise<PaymentExecutionResult> {
  return postJson<PaymentExecutionResult>("/api/execute-payment", payload);
}
