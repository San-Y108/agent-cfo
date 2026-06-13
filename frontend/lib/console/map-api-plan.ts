import type {
  BudgetRule,
  CawStatus,
  PaymentExecutionResult,
  PaymentItem,
} from "@/lib/api/types";
import type {
  BudgetRules,
  ContributorRecord,
  PaymentPlanItem,
} from "@/lib/types/console";

export function toApiBudgetRule(rule: BudgetRules): BudgetRule {
  return {
    monthlyBudget: rule.monthlyBudget,
    singlePaymentLimit: rule.singlePaymentLimit,
    allowedToken: rule.allowedToken,
    whitelist: rule.whitelist,
    requiresHumanApproval: true,
  };
}

export function toApiContributions(records: ContributorRecord[]) {
  return records.map(({ name, role, task, wallet, amount, token }) => ({
    name,
    role,
    task,
    wallet,
    amount,
    token,
  }));
}

function findRecord(records: ContributorRecord[], item: PaymentItem): ContributorRecord {
  const matched = records.find(
    (r) =>
      r.wallet.toLowerCase() === item.wallet.toLowerCase() ||
      r.name === item.recipient
  );
  if (matched) {
    return { ...matched, id: item.id };
  }
  return {
    id: item.id,
    name: item.recipient,
    role: "",
    task: item.task,
    wallet: item.wallet,
    amount: item.amount,
    token: item.token,
  };
}

function normalizeStatus(
  status: PaymentItem["status"]
): PaymentPlanItem["status"] {
  if (status === "Blocked" || status === "Failed") return "Blocked";
  if (status === "Executed") return "Executed";
  return "Ready";
}

export function mapRiskPaymentsToPlanItems(
  payments: PaymentItem[],
  records: ContributorRecord[]
): PaymentPlanItem[] {
  return payments.map((item) => {
    const record = findRecord(records, item);
    const status = normalizeStatus(item.status);
    const riskReason =
      item.risks?.[0] ??
      (status === "Blocked" ? item.reason : undefined);
    return { record, status, riskReason };
  });
}

export function mergeExecutionIntoPlan(
  plan: PaymentPlanItem[],
  execution: PaymentExecutionResult
): PaymentPlanItem[] {
  const byPaymentId = new Map(
    execution.payments.map((p) => [p.paymentItemId, p])
  );
  return plan.map((item) => {
    const exec = byPaymentId.get(item.record.id);
    if (!exec || item.status === "Blocked") return item;
    if (exec.status === "Executed") {
      return {
        ...item,
        status: "Executed" as const,
        txHash: exec.txHash ?? undefined,
      };
    }
    if (exec.status === "Failed") {
      return {
        ...item,
        status: "Blocked" as const,
        riskReason: exec.error ?? "Execution failed",
      };
    }
    return item;
  });
}

export function executionToCawStatuses(
  execution: PaymentExecutionResult
): CawStatus[] {
  const now = new Date().toISOString();
  return execution.payments
    .filter((p) => p.status === "Executed" || p.cawRequestId)
    .map((p) => ({
      cawRequestId: p.cawRequestId,
      executionId: execution.executionId,
      paymentItemId: p.paymentItemId,
      providerStatus: p.status.toLowerCase(),
      normalizedStatus: p.status,
      mode: execution.mode,
      network: p.network,
      agentWalletAddress: p.agentWalletAddress || execution.agentWalletAddress,
      txHash: p.txHash,
      error: p.error ?? null,
      diagnosticCode: p.diagnosticCode ?? null,
      lastCheckedAt: now,
    }));
}
