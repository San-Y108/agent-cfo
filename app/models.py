from datetime import UTC, datetime
from enum import StrEnum
from typing import Any, Literal

from pydantic import BaseModel, Field


class PaymentStatus(StrEnum):
    READY = "Ready"
    NEEDS_APPROVAL = "NeedsApproval"
    BLOCKED = "Blocked"
    EXECUTED = "Executed"
    FAILED = "Failed"


class RiskLevel(StrEnum):
    UNCHECKED = "Unchecked"
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    BLOCKED = "Blocked"


class PlannerMode(StrEnum):
    MOCK = "mock"
    OPENAI = "openai"


class ExternalReferenceType(StrEnum):
    REQUEST_INVOICE = "request_invoice"
    SABLIER_STREAM_PREVIEW = "sablier_stream_preview"
    SAFE_PERMISSION_REFERENCE = "safe_permission_reference"
    MULTICHAIN_READINESS = "multichain_readiness"
    TREASURY_BUDGET_PARTITION = "treasury_budget_partition"


class ContributionRecord(BaseModel):
    name: str
    role: str
    task: str
    wallet: str
    amount: float = Field(gt=0)
    token: str


class BudgetRule(BaseModel):
    monthlyBudget: float = Field(gt=0)
    singlePaymentLimit: float = Field(gt=0)
    allowedToken: str
    whitelist: list[str]
    requiresHumanApproval: bool = True


class PaymentItem(BaseModel):
    id: str
    recipient: str
    task: str
    wallet: str
    amount: float
    token: str
    reason: str
    status: PaymentStatus
    risks: list[str] = Field(default_factory=list)


class PaymentPlanRequest(BaseModel):
    contributions: list[ContributionRecord]
    budgetRule: BudgetRule


class PaymentPlan(BaseModel):
    paymentPlanId: str
    summary: str
    totalAmount: float
    riskLevel: RiskLevel
    payments: list[PaymentItem]
    plannerMode: PlannerMode = PlannerMode.MOCK
    plannerWarnings: list[str] = Field(default_factory=list)


class RiskCheckRequest(BaseModel):
    paymentPlanId: str
    budgetRule: BudgetRule


class RiskCheckResult(BaseModel):
    paymentPlanId: str
    overallStatus: PaymentStatus
    riskLevel: RiskLevel
    remainingBudget: float
    requiresHumanApproval: bool
    payments: list[PaymentItem]


class HumanApproval(BaseModel):
    approved: bool
    approvedBy: str | None = None


class ExecutePaymentRequest(BaseModel):
    paymentPlanId: str
    approvedPaymentIds: list[str]
    humanApproval: HumanApproval


class PaymentExecutionItem(BaseModel):
    paymentItemId: str
    status: PaymentStatus
    mode: str
    network: str
    agentWalletAddress: str
    txHash: str | None
    cawRequestId: str
    error: str | None = None
    diagnosticCode: str | None = None


class PaymentExecutionResult(BaseModel):
    executionId: str
    auditReportId: str
    mode: str
    agentWalletAddress: str
    payments: list[PaymentExecutionItem]


class CawStatus(BaseModel):
    cawRequestId: str
    executionId: str
    paymentItemId: str
    providerStatus: str
    normalizedStatus: PaymentStatus
    mode: str
    network: str
    agentWalletAddress: str
    txHash: str | None
    error: str | None = None
    diagnosticCode: str | None = None
    lastCheckedAt: str

    @classmethod
    def from_execution_item(cls, execution_id: str, payment: PaymentExecutionItem):
        provider_status = "executed" if payment.status == PaymentStatus.EXECUTED else "failed"
        return cls(
            cawRequestId=payment.cawRequestId,
            executionId=execution_id,
            paymentItemId=payment.paymentItemId,
            providerStatus=provider_status,
            normalizedStatus=payment.status,
            mode=payment.mode,
            network=payment.network,
            agentWalletAddress=payment.agentWalletAddress,
            txHash=payment.txHash,
            error=payment.error,
            diagnosticCode=payment.diagnosticCode,
            lastCheckedAt=datetime.now(UTC).isoformat(),
        )


class AuditReport(BaseModel):
    auditReportId: str
    mode: str
    paymentPlan: PaymentPlan
    riskCheck: RiskCheckResult
    humanApproval: HumanApproval
    execution: PaymentExecutionResult
    remainingBudget: float
    auditVersion: str = "p0-evidence-v1"
    inputSummary: dict = Field(default_factory=dict)
    decisionTrail: list[dict] = Field(default_factory=list)
    riskRuleEvidence: list[dict] = Field(default_factory=list)
    humanApprovalEvidence: dict = Field(default_factory=dict)
    cawEvidence: list[dict] = Field(default_factory=list)
    outcomeSummary: dict = Field(default_factory=dict)
    snapshot: dict = Field(default_factory=dict)


