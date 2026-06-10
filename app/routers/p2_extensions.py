from fastapi import APIRouter, HTTPException

from app.models import (
    DemoBlockedExamples,
    DemoContracts,
    DemoRunbook,
    ExternalReference,
    ExternalReferenceCreate,
    ExternalReferenceList,
    EvidenceExport,
    EvidenceTimeline,
    DemoScenarioPack,
    DemoStoryboard,
    MultichainReadiness,
    PlannerExplainability,
    PolicyGuardrailSummary,
    RequestInvoiceCreate,
    RequestFinanceLifecyclePreview,
    RequestFinanceLifecyclePreviewRequest,
    RequestInvoiceRecord,
    RequestFinancePreflight,
    RiskWhatIfRequest,
    RiskWhatIfResult,
    SablierPayrollSimulation,
    SablierPayrollSimulationRequest,
    SablierStreamPreview,
    SablierStreamPreviewRequest,
    SafeGuardPolicyDryRun,
    SafeGuardPolicyDryRunRequest,
    SafePermissionReference,
    SafePermissionReferenceRequest,
    TreasuryBudgetPartition,
    TreasuryCoordinationSimulation,
    TreasuryCoordinationSimulationRequest,
)
from app.services.p2_extensions import P2ExtensionService, P2RecordNotFound, P2ValidationError
from app.services.request_finance import (
    RequestFinanceConfigurationError,
    RequestFinanceLiveActionNotApproved,
    RequestFinanceProviderError,
    RequestFinanceValidationError,
)
from app.store import store

router = APIRouter(prefix="/api", tags=["p2-demo-safe"])


def _service():
    return P2ExtensionService(store)


@router.post("/external-references", response_model=ExternalReference)
def create_external_reference(request: ExternalReferenceCreate):
    try:
        return _service().create_external_reference(request)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/external-references/{externalReferenceId}", response_model=ExternalReference)
def get_external_reference(externalReferenceId: str):
    try:
        return _service().get_external_reference(externalReferenceId)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/external-references", response_model=ExternalReferenceList)
def list_external_references(
    paymentPlanId: str | None = None,
    auditReportId: str | None = None,
    referenceType: str | None = None,
):
    return {
        "items": _service().list_external_references(
            payment_plan_id=paymentPlanId,
            audit_report_id=auditReportId,
            reference_type=referenceType,
        )
    }


@router.post("/request-invoices", response_model=RequestInvoiceRecord)
def create_request_invoice(request: RequestInvoiceCreate):
    try:
        return _service().create_request_invoice(request)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))
    except RequestFinanceConfigurationError as error:
        raise HTTPException(status_code=503, detail=str(error))
    except RequestFinanceLiveActionNotApproved as error:
        raise HTTPException(status_code=403, detail=str(error))
    except RequestFinanceProviderError as error:
        raise HTTPException(status_code=502, detail=str(error))
    except RequestFinanceValidationError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except P2ValidationError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.get("/request-invoices/{externalReferenceId}", response_model=RequestInvoiceRecord)
def get_request_invoice(externalReferenceId: str):
    try:
        return _service().get_request_invoice(externalReferenceId)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/sablier-stream-previews", response_model=SablierStreamPreview)
def create_sablier_stream_preview(request: SablierStreamPreviewRequest):
    try:
        return _service().create_sablier_stream_preview(request)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/safe-permission-references", response_model=SafePermissionReference)
def create_safe_permission_reference(request: SafePermissionReferenceRequest):
    try:
        return _service().create_safe_permission_reference(request)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/multichain-readiness", response_model=MultichainReadiness)
def get_multichain_readiness():
    return _service().get_multichain_readiness()


@router.get("/treasury-budget-partitions/{paymentPlanId}", response_model=TreasuryBudgetPartition)
def get_treasury_budget_partition(paymentPlanId: str):
    try:
        return _service().get_treasury_budget_partition(paymentPlanId)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/p2/evidence-timeline/{auditReportId}", response_model=EvidenceTimeline)
def get_evidence_timeline(auditReportId: str):
    try:
        return _service().get_evidence_timeline(auditReportId)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/p2/demo-scenarios", response_model=DemoScenarioPack)
def get_demo_scenarios():
    return _service().get_demo_scenarios()


@router.post("/p2/risk-what-if", response_model=RiskWhatIfResult)
def run_risk_what_if(request: RiskWhatIfRequest):
    return _service().run_risk_what_if(request)


@router.get("/p2/policy-guardrails", response_model=PolicyGuardrailSummary)
def get_policy_guardrails():
    return _service().get_policy_guardrails()


@router.get("/p2/evidence-export/{auditReportId}", response_model=EvidenceExport)
def get_evidence_export(auditReportId: str):
    try:
        return _service().get_evidence_export(auditReportId)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/p2/request-finance/preflight", response_model=RequestFinancePreflight)
def preflight_request_finance_invoice(request: RequestInvoiceCreate):
    return _service().preflight_request_finance_invoice(request)


@router.get("/p2/planner-explainability", response_model=PlannerExplainability)
def get_planner_explainability(paymentPlanId: str | None = None):
    try:
        return _service().get_planner_explainability(paymentPlanId)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post(
    "/p2/request-finance/lifecycle-preview",
    response_model=RequestFinanceLifecyclePreview,
)
def preview_request_finance_lifecycle(request: RequestFinanceLifecyclePreviewRequest):
    try:
        return _service().preview_request_finance_lifecycle(request)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/p2/sablier/payroll-simulation", response_model=SablierPayrollSimulation)
def simulate_sablier_payroll(request: SablierPayrollSimulationRequest):
    try:
        return _service().simulate_sablier_payroll(request)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.post("/p2/safe/guard-policy-dry-run", response_model=SafeGuardPolicyDryRun)
def dry_run_safe_guard_policy(request: SafeGuardPolicyDryRunRequest):
    return _service().dry_run_safe_guard_policy(request)


@router.post(
    "/p2/treasury/coordination-simulation",
    response_model=TreasuryCoordinationSimulation,
)
def simulate_treasury_coordination(request: TreasuryCoordinationSimulationRequest):
    try:
        return _service().simulate_treasury_coordination(request)
    except P2RecordNotFound as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/demo/runbook", response_model=DemoRunbook)
def get_demo_runbook():
    return _service().get_demo_runbook()


@router.get("/demo/storyboard", response_model=DemoStoryboard)
def get_demo_storyboard():
    return _service().get_demo_storyboard()


@router.get("/demo/blocked-examples", response_model=DemoBlockedExamples)
def get_demo_blocked_examples():
    return _service().get_demo_blocked_examples()


@router.get("/demo/contracts", response_model=DemoContracts)
def get_demo_contracts():
    return _service().get_demo_contracts()
