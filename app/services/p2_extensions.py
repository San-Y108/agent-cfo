from datetime import UTC, datetime

from app.models import (
    ExternalReference,
    ExternalReferenceCreate,
    ExternalReferenceType,
    MultichainReadiness,
    PaymentItem,
    RequestInvoiceCreate,
    RequestInvoiceRecord,
    SablierStreamPreview,
    SablierStreamPreviewRequest,
    SafePermissionReference,
    SafePermissionReferenceRequest,
    TreasuryBudgetPartition,
)
from app.services.request_finance import (
    RequestFinanceClient,
    RequestFinanceConfig,
    create_request_finance_client,
)


class P2RecordNotFound(Exception):
    pass


class P2ValidationError(Exception):
    pass


class P2ExtensionService:
    def __init__(
        self,
        store,
        request_finance_config: RequestFinanceConfig | None = None,
        request_finance_client: RequestFinanceClient | None = None,
    ):
        self.store = store
        self.request_finance_config = request_finance_config or RequestFinanceConfig.from_env()
        self.request_finance_client = request_finance_client

    def create_external_reference(self, request: ExternalReferenceCreate):
        self._validate_links(
            request.paymentPlanId,
            request.paymentItemId,
            request.auditReportId,
            request.cawRequestId,
        )
        reference = ExternalReference(
            externalReferenceId=self.store.next_external_reference_id(),
            createdAt=datetime.now(UTC).isoformat(),
            **request.model_dump(),
        )
        self.store.save_external_reference(reference)
        return reference

    def get_external_reference(self, external_reference_id: str):
        reference = self.store.get_external_reference(external_reference_id)
        if reference is None:
            raise P2RecordNotFound("External reference not found")
        return reference

    def list_external_references(
        self,
        payment_plan_id: str | None = None,
        audit_report_id: str | None = None,
        reference_type: str | None = None,
    ):
        return self.store.list_external_references(
            payment_plan_id=payment_plan_id,
            audit_report_id=audit_report_id,
            reference_type=reference_type,
        )

    def create_request_invoice(self, request: RequestInvoiceCreate):
        if self.request_finance_config.mode == "live":
            return self._create_live_request_invoice(request)
        if self.request_finance_config.mode != "mock":
            raise P2ValidationError("REQUEST_FINANCE_MODE must be mock or live")
        return self._create_mock_request_invoice(request)

    def _create_mock_request_invoice(self, request: RequestInvoiceCreate):
        metadata = {
            "requestFinanceInvoiceId": request.requestFinanceInvoiceId,
            "requestId": request.requestId,
            "hostedUrl": request.hostedUrl,
            "txHashReference": request.txHashReference,
        }
        reference = self.create_external_reference(
            ExternalReferenceCreate(
                referenceType=ExternalReferenceType.REQUEST_INVOICE,
                provider="request-finance",
                label=f"Request invoice {request.requestFinanceInvoiceId}",
                paymentPlanId=request.paymentPlanId,
                paymentItemId=request.paymentItemId,
                auditReportId=request.auditReportId,
                cawRequestId=request.cawRequestId,
                status=request.status,
                metadata=metadata,
            )
        )
        return self._request_invoice_from_reference(reference)

    def _create_live_request_invoice(self, request: RequestInvoiceCreate):
        self._validate_links(
            request.paymentPlanId,
            request.paymentItemId,
            request.auditReportId,
            request.cawRequestId,
        )
        self.request_finance_config.require_live_config()
        client = self.request_finance_client or create_request_finance_client(
            self.request_finance_config
        )
        invoice = client.create_invoice(request)
        metadata = {
            "requestFinanceInvoiceId": invoice.request_finance_invoice_id,
            "requestId": invoice.request_id,
            "hostedUrl": invoice.hosted_url,
            "txHashReference": request.txHashReference,
            "requestFinanceMode": "live",
        }
        reference = self.create_external_reference(
            ExternalReferenceCreate(
                referenceType=ExternalReferenceType.REQUEST_INVOICE,
                provider="request-finance",
                label=f"Request invoice {invoice.request_finance_invoice_id}",
                paymentPlanId=request.paymentPlanId,
                paymentItemId=request.paymentItemId,
                auditReportId=request.auditReportId,
                cawRequestId=request.cawRequestId,
                status=invoice.status,
                metadata=metadata,
            )
        )
        return self._request_invoice_from_reference(reference)

    def get_request_invoice(self, external_reference_id: str):
        reference = self.get_external_reference(external_reference_id)
        if reference.referenceType != ExternalReferenceType.REQUEST_INVOICE:
            raise P2RecordNotFound("Request invoice not found")
        return self._request_invoice_from_reference(reference)

    def create_sablier_stream_preview(self, request: SablierStreamPreviewRequest):
        payment = self._get_payment_item(request.paymentPlanId, request.paymentItemId)
        duration_seconds = request.durationDays * 24 * 60 * 60
        reference = self.create_external_reference(
            ExternalReferenceCreate(
                referenceType=ExternalReferenceType.SABLIER_STREAM_PREVIEW,
                provider="sablier",
                label=f"Sablier stream preview for {request.paymentItemId}",
                paymentPlanId=request.paymentPlanId,
                paymentItemId=request.paymentItemId,
                status="preview_generated",
                metadata={
                    "durationDays": request.durationDays,
                    "durationSeconds": duration_seconds,
                    "ratePerSecond": payment.amount / duration_seconds,
                },
            )
        )
        return SablierStreamPreview(
            externalReferenceId=reference.externalReferenceId,
            mode="preview-only",
            streamCreated=False,
            paymentPlanId=request.paymentPlanId,
            paymentItemId=request.paymentItemId,
            recipient=payment.recipient,
            wallet=payment.wallet,
            amount=payment.amount,
            token=payment.token,
            durationDays=request.durationDays,
            durationSeconds=duration_seconds,
            ratePerSecond=payment.amount / duration_seconds,
            safetyNotes=[
                "Preview only; does not create a real Sablier stream.",
                "Does not alter risk checks, CAW execution, or human approval.",
            ],
        )

    def create_safe_permission_reference(self, request: SafePermissionReferenceRequest):
        self._get_payment_plan(request.paymentPlanId)
        reference = self.create_external_reference(
            ExternalReferenceCreate(
                referenceType=ExternalReferenceType.SAFE_PERMISSION_REFERENCE,
                provider="safe",
                label=f"Safe permission reference for {request.moduleName}",
                paymentPlanId=request.paymentPlanId,
                status="reference_recorded",
                metadata={
                    "safeAddress": request.safeAddress,
                    "moduleName": request.moduleName,
                    "permissionNotes": request.permissionNotes,
                    "moduleEnabled": False,
                },
            )
        )
        return SafePermissionReference(
            externalReferenceId=reference.externalReferenceId,
            mode="reference-only",
            moduleEnabled=False,
            paymentPlanId=request.paymentPlanId,
            safeAddress=request.safeAddress,
            moduleName=request.moduleName,
            permissionNotes=request.permissionNotes,
            safetyNotes=[
                "Reference only; no Safe module is enabled or deployed.",
                "Safe modules require explicit owner approval and security review before live use.",
            ],
        )

    def get_multichain_readiness(self):
        return MultichainReadiness(
            currentExecutionBoundary={
                "chain": "Sepolia",
                "token": "SETH",
                "mode": "single-testnet-token-boundary",
            },
            liveMultichainExecutionEnabled=False,
            chains=[
                {
                    "chain": "Sepolia",
                    "status": "current-real-evidence-chain",
                    "executionEnabled": True,
                    "notes": "Only the explicitly configured CAW testnet path can execute.",
                },
                {
                    "chain": "Polygon",
                    "status": "design-only",
                    "executionEnabled": False,
                    "notes": "Metadata readiness only; no CAW execution path is enabled.",
                },
                {
                    "chain": "Base",
                    "status": "design-only",
                    "executionEnabled": False,
                    "notes": "Metadata readiness only; no CAW execution path is enabled.",
                },
            ],
            safetyNotes=[
                "Does not modify CAW_ALLOWED_CHAIN_IDS or live adapter behavior.",
                "No new chain can execute without explicit approval and tests.",
            ],
        )

    def get_treasury_budget_partition(self, payment_plan_id: str):
        payment_plan = self._get_payment_plan(payment_plan_id)
        grouped: dict[str, dict] = {}
        for payment in payment_plan.payments:
            department_agent_id = self._department_agent_id(payment)
            entry = grouped.setdefault(
                department_agent_id,
                {
                    "departmentAgentId": department_agent_id,
                    "plannedAmount": 0.0,
                    "paymentItemIds": [],
                    "recommendationOwner": department_agent_id,
                },
            )
            entry["plannedAmount"] += payment.amount
            entry["paymentItemIds"].append(payment.id)
        return TreasuryBudgetPartition(
            mode="mock-budget-partition",
            authorizationChanged=False,
            paymentPlanId=payment_plan_id,
            totalPlannedAmount=payment_plan.totalAmount,
            partitions=list(grouped.values()),
            safetyNotes=[
                "Mock budget partition only; does not create new authorization roles.",
                "Human approval and deterministic risk check remain the only execution gates.",
            ],
        )

    def _request_invoice_from_reference(self, reference: ExternalReference):
        return RequestInvoiceRecord(
            externalReferenceId=reference.externalReferenceId,
            paymentPlanId=reference.paymentPlanId or "",
            paymentItemId=reference.paymentItemId or "",
            auditReportId=reference.auditReportId,
            cawRequestId=reference.cawRequestId,
            requestFinanceInvoiceId=reference.metadata["requestFinanceInvoiceId"],
            requestId=reference.metadata.get("requestId"),
            status=reference.status,
            hostedUrl=reference.metadata.get("hostedUrl"),
            txHashReference=reference.metadata.get("txHashReference"),
            externalReference=reference,
        )

    def _validate_links(
        self,
        payment_plan_id: str | None,
        payment_item_id: str | None,
        audit_report_id: str | None,
        caw_request_id: str | None,
    ):
        if payment_plan_id is not None:
            self._get_payment_plan(payment_plan_id)
        if payment_plan_id is not None and payment_item_id is not None:
            self._get_payment_item(payment_plan_id, payment_item_id)
        if audit_report_id is not None and self.store.get_audit_report(audit_report_id) is None:
            raise P2RecordNotFound("Audit report not found")
        if caw_request_id is not None and self.store.get_caw_status(caw_request_id) is None:
            raise P2RecordNotFound("CAW status not found")

    def _get_payment_plan(self, payment_plan_id: str):
        payment_plan = self.store.get_payment_plan(payment_plan_id)
        if payment_plan is None:
            raise P2RecordNotFound("Payment plan not found")
        return payment_plan

    def _get_payment_item(self, payment_plan_id: str, payment_item_id: str) -> PaymentItem:
        payment_plan = self._get_payment_plan(payment_plan_id)
        for payment in payment_plan.payments:
            if payment.id == payment_item_id:
                return payment
        raise P2RecordNotFound("Payment item not found")

    def _department_agent_id(self, payment: PaymentItem):
        role = payment.task.lower()
        if "community" in role:
            return "agent-community"
        if "poster" in role or "design" in role:
            return "agent-design"
        if "data" in role or "subscription" in role:
            return "agent-operations"
        return "agent-content"
