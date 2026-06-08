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
from app.services.risk_engine import check_payment_risks
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
            task=contribution.task,
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

    overall_status, risk_level, remaining_budget, checked_payments = check_payment_risks(
        payment_plan.payments,
        request.budgetRule,
    )

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
    executed_payments = []
    for payment in selected_payments:
        try:
            executed_payments.append(caw_adapter.create_transfer(execution_id, payment))
        except Exception as exc:
            executed_payments.append(
                caw_adapter.failed_transfer(execution_id, payment, str(exc))
            )
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


@router.get("/audit-report/{auditReportId}", response_model=AuditReport)
def get_audit_report(auditReportId: str):
    audit_report = store.audit_reports.get(auditReportId)
    if audit_report is None:
        raise HTTPException(status_code=404, detail="Audit report not found")
    return audit_report
