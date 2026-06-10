import os

os.environ["AGENTCFO_DB_PATH"] = ":memory:"

from app.models import (
    AuditReport,
    CawStatus,
    ExternalReference,
    ExternalReferenceType,
    HumanApproval,
    PaymentExecutionItem,
    PaymentExecutionResult,
    PaymentItem,
    PaymentPlan,
    PaymentStatus,
    RiskCheckResult,
    RiskLevel,
)
from app.store import SQLiteStore


def sample_plan():
    return PaymentPlan(
        paymentPlanId="plan_demo_001",
        summary="demo plan",
        totalAmount=20,
        riskLevel=RiskLevel.UNCHECKED,
        payments=[
            PaymentItem(
                id="pay_001",
                recipient="Alice",
                task="Wrote event recap article",
                wallet="0xAlice",
                amount=20,
                token="USDC",
                reason="Completed task: Wrote event recap article",
                status=PaymentStatus.READY,
            )
        ],
    )


def sample_risk_result(plan):
    return RiskCheckResult(
        paymentPlanId=plan.paymentPlanId,
        overallStatus=PaymentStatus.NEEDS_APPROVAL,
        riskLevel=RiskLevel.LOW,
        remainingBudget=30,
        requiresHumanApproval=True,
        payments=plan.payments,
    )


def sample_execution():
    return PaymentExecutionResult(
        executionId="exec_demo_001",
        auditReportId="audit_demo_001",
        mode="mock",
        agentWalletAddress="mock-agent-wallet",
        payments=[
            PaymentExecutionItem(
                paymentItemId="pay_001",
                status=PaymentStatus.EXECUTED,
                mode="mock",
                network="mock-testnet",
                agentWalletAddress="mock-agent-wallet",
                txHash=None,
                cawRequestId="mock_caw_exec_demo_001_pay_001",
            )
        ],
    )


def test_sqlite_repository_saves_and_reads_payment_flow(tmp_path):
    repository = SQLiteStore(str(tmp_path / "agentcfo.sqlite3"))
    plan = sample_plan()
    risk = sample_risk_result(plan)
    execution = sample_execution()
    approval = HumanApproval(approved=True, approvedBy="demo-operator")
    audit_report = AuditReport(
        auditReportId=execution.auditReportId,
        mode="mock",
        paymentPlan=plan,
        riskCheck=risk,
        humanApproval=approval,
        execution=execution,
        remainingBudget=risk.remainingBudget,
    )
    caw_status = CawStatus.from_execution_item(execution.executionId, execution.payments[0])

    repository.save_payment_plan(plan)
    repository.save_risk_check(risk)
    repository.save_execution(execution)
    repository.save_audit_report(audit_report)
    repository.save_caw_status(caw_status)

    assert repository.get_payment_plan(plan.paymentPlanId) == plan
    assert repository.get_risk_check(plan.paymentPlanId) == risk
    assert repository.get_execution(execution.executionId) == execution
    assert repository.get_audit_report(audit_report.auditReportId) == audit_report
    assert repository.get_caw_status(caw_status.cawRequestId) == caw_status


def test_sqlite_repository_reset_clears_state(tmp_path):
    repository = SQLiteStore(str(tmp_path / "agentcfo.sqlite3"))
    plan = sample_plan()

    repository.save_payment_plan(plan)
    repository.reset()

    assert repository.get_payment_plan(plan.paymentPlanId) is None
    assert repository.next_plan_id() == "plan_demo_001"


def test_audit_report_snapshot_is_not_rewritten_by_caw_status_updates(tmp_path):
    repository = SQLiteStore(str(tmp_path / "agentcfo.sqlite3"))
    plan = sample_plan()
    risk = sample_risk_result(plan)
    execution = sample_execution()
    approval = HumanApproval(approved=True, approvedBy="demo-operator")
    audit_report = AuditReport(
        auditReportId=execution.auditReportId,
        mode="mock",
        paymentPlan=plan,
        riskCheck=risk,
        humanApproval=approval,
        execution=execution,
        remainingBudget=risk.remainingBudget,
    )
    original_status = CawStatus.from_execution_item(execution.executionId, execution.payments[0])
    refreshed_status = original_status.model_copy(
        update={
            "providerStatus": "failed",
            "normalizedStatus": PaymentStatus.FAILED,
            "error": "later status refresh failed",
        }
    )

    repository.save_audit_report(audit_report)
    repository.save_caw_status(original_status)
    repository.save_caw_status(refreshed_status)

    saved_report = repository.get_audit_report(audit_report.auditReportId)
    saved_status = repository.get_caw_status(original_status.cawRequestId)

    assert saved_report == audit_report
    assert saved_report.execution.payments[0].status == PaymentStatus.EXECUTED
    assert saved_status.normalizedStatus == PaymentStatus.FAILED
    assert saved_status.error == "later status refresh failed"


def test_sqlite_repository_saves_and_lists_external_references(tmp_path):
    repository = SQLiteStore(str(tmp_path / "agentcfo.sqlite3"))
    reference = ExternalReference(
        externalReferenceId=repository.next_external_reference_id(),
        referenceType=ExternalReferenceType.REQUEST_INVOICE,
        provider="request-finance",
        label="demo invoice",
        paymentPlanId="plan_demo_001",
        paymentItemId="pay_001",
        auditReportId="audit_demo_001",
        cawRequestId="mock_caw_exec_demo_001_pay_001",
        status="mock_recorded",
        metadata={"requestFinanceInvoiceId": "rf_demo_001"},
        createdAt="2026-06-09T00:00:00+00:00",
    )

    repository.save_external_reference(reference)

    assert repository.get_external_reference("ext_ref_001") == reference
    assert repository.list_external_references(payment_plan_id="plan_demo_001") == [reference]
    assert repository.list_external_references(audit_report_id="audit_demo_001") == [reference]
    assert repository.list_external_references(reference_type="request_invoice") == [reference]