class ExternalReferenceCreate(BaseModel):
    referenceType: ExternalReferenceType
    provider: str
    label: str
    paymentPlanId: str | None = None
    paymentItemId: str | None = None
    auditReportId: str | None = None
    cawRequestId: str | None = None
    status: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class ExternalReference(BaseModel):
    externalReferenceId: str
    referenceType: ExternalReferenceType
    provider: str
    label: str
    paymentPlanId: str | None = None
    paymentItemId: str | None = None
    auditReportId: str | None = None
    cawRequestId: str | None = None
    status: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    mode: str = "metadata-only"
    liveIntegrationEnabled: bool = False
    createdAt: str


class ExternalReferenceList(BaseModel):
    items: list[ExternalReference]


class RequestInvoiceCreate(BaseModel):
    paymentPlanId: str
    paymentItemId: str
    auditReportId: str | None = None
    cawRequestId: str | None = None
    requestFinanceInvoiceId: str
    requestId: str | None = None
    status: str
    hostedUrl: str | None = None
    txHashReference: str | None = None
    buyerEmail: str | None = None
    invoiceNumber: str | None = None
    invoiceItemName: str | None = None
    invoiceCurrency: str | None = None
    invoiceQuantity: float | None = Field(default=None, gt=0)
    invoiceUnitPrice: float | None = Field(default=None, gt=0)
    paymentCurrency: str | None = None
    paymentNetwork: str | None = None
    paymentAddress: str | None = None
    creationDate: str | None = None
    dueDate: str | None = None


class RequestInvoiceRecord(BaseModel):
    externalReferenceId: str
    paymentPlanId: str
    paymentItemId: str
    auditReportId: str | None = None
    cawRequestId: str | None = None
    requestFinanceInvoiceId: str
    requestId: str | None = None
    status: str
    hostedUrl: str | None = None
    txHashReference: str | None = None
    externalReference: ExternalReference


class SablierStreamPreviewRequest(BaseModel):
    paymentPlanId: str
    paymentItemId: str
    durationDays: int = Field(gt=0)


class SablierStreamPreview(BaseModel):
    externalReferenceId: str
    mode: str
    streamCreated: bool
    paymentPlanId: str
    paymentItemId: str
    recipient: str
    wallet: str
    amount: float
    token: str
    durationDays: int
    durationSeconds: int
    ratePerSecond: float
    safetyNotes: list[str]


class SafePermissionReferenceRequest(BaseModel):
    paymentPlanId: str
    safeAddress: str
    moduleName: str
    permissionNotes: list[str] = Field(default_factory=list)


class SafePermissionReference(BaseModel):
    externalReferenceId: str
    mode: str
    moduleEnabled: bool
    paymentPlanId: str
    safeAddress: str
    moduleName: str
    permissionNotes: list[str]
    safetyNotes: list[str]


class MultichainReadiness(BaseModel):
    currentExecutionBoundary: dict[str, Any]
    liveMultichainExecutionEnabled: bool
    chains: list[dict[str, Any]]
    safetyNotes: list[str]


class TreasuryBudgetPartition(BaseModel):
    mode: str
    authorizationChanged: bool
    paymentPlanId: str
    totalPlannedAmount: float
    partitions: list[dict[str, Any]]
    safetyNotes: list[str]


class EvidenceTimelineEvent(BaseModel):
    eventType: str
    label: str
    status: str
    mode: str
    ids: dict[str, str | None] = Field(default_factory=dict)
    timestamp: str | None = None
    evidenceLinks: list[dict[str, Any]] = Field(default_factory=list)
    safetyNotes: list[str] = Field(default_factory=list)


class EvidenceTimeline(BaseModel):
    mode: str
    auditReportId: str
    paymentPlanId: str
    auditSnapshotImmutable: bool
    events: list[EvidenceTimelineEvent]
    safetyNotes: list[str]


class DemoScenario(BaseModel):
    scenarioId: str
    label: str
    category: str
    method: str
    endpoint: str
    payload: dict[str, Any] | None = None
    expectedStatus: str
    curlExample: str
    safetyNotes: list[str] = Field(default_factory=list)


class DemoScenarioPack(BaseModel):
    mode: str
    externalSystemsTouched: bool
    scenarios: list[DemoScenario]


