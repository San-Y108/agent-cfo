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
    agentWalletAddress: str
    txHash: str | None
    cawRequestId: str
    error: str | None = None


class PaymentExecutionResult(BaseModel):
    executionId: str
    auditReportId: str
    mode: str
    agentWalletAddress: str
    payments: list[PaymentExecutionItem]


class AuditReport(BaseModel):
    auditReportId: str
    mode: str
    paymentPlan: PaymentPlan
    riskCheck: RiskCheckResult
    humanApproval: HumanApproval
    execution: PaymentExecutionResult
    remainingBudget: float

