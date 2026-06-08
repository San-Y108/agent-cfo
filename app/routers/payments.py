from fastapi import APIRouter, HTTPException

from app.models import (
    AuditReport,
    CawStatus,
    ExecutePaymentRequest,
    PaymentExecutionResult,
    PaymentPlan,
    PaymentPlanRequest,
    PaymentStatus,
    RiskCheckRequest,
    RiskCheckResult,
)
from app.services.caw_adapter import CawAdapter, create_caw_adapter
from app.services.payment_planner import create_payment_planner
from app.services.risk_engine import check_payment_risks
from app.store import store

router = APIRouter(prefix="/api", tags=["payments"])
caw_adapter: CawAdapter = create_caw_adapter()
payment_planner = create_payment_planner()


@router.post("/payment-plan", response_model=PaymentPlan)
def create_payment_plan(request: PaymentPlanRequest):
    payment_plan_id = store.next_plan_id()
    payment_plan = payment_planner.generate(request, payment_plan_id)
    store.save_payment_plan(payment_plan)
    return payment_plan


@router.post("/risk-check", response_model=RiskCheckResult)
def run_risk_check(request: RiskCheckRequest):
    payment_plan = store.get_payment_plan(request.paymentPlanId)
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
    store.save_risk_check(result)
    return result


@router.post("/execute-payment", response_model=PaymentExecutionResult)
def execute_payment(request: ExecutePaymentRequest):
    payment_plan = store.get_payment_plan(request.paymentPlanId)
    if payment_plan is None:
        raise HTTPException(status_code=404, detail="Payment plan not found")

    risk_check = store.get_risk_check(request.paymentPlanId)
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
    for payment in executed_payments:
        store.save_caw_status(CawStatus.from_execution_item(execution_id, payment))

    audit_report = AuditReport(
        auditReportId=audit_report_id,
        mode=caw_adapter.mode,
        paymentPlan=payment_plan,
        riskCheck=risk_check,
        humanApproval=request.humanApproval,
        execution=execution,
        remainingBudget=risk_check.remainingBudget,
    )
    store.save_execution(execution)
    store.save_audit_report(audit_report)
    return execution


@router.get("/audit-report/{auditReportId}", response_model=AuditReport)
def get_audit_report(auditReportId: str):
    audit_report = store.get_audit_report(auditReportId)
    if audit_report is None:
        raise HTTPException(status_code=404, detail="Audit report not found")
    return audit_report


@router.get("/caw-status/{cawRequestId}", response_model=CawStatus)
def get_caw_status(cawRequestId: str):
    caw_status = store.get_caw_status(cawRequestId)
    if caw_status is None:
        raise HTTPException(status_code=404, detail="CAW status not found")
    return caw_status