class RiskWhatIfPayment(BaseModel):
    recipient: str
    task: str
    wallet: str
    amount: float = Field(gt=0)
    token: str
    reason: str = "what-if"


class RiskWhatIfRequest(BaseModel):
    payments: list[RiskWhatIfPayment]
    budgetRule: BudgetRule
    humanApproval: HumanApproval | None = None


class RiskWhatIfGuardrail(BaseModel):
    guardrailId: str
    label: str
    status: str
    affectedPaymentIds: list[str] = Field(default_factory=list)
    reason: str


class RiskWhatIfResult(BaseModel):
    mode: str
    createsPaymentPlan: bool
    executesPayment: bool
    overallStatus: PaymentStatus
    riskLevel: RiskLevel
    remainingBudget: float
    requiresHumanApproval: bool
    payments: list[PaymentItem]
    guardrails: list[RiskWhatIfGuardrail]
    safetyNotes: list[str]


class PolicyGuardrailSummary(BaseModel):
    mode: str
    demoBudget: dict[str, Any]
    caw: dict[str, Any]
    requestFinance: dict[str, Any]
    sablier: dict[str, Any]
    safe: dict[str, Any]
    multichain: dict[str, Any]
    auditSnapshotImmutable: bool
    safetyNotes: list[str]


class EvidenceExport(BaseModel):
    mode: str
    paymentPlanId: str
    auditReportId: str
    cawRequestIds: list[str]
    externalReferenceIds: list[str]
    riskReasons: dict[str, list[str]]
    modeLabels: list[str]
    txHashState: str
    safetyDisclaimers: list[str]
    approvedDemoWording: str
    forbiddenWording: str


class RequestFinancePreflight(BaseModel):
    ready: bool
    missingFields: list[str]
    wouldCallProvider: bool
    requestFinanceMode: str
    invoiceCreateGuardEnabled: bool
    safetyNotes: list[str]


class PlannerExplainability(BaseModel):
    mode: str
    paymentPlanId: str
    plannerMode: str
    schemaValidation: dict[str, Any]
    allowedLlmResponsibilities: list[str]
    forbiddenLlmResponsibilities: list[str]
    mockVsOpenAIComparison: dict[str, Any]
    malformedOutputFallbackDemo: dict[str, Any]
    reasonTrace: list[dict[str, Any]]
    safetyNotes: list[str]


class RequestFinanceLifecyclePreviewRequest(BaseModel):
    paymentPlanId: str
    paymentItemId: str
    auditReportId: str | None = None
    cawRequestId: str | None = None
    requestFinanceInvoiceId: str
    currentStatus: str
    events: list[str] = Field(default_factory=list)


class RequestFinanceLifecyclePreview(BaseModel):
    mode: str
    requestFinanceInvoiceId: str
    currentStatus: str
    providerTouched: bool
    customerEmailSent: bool
    onchainConversionCalled: bool
    paymentTriggered: bool
    linkedIds: dict[str, str | None]
    statusTimeline: list[dict[str, Any]]
    eventLog: list[dict[str, Any]]
    safetyNotes: list[str]


class RequestFinanceWebhookReplayRequest(BaseModel):
    eventId: str
    eventType: str
    invoiceId: str
    requestId: str | None = None
    status: str
    paymentPlanId: str
    paymentItemId: str
    auditReportId: str | None = None
    cawRequestId: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


class RequestFinanceWebhookReplayResult(BaseModel):
    mode: str
    replayResult: str
    acceptedEvent: bool
    duplicateEvent: bool
    normalizedStatus: str
    externalReferenceId: str | None = None
    providerTouched: bool
    emailSent: bool
    paymentTriggered: bool
    onChainConversion: bool
    linkedIds: dict[str, str | None]
    eventTimeline: list[dict[str, Any]]
    safetyNotes: list[str]


class ExternalReferenceIntegrityReport(BaseModel):
    orphanReferences: list[dict[str, Any]]
    duplicateInvoiceEventIds: list[dict[str, Any]]
    missingLinkedIds: list[dict[str, Any]]


class P2ReadinessReport(BaseModel):
    mode: str
    auditReportId: str
    paymentPlanId: str
    auditSnapshotImmutable: bool
    linkedExternalReferences: dict[str, Any]
    requestFinance: dict[str, Any]
    sablier: dict[str, Any]
    safe: dict[str, Any]
    multichain: dict[str, Any]
    treasury: dict[str, Any]
    missingLinks: list[str]
    integrity: ExternalReferenceIntegrityReport
    safetyFlags: dict[str, bool]
    safetyNotes: list[str]


