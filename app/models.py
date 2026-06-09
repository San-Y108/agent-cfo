from datetime import UTC, datetime
from enum import StrEnum

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
