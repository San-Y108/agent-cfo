from collections import Counter

from fastapi import APIRouter, HTTPException

from app.models import (
    AuditReport,
    ExecutePaymentRequest,
    PaymentExecutionResult,
    PaymentItem,
    PaymentPlan,
    PaymentPlanRequest,
    PaymentStatus,
    RiskCheckRequest,
    RiskCheckResult,
    RiskLevel,
)
from app.services.caw_adapter import MockCawAdapter
from app.store import store

router = APIRouter(prefix="/api", tags=["payments"])
caw_adapter = MockCawAdapter()


@router.post("/payment-plan", response_model=PaymentPlan)
def create_payment_plan(request: PaymentPlanRequest):
    payment_plan_id = store.next_plan_id()
    payments = [
        PaymentItem(
            id=f"pay_{index:03d}",
            recipient=contribution.name,
            wallet=contribution.wallet,
            amount=contribution.amount,
            token=contribution.token,
            reason=f"Completed task: {contribution.task}",
            status=PaymentStatus.READY,
            risks=[],
        )
        for index, contribution in enumerate(request.contributions, start=1)
    ]
    total_amount = sum(payment.amount for payment in payments)
    payment_plan = PaymentPlan(
        paymentPlanId=payment_plan_id,
        summary=f"AgentCFO generated a payment plan for {len(payments)} payment item(s).",
        totalAmount=total_amount,
        riskLevel=RiskLevel.UNCHECKED,
        payments=payments,
    )
    store.payment_plans[payment_plan_id] = payment_plan
    return payment_plan


@router.post("/risk-check", response_model=RiskCheckResult)
def run_risk_check(request: RiskCheckRequest):
    payment_plan = store.payment_plans.get(request.paymentPlanId)
    if payment_plan is None:
        raise HTTPException(status_code=404, detail="Payment plan not found")

    wallet_counts = Counter(payment.wallet for payment in payment_plan.payments)
    task_counts = Counter(payment.reason for payment in payment_plan.payments)
    total_amount = sum(payment.amount for payment in payment_plan.payments)
    over_budget = total_amount > request.budgetRule.monthlyBudget

    checked_payments = [
        _check_payment(payment, request, wallet_counts, task_counts, over_budget)
        for payment in payment_plan.payments
    ]
    any_blocked = any(payment.status == PaymentStatus.BLOCKED for payment in checked_payments)
    remaining_budget = request.budgetRule.monthlyBudget - total_amount

    if any_blocked:
        overall_status = PaymentStatus.BLOCKED
        risk_level = RiskLevel.BLOCKED
    elif request.budgetRule.requiresHumanApproval:
        overall_status = PaymentStatus.NEEDS_APPROVAL
        risk_level = RiskLevel.LOW
    else:
        overall_status = PaymentStatus.READY
        risk_level = RiskLevel.LOW

    result = RiskCheckResult(
        paymentPlanId=request.paymentPlanId,
        overallStatus=overall_status,
        riskLevel=risk_level,
        remainingBudget=remaining_budget,
        requiresHumanApproval=request.budgetRule.requiresHumanApproval,
        payments=checked_payments,
    )
    store.risk_checks[request.paymentPlanId] = result
    return result


@router.post("/execute-payment", response_model=PaymentExecutionResult)
def execute_payment(request: ExecutePaymentRequest):
    payment_plan = store.payment_plans.get(request.paymentPlanId)
    if payment_plan is None:
        raise HTTPException(status_code=404, detail="Payment plan not found")

    risk_check = store.risk_checks.get(request.paymentPlanId)
    if risk_check is None:
        raise HTTPException(status_code=400, detail="Risk check is required before execution")

    if not request.humanApproval.approved:
        raise HTTPException(status_code=400, detail="Human approval is required before execution")

    payment_by_id = {payment.id: payment for payment in risk_check.payments}
    selected_payments = []
    for payment_id in request.approvedPaymentIds:
        payment = payment_by_id.get(payment_id)
        if payment is None:
            raise HTTPException(status_code=404, detail=f"Payment item not found: {payment_id}")
        selected_payments.append(payment)

    if any(payment.status == PaymentStatus.BLOCKED for payment in selected_payments):
        raise HTTPException(status_code=400, detail="Blocked payments cannot be executed")

    executable_statuses = {PaymentStatus.READY, PaymentStatus.NEEDS_APPROVAL}
    if any(payment.status not in executable_statuses for payment in selected_payments):
        raise HTTPException(status_code=400, detail="Payment item is not executable")

    execution_id = store.next_execution_id()
    executed_payments = [
        caw_adapter.create_transfer(execution_id, payment) for payment in selected_payments
    ]
    audit_report_id = store.next_audit_report_id()
    execution = PaymentExecutionResult(
        executionId=execution_id,
        auditReportId=audit_report_id,
        mode=caw_adapter.mode,
        agentWalletAddress=caw_adapter.agent_wallet_address,
        payments=executed_payments,
    )
    audit_report = AuditReport(
        auditReportId=audit_report_id,
        mode=caw_adapter.mode,
        paymentPlan=payment_plan,
        riskCheck=risk_check,
        humanApproval=request.humanApproval,
        execution=execution,
        remainingBudget=risk_check.remainingBudget,
    )
    store.executions[execution_id] = execution
    store.audit_reports[audit_report_id] = audit_report
    return execution


@router.get("/audit-report/{audit_report_id}", response_model=AuditReport)
def get_audit_report(audit_report_id: str):
    audit_report = store.audit_reports.get(audit_report_id)
    if audit_report is None:
        raise HTTPException(status_code=404, detail="Audit report not found")
    return audit_report


def _check_payment(
    payment: PaymentItem,
    request: RiskCheckRequest,
    wallet_counts: Counter,
    task_counts: Counter,
    over_budget: bool,
) -> PaymentItem:
    risks = []
    if over_budget:
        risks.append("Total payment amount exceeds monthly budget")
    if payment.amount > request.budgetRule.singlePaymentLimit:
        risks.append("Payment amount exceeds single payment limit")
    if payment.token != request.budgetRule.allowedToken:
        risks.append("Token is not allowed")
    if payment.wallet not in request.budgetRule.whitelist:
        risks.append("Recipient wallet is not in whitelist")
    if wallet_counts[payment.wallet] > 1:
        risks.append("Duplicate recipient wallet")
    if task_counts[payment.reason] > 1:
        risks.append("Duplicate task")

    if risks:
        status = PaymentStatus.BLOCKED
    elif request.budgetRule.requiresHumanApproval:
        status = PaymentStatus.NEEDS_APPROVAL
    else:
        status = PaymentStatus.READY

    return payment.model_copy(update={"status": status, "risks": risks})

