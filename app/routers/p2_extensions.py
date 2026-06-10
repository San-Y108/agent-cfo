from fastapi import APIRouter, HTTPException

from app.models import (
    ExternalReference,
    ExternalReferenceCreate,
    ExternalReferenceList,
    MultichainReadiness,
    RequestInvoiceCreate,
    RequestInvoiceRecord,
    SablierStreamPreview,
    SablierStreamPreviewRequest,
    SafePermissionReference,
    SafePermissionReferenceRequest,
    TreasuryBudgetPartition,
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