class SablierPayrollSimulationRequest(BaseModel):
    paymentPlanId: str
    paymentItemId: str
    durationDays: int = Field(gt=0)
    elapsedSeconds: int = Field(default=0, ge=0)
    fundedAmount: float = Field(default=0, ge=0)
    withdrawnAmount: float = Field(default=0, ge=0)


class SablierPayrollSimulation(BaseModel):
    mode: str
    streamCreated: bool
    paymentPlanId: str
    paymentItemId: str
    lifecycleStates: list[str]
    durationSeconds: int
    elapsedSeconds: int
    ratePerSecond: float
    accruedAmount: float
    withdrawableAmount: float
    fundedAmount: float
    fundingRunwaySeconds: float | None
    insolventStatePreview: dict[str, Any]
    guardrails: list[dict[str, Any]]
    safetyNotes: list[str]


class SafeGuardPolicyDryRunRequest(BaseModel):
    safeAddress: str
    owners: list[str]
    threshold: int = Field(gt=0)
    proposedSigners: list[str] = Field(default_factory=list)
    operation: str
    to: str
    value: float = Field(default=0, ge=0)
    moduleName: str


class SafeGuardPolicyDryRun(BaseModel):
    mode: str
    safeAddress: str
    moduleName: str
    moduleEnabled: bool
    guardEnabled: bool
    wouldExecute: bool
    ownerThreshold: dict[str, Any]
    enablementChecklist: list[dict[str, Any]]
    riskMatrix: list[dict[str, Any]]
    blockedOperationExamples: list[dict[str, Any]]
    safeVsCawComparison: dict[str, Any]
    safetyNotes: list[str]


class TreasuryProposal(BaseModel):
    agentId: str
    paymentItemId: str
    requestedAmount: float = Field(gt=0)


class TreasuryCoordinationSimulationRequest(BaseModel):
    paymentPlanId: str
    departmentBudgets: dict[str, float]
    proposals: list[TreasuryProposal]


class TreasuryCoordinationSimulation(BaseModel):
    mode: str
    paymentPlanId: str
    authorizationChanged: bool
    humanApprovalRequired: bool
    deterministicRiskStillRequired: bool
    proposals: list[dict[str, Any]]
    conflicts: list[dict[str, Any]]
    approvalMatrix: list[dict[str, Any]]
    responsibilitySplit: list[dict[str, Any]]
    auditTimeline: list[dict[str, Any]]
    safetyNotes: list[str]


class DemoRunbook(BaseModel):
    mode: str
    liveActionsDefaultEnabled: bool
    steps: list[dict[str, Any]]
    expectedBadges: list[str]
    forbiddenClaims: list[str]
    safetyNotes: list[str]


class DemoStoryboard(BaseModel):
    mode: str
    frames: list[dict[str, Any]]
    safetyNotes: list[str]


class DemoBlockedExamples(BaseModel):
    mode: str
    examples: list[dict[str, Any]]
    safetyNotes: list[str]


class DemoContracts(BaseModel):
    mode: str
    noLiveActions: bool
    endpoints: dict[str, dict[str, Any]]
    globalInvariants: list[str]


class OpenApiLiteContract(BaseModel):
    path: str
    method: str
    purpose: str
    requestModel: str | None = None
    responseModel: str
    requiredFields: list[str]
    examplePayload: dict[str, Any] | None = None
    modeLabel: str
    liveActionBoundary: str
    safetyFlags: dict[str, bool]
    frontendDisplayHints: dict[str, Any]


class OpenApiLiteContracts(BaseModel):
    mode: str
    openapiSource: str
    fastapiOpenapiEnabled: bool
    docsUiEnabled: bool
    noSecrets: bool
    noLiveActions: bool
    contracts: list[OpenApiLiteContract]
    globalInvariants: list[str]


class AgentChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class AgentChatContext(BaseModel):
    monthlyBudget: float | None = None
    singlePaymentLimit: float | None = None
    allowedToken: str | None = None
    whitelist: list[str] = Field(default_factory=list)
    recordCount: int | None = None
    planItemCount: int | None = None
    planSummary: str | None = None
    flowStep: int | None = None


class AgentChatRequest(BaseModel):
    messages: list[AgentChatMessage]
    lang: Literal["en", "zh"] = "en"
    context: AgentChatContext | None = None


class AgentChatResponseMessage(BaseModel):
    role: Literal["assistant"] = "assistant"
    content: str


class AgentChatResponse(BaseModel):
    message: AgentChatResponseMessage
