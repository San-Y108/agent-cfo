import type { PaymentExecutionItem, PaymentExecutionResult } from "../api/types";
import { mockRiskCheckResult } from "./risk-check";

/**
 * mock 版 POST /api/execute-payment 响应。
 * 镜像后端 MockCawAdapter：mode=mock、network=mock-testnet、
 * agentWalletAddress=mock-agent-wallet、txHash=null、cawRequestId=mock_caw_{exec}_{pay}。
 * 只执行非 Blocked 的付款项（Bob 被排除）。
 */
const EXECUTION_ID = "exec_demo_001";
const AUDIT_REPORT_ID = "audit_demo_001";
const AGENT_WALLET = "mock-agent-wallet";

const approvedPayments = mockRiskCheckResult.payments.filter(
  (payment) => payment.status !== "Blocked"
);

const executedItems: PaymentExecutionItem[] = approvedPayments.map((payment) => ({
  paymentItemId: payment.id,
  status: "Executed",
  mode: "mock",
  network: "mock-testnet",
  agentWalletAddress: AGENT_WALLET,
  txHash: null,
  cawRequestId: `mock_caw_${EXECUTION_ID}_${payment.id}`,
}));

export const mockExecutionResult: PaymentExecutionResult = {
  executionId: EXECUTION_ID,
  auditReportId: AUDIT_REPORT_ID,
  mode: "mock",
  agentWalletAddress: AGENT_WALLET,
  payments: executedItems,
};
