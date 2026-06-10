/**
 * AgentCFO API contract types.
 *
 * 这些类型是后端 FastAPI Pydantic models 的镜像（app/models.py）。
 * 后端是唯一 contract source of truth；mock mode 与 real mode 共用同一套类型。
 * 修改前请先核对 app/models.py 与 app/routers/payments.py。
 */

export type PaymentStatus =
  | "Ready"
  | "NeedsApproval"
  | "Blocked"
  | "Executed"
  | "Failed";

export type RiskLevel = "Unchecked" | "Low" | "Medium" | "High" | "Blocked";

// ---- Request payloads ----

export interface ContributionRecord {
  name: string;
  role: string;
  task: string;
  wallet: string;
  amount: number;
  token: string;
}

export interface BudgetRule {
  monthlyBudget: number;
  singlePaymentLimit: number;
  allowedToken: string;
  whitelist: string[];
  requiresHumanApproval: boolean;
}

export interface PaymentPlanRequest {
  contributions: ContributionRecord[];
  budgetRule: BudgetRule;
}

export interface RiskCheckRequest {
  paymentPlanId: string;
  budgetRule: BudgetRule;
}

export interface HumanApproval {
  approved: boolean;
  approvedBy?: string | null;
}

export interface ExecutePaymentRequest {
  paymentPlanId: string;
  approvedPaymentIds: string[];
  humanApproval: HumanApproval;
}

// ---- Response payloads ----

export interface PaymentItem {
  id: string;
  recipient: string;
  task: string;
  wallet: string;
  amount: number;
  token: string;
  reason: string;
  status: PaymentStatus;
  risks: string[];
}

export interface PaymentPlan {
  paymentPlanId: string;
  summary: string;
  totalAmount: number;
  riskLevel: RiskLevel;
  payments: PaymentItem[];
}

export interface RiskCheckResult {
  paymentPlanId: string;
  overallStatus: PaymentStatus;
  riskLevel: RiskLevel;
  remainingBudget: number;
  requiresHumanApproval: boolean;
  payments: PaymentItem[];
}

export interface PaymentExecutionItem {
  paymentItemId: string;
  status: PaymentStatus;
  mode: string;
  network: string;
  agentWalletAddress: string;
  txHash: string | null;
  cawRequestId: string;
  error?: string | null;
  diagnosticCode?: string | null;
}

export interface PaymentExecutionResult {
  executionId: string;
  auditReportId: string;
  mode: string;
  agentWalletAddress: string;
  payments: PaymentExecutionItem[];
}

export interface AuditReport {
  auditReportId: string;
  mode: string;
  paymentPlan: PaymentPlan;
  riskCheck: RiskCheckResult;
  humanApproval: HumanApproval;
  execution: PaymentExecutionResult;
  remainingBudget: number;
  auditVersion: string;
  inputSummary: Record<string, any>;
  decisionTrail: Array<Record<string, any>>;
  riskRuleEvidence: Array<Record<string, any>>;
  humanApprovalEvidence: Record<string, any>;
  cawEvidence: Array<Record<string, any>>;
  outcomeSummary: Record<string, any>;
  snapshot: Record<string, any>;
}

export interface CawStatus {
  cawRequestId: string;
  executionId: string;
  paymentItemId: string;
  providerStatus: string;
  normalizedStatus: PaymentStatus;
  mode: string;
  network: string;
  agentWalletAddress: string;
  txHash: string | null;
  error: string | null;
  diagnosticCode: string | null;
  lastCheckedAt: string;
}

// ---- P2 Extension Types ----

export type ExternalReferenceType =
  | "request_invoice"
  | "sablier_stream_preview"
  | "safe_permission_reference"
  | "multichain_readiness"
  | "treasury_budget_partition";

export interface ExternalReference {
  externalReferenceId: string;
  referenceType: ExternalReferenceType;
  provider: string;
  label: string;
  paymentPlanId: string | null;
  paymentItemId: string | null;
  auditReportId: string | null;
  cawRequestId: string | null;
  status: string;
  metadata: Record<string, any>;
  mode: string;
  liveIntegrationEnabled: boolean;
  createdAt: string;
}

export interface ExternalReferenceList {
  items: ExternalReference[];
}

export interface ExternalReferenceCreate {
  referenceType: ExternalReferenceType;
  provider: string;
  label: string;
  paymentPlanId?: string | null;
  paymentItemId?: string | null;
  auditReportId?: string | null;
  cawRequestId?: string | null;
  status: string;
  metadata?: Record<string, any>;
}

export interface RequestInvoiceRecord {
  externalReferenceId: string;
  paymentPlanId: string;
  paymentItemId: string;
  auditReportId: string | null;
  cawRequestId: string | null;
  requestFinanceInvoiceId: string;
  requestId: string | null;
  status: string;
  hostedUrl: string | null;
  txHashReference: string | null;
  externalReference: ExternalReference;
}

export interface RequestInvoiceCreate {
  paymentPlanId: string;
  paymentItemId: string;
  auditReportId?: string | null;
  cawRequestId?: string | null;
  requestFinanceInvoiceId: string;
  requestId?: string | null;
  status: string;
  hostedUrl?: string | null;
  txHashReference?: string | null;
}

export interface SablierStreamPreview {
  externalReferenceId: string;
  mode: string;
  streamCreated: boolean;
  paymentPlanId: string;
  paymentItemId: string;
  recipient: string;
  wallet: string;
  amount: number;
  token: string;
  durationDays: number;
  durationSeconds: number;
  ratePerSecond: number;
  safetyNotes: string[];
}

export interface SablierStreamPreviewRequest {
  paymentPlanId: string;
  paymentItemId: string;
  durationDays: number;
}

export interface SafePermissionReference {
  externalReferenceId: string;
  mode: string;
  moduleEnabled: boolean;
  paymentPlanId: string;
  safeAddress: string;
  moduleName: string;
  permissionNotes: string[];
  safetyNotes: string[];
}

export interface SafePermissionReferenceRequest {
  paymentPlanId: string;
  safeAddress: string;
  moduleName: string;
  permissionNotes?: string[];
}

export interface MultichainReadiness {
  currentExecutionBoundary: Record<string, any>;
  liveMultichainExecutionEnabled: boolean;
  chains: Array<Record<string, any>>;
  safetyNotes: string[];
}

export interface TreasuryBudgetPartition {
  mode: string;
  authorizationChanged: boolean;
  paymentPlanId: string;
  totalPlannedAmount: number;
  partitions: Array<Record<string, any>>;
  safetyNotes: string[];
}
