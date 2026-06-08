export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error?: ApiError;
  meta?: Record<string, unknown>;
}

export interface Contributor {
  id: string;
  name: string;
  walletAddress: string;
  role: string;
}

export interface ContributionRecord {
  id: string;
  contributor: Contributor;
  taskDescription: string;
  amount: number;
  token: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface SubscriptionBill {
  id: string;
  serviceName: string;
  amount: number;
  token: string;
  billingPeriod: string;
}

export interface BudgetRule {
  monthlyBudget: number;
  singlePaymentLimit: number;
  allowedToken: string;
  requiresHumanApproval: boolean;
  whitelist: string[]; // wallet addresses
}

export interface PaymentItem {
  id: string;
  recipient: Contributor;
  amount: number;
  token: string;
  description: string;
}

export type PaymentPlanStatus =
  | "draft"
  | "analyzing"
  | "risk_checked"
  | "pending_approval"
  | "executing"
  | "completed"
  | "audit_generated";

export interface PaymentPlan {
  id: string;
  items: PaymentItem[];
  totalAmount: number;
  token: string;
  status: PaymentPlanStatus;
  createdAt: string;
}

export interface RiskCheckResult {
  passed: boolean;
  checks: {
    budgetCheck: { passed: boolean; reason?: string };
    whitelistCheck: { passed: boolean; blockedWallets?: string[]; reason?: string };
    limitCheck: { passed: boolean; exceededItems?: string[]; reason?: string };
    duplicateCheck: { passed: boolean; duplicates?: string[]; reason?: string };
  };
}

export interface CAWExecution {
  agentWalletAddress: string;
  testnetName: string;
  transactionHash: string;
  paymentStatus: "pending" | "success" | "failed";
  token: string;
  amount: number;
  recipientWallet: string;
  permissionBoundary: string;
}

export interface AuditReport {
  id: string;
  paymentPlanId: string;
  timestamp: string;
  summary: string;
  transactions: CAWExecution[];
  riskCheck: RiskCheckResult;
  approvedBy: string;
}
