import { request } from "./client";
import type { CAWExecution, ApiResponse } from "./types";

/**
 * CAW Execution API adapter.
 *
 * 当前为 Mock-first，组件层应使用 `lib/mock/caw-execution.ts`。
 * 后续联调时在此处接入真实 request()。
 */

export async function executePayment(
  paymentPlanId: string
): Promise<ApiResponse<CAWExecution[]>> {
  return request<ApiResponse<CAWExecution[]>>(`/api/caw/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentPlanId }),
  });
}

export async function getExecutionStatus(
  txHash: string
): Promise<ApiResponse<CAWExecution>> {
  return request<ApiResponse<CAWExecution>>(`/api/caw/status/${txHash}`);
}
