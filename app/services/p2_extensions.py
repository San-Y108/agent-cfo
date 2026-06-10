import os
from datetime import UTC, datetime

from app.models import (
    BudgetRule,
    DemoScenario,
    DemoScenarioPack,
    EvidenceExport,
    EvidenceTimeline,
    EvidenceTimelineEvent,
    ExternalReference,
    ExternalReferenceCreate,
    ExternalReferenceType,
    HumanApproval,
    MultichainReadiness,
    PaymentItem,
    PaymentStatus,
    PolicyGuardrailSummary,
    RequestInvoiceCreate,
    RequestInvoiceRecord,
    RequestFinancePreflight,
    RiskWhatIfGuardrail,
    RiskWhatIfRequest,
    RiskWhatIfResult,
    SablierStreamPreview,
    SablierStreamPreviewRequest,
    SafePermissionReference,
    SafePermissionReferenceRequest,
    TreasuryBudgetPartition,
)
from app.services.request_finance import (
    RequestFinanceClient,
    RequestFinanceConfig,
    RequestFinanceValidationError,
    build_request_finance_invoice_payload,
    create_request_finance_client,
)
from app.services.risk_engine import check_payment_risks


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
            self.request_finance_config.require_live_config()
            if not self.request_finance_config.allow_invoice_create:
                return self._create_mock_request_invoice(
                    request,
                    request_finance_mode="live-readonly",
                )
            return self._create_live_request_invoice(request)
        if self.request_finance_config.mode != "mock":
            raise P2ValidationError("REQUEST_FINANCE_MODE must be mock or live")
        return self._create_mock_request_invoice(request)

    def _create_mock_request_invoice(
        self,
        request: RequestInvoiceCreate,
        request_finance_mode: str = "mock",
    ):
        metadata = {
            "requestFinanceInvoiceId": request.requestFinanceInvoiceId,
            "requestId": request.requestId,
            "hostedUrl": request.hostedUrl,
            "txHashReference": request.txHashReference,
            "requestFinanceMode": request_finance_mode,
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
            "viewUrl": invoice.view_url,
            "payUrl": invoice.pay_url,
            "status": invoice.status,
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

    def get_evidence_timeline(self, audit_report_id: str):
        audit_report = self.store.get_audit_report(audit_report_id)
        if audit_report is None:
            raise P2RecordNotFound("Audit report not found")
        payment_plan = audit_report.paymentPlan
        captured_at = audit_report.snapshot.get("capturedAt")
        events = [
            EvidenceTimelineEvent(
                eventType="payment_plan",
                label="Payment plan created",
                status=str(payment_plan.riskLevel),
                mode=payment_plan.plannerMode,
                ids={"paymentPlanId": payment_plan.paymentPlanId},
                timestamp=captured_at,
                evidenceLinks=[
                    {"type": "api", "href": f"/api/payment-plan/{payment_plan.paymentPlanId}"}
                ],
                safetyNotes=["Planning does not authorize or execute payments."],
            ),
            EvidenceTimelineEvent(
                eventType="risk_check",
                label="Deterministic risk check",
                status=str(audit_report.riskCheck.overallStatus),
                mode="deterministic",
                ids={"paymentPlanId": payment_plan.paymentPlanId},
                timestamp=captured_at,
                evidenceLinks=[],
                safetyNotes=["Risk checks are deterministic business rules."],
            ),
            EvidenceTimelineEvent(
                eventType="human_approval",
                label="Human approval captured",
                status="approved" if audit_report.humanApproval.approved else "rejected",
                mode="human-gate",
                ids={"paymentPlanId": payment_plan.paymentPlanId},
                timestamp=captured_at,
                evidenceLinks=[],
                safetyNotes=["Approval is captured in the immutable audit snapshot."],
            ),
            EvidenceTimelineEvent(
                eventType="execution_result",
                label="CAW execution result",
                status=audit_report.execution.mode,
                mode=audit_report.execution.mode,
                ids={
                    "executionId": audit_report.execution.executionId,
                    "auditReportId": audit_report.auditReportId,
                },
                timestamp=captured_at,
                evidenceLinks=[
                    {"type": "api", "href": f"/api/execution/{audit_report.execution.executionId}"}
                ],
                safetyNotes=["Mock execution is explicitly labeled and has no real tx hash."],
            ),
        ]
        for payment in audit_report.execution.payments:
            caw_status = self.store.get_caw_status(payment.cawRequestId)
            events.append(
                EvidenceTimelineEvent(
                    eventType="caw_status",
                    label=f"Latest CAW status for {payment.paymentItemId}",
                    status=str(caw_status.normalizedStatus if caw_status else payment.status),
                    mode=caw_status.mode if caw_status else payment.mode,
                    ids={
                        "cawRequestId": payment.cawRequestId,
                        "paymentItemId": payment.paymentItemId,
                    },
                    timestamp=caw_status.lastCheckedAt if caw_status else captured_at,
                    evidenceLinks=[
                        {"type": "api", "href": f"/api/caw-status/{payment.cawRequestId}"}
                    ],
                    safetyNotes=[
                        "Latest CAW status is separate from the immutable Audit Report snapshot."
                    ],
                )
            )
        for reference in self.store.list_external_references(
            audit_report_id=audit_report.auditReportId
        ):
            links = [
                {"type": "api", "href": f"/api/external-references/{reference.externalReferenceId}"}
            ]
            for key in ["hostedUrl", "viewUrl", "payUrl"]:
                if reference.metadata.get(key):
                    links.append({"type": key, "href": reference.metadata[key]})
            events.append(
                EvidenceTimelineEvent(
                    eventType="external_reference",
                    label=reference.label,
                    status=reference.status,
                    mode=reference.mode,
                    ids={
                        "externalReferenceId": reference.externalReferenceId,
                        "paymentPlanId": reference.paymentPlanId,
                        "paymentItemId": reference.paymentItemId,
                        "auditReportId": reference.auditReportId,
                        "cawRequestId": reference.cawRequestId,
                    },
                    timestamp=reference.createdAt,
                    evidenceLinks=links,
                    safetyNotes=["Linked P2 evidence is external metadata, not audit mutation."],
                )
            )
        events.append(
            EvidenceTimelineEvent(
                eventType="audit_report",
                label="Immutable audit report snapshot",
                status="captured",
                mode=audit_report.mode,
                ids={"auditReportId": audit_report.auditReportId},
                timestamp=captured_at,
                evidenceLinks=[
                    {"type": "api", "href": f"/api/audit-report/{audit_report.auditReportId}"}
                ],
                safetyNotes=["Audit Report snapshots are immutable after execution."],
            )
        )
        return EvidenceTimeline(
            mode="demo-safe",
            auditReportId=audit_report.auditReportId,
            paymentPlanId=payment_plan.paymentPlanId,
            auditSnapshotImmutable=True,
            events=events,
            safetyNotes=[
                "Timeline aggregates current linked evidence without rewriting the audit snapshot."
            ],
        )

    def get_demo_scenarios(self):
        scenarios = [
            self._scenario("standard-approved-payout", "Standard approved payout", "p0-flow"),
            self._scenario("over-budget-blocked", "Over-budget blocked", "risk"),
            self._scenario("unknown-recipient-blocked", "Unknown recipient blocked", "risk"),
            self._scenario("unsupported-token-blocked", "Unsupported token blocked", "risk"),
            self._scenario("duplicate-recipient-task-warning", "Duplicate recipient/task warning", "risk"),
            self._scenario("request-invoice-linked-evidence", "Request invoice linked evidence", "p2"),
            self._scenario("sablier-preview", "Sablier preview", "p2"),
            self._scenario("safe-reference", "Safe reference", "p2"),
            self._scenario("multichain-readiness", "Multichain readiness", "p2"),
            self._scenario("treasury-partition", "Treasury partition", "p2"),
        ]
        return DemoScenarioPack(
            mode="demo-safe",
            externalSystemsTouched=False,
            scenarios=scenarios,
        )

    def run_risk_what_if(self, request: RiskWhatIfRequest):
        payments = [
            PaymentItem(
                id=f"what_if_pay_{index:03d}",
                recipient=payment.recipient,
                task=payment.task,
                wallet=payment.wallet,
                amount=payment.amount,
                token=payment.token,
                reason=payment.reason,
                status=PaymentStatus.READY,
                risks=[],
            )
            for index, payment in enumerate(request.payments, start=1)
        ]
        overall_status, risk_level, remaining_budget, checked_payments = check_payment_risks(
            payments,
            request.budgetRule,
        )
        guardrails = self._risk_guardrails(
            checked_payments,
            request.budgetRule,
            request.humanApproval,
        )
        return RiskWhatIfResult(
            mode="simulation-only",
            createsPaymentPlan=False,
            executesPayment=False,
            overallStatus=overall_status,
            riskLevel=risk_level,
            remainingBudget=remaining_budget,
            requiresHumanApproval=request.budgetRule.requiresHumanApproval,
            payments=checked_payments,
            guardrails=guardrails,
            safetyNotes=[
                "What-if simulation reuses deterministic risk rules.",
                "No payment plan, risk snapshot, execution, or audit report is persisted.",
            ],
        )

    def get_policy_guardrails(self):
        config = RequestFinanceConfig.from_env()
        return PolicyGuardrailSummary(
            mode="demo-safe",
            demoBudget={
                "monthlyBudget": 50,
                "singlePaymentLimit": 25,
                "allowedToken": "USDC",
                "whitelistSummary": {"count": 2, "labels": ["0xAlice", "0xCharlie"]},
                "requiresHumanApproval": True,
            },
            caw={
                "mode": os.getenv("CAW_ADAPTER_MODE", "mock").strip().lower(),
                "transferEnabled": os.getenv("CAW_ENABLE_TRANSFERS", "false").strip().lower()
                == "true",
            },
            requestFinance={
                "mode": config.public_mode,
                "apiKeyConfigured": config.api_key_configured,
                "invoiceCreateGuardEnabled": config.allow_invoice_create,
                "invoiceCreateImplemented": True,
            },
            sablier={"liveEnabled": False, "streamCreationEnabled": False},
            safe={"moduleEnabled": False, "moduleDeploymentEnabled": False},
            multichain={"liveExecutionEnabled": False},
            auditSnapshotImmutable=True,
            safetyNotes=["No secrets or wallet credentials are exposed by this endpoint."],
        )

    def get_evidence_export(self, audit_report_id: str):
        audit_report = self.store.get_audit_report(audit_report_id)
        if audit_report is None:
            raise P2RecordNotFound("Audit report not found")
        references = self.store.list_external_references(audit_report_id=audit_report_id)
        tx_hashes = [
            payment.txHash
            for payment in audit_report.execution.payments
            if payment.txHash is not None
        ]
        tx_hash_state = "has-real-or-provider-tx-hash" if tx_hashes else "mock-no-tx-hash"
        return EvidenceExport(
            mode="markdown-ready-json",
            paymentPlanId=audit_report.paymentPlan.paymentPlanId,
            auditReportId=audit_report.auditReportId,
            cawRequestIds=[
                payment.cawRequestId for payment in audit_report.execution.payments
            ],
            externalReferenceIds=[
                reference.externalReferenceId for reference in references
            ],
            riskReasons={
                payment.id: payment.risks for payment in audit_report.riskCheck.payments
            },
            modeLabels=[
                f"execution:{audit_report.execution.mode}",
                *[f"external:{reference.mode}" for reference in references],
            ],
            txHashState=tx_hash_state,
            safetyDisclaimers=[
                "Do not present mock tx hashes as real transactions.",
                "P2 evidence is linked metadata unless a real provider artifact is explicitly created.",
            ],
            approvedDemoWording=(
                "Current real CAW evidence remains one low-value testnet transaction; "
                "Render mock-demo execution returns mock mode and no tx hash."
            ),
            forbiddenWording=(
                "Do not claim payment integration complete, three CAW tx hashes, "
                "Sablier stream creation, Safe module enablement, or multichain execution."
            ),
        )

    def preflight_request_finance_invoice(self, request: RequestInvoiceCreate):
        missing_fields: list[str] = []
        try:
            build_request_finance_invoice_payload(request)
        except RequestFinanceValidationError as error:
            prefix = "Request Finance live invoice create requires: "
            message = str(error)
            missing_fields = (
                [field.strip() for field in message.removeprefix(prefix).split(",")]
                if message.startswith(prefix)
                else [message]
            )
        config = RequestFinanceConfig.from_env()
        return RequestFinancePreflight(
            ready=not missing_fields,
            missingFields=missing_fields,
            wouldCallProvider=False,
            requestFinanceMode=config.public_mode,
            invoiceCreateGuardEnabled=config.allow_invoice_create,
            safetyNotes=[
                "Preflight validates payload shape only and never calls Request Finance.",
                "Live invoice creation still requires explicit approval.",
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

    def _scenario(self, scenario_id: str, label: str, category: str):
        endpoint = "/api/p2/risk-what-if" if category == "risk" else "/api/demo-sample"
        if scenario_id.startswith("request-invoice"):
            endpoint = "/api/request-invoices"
        if scenario_id == "sablier-preview":
            endpoint = "/api/sablier-stream-previews"
        if scenario_id == "safe-reference":
            endpoint = "/api/safe-permission-references"
        if scenario_id == "multichain-readiness":
            endpoint = "/api/multichain-readiness"
        if scenario_id == "treasury-partition":
            endpoint = "/api/treasury-budget-partitions/{paymentPlanId}"
        method = "GET" if scenario_id in {"multichain-readiness", "treasury-partition"} else "POST"
        return DemoScenario(
            scenarioId=scenario_id,
            label=label,
            category=category,
            method=method,
            endpoint=endpoint,
            payload=self._scenario_payload(scenario_id),
            expectedStatus="demo-safe",
            curlExample=f"curl -s -X {method} \"$BASE_URL{endpoint}\"",
            safetyNotes=["Scenario is deterministic and does not execute live payments."],
        )

    def _scenario_payload(self, scenario_id: str):
        budget = {
            "monthlyBudget": 50,
            "singlePaymentLimit": 25,
            "allowedToken": "USDC",
            "whitelist": ["0xAlice", "0xCharlie"],
            "requiresHumanApproval": True,
        }
        if scenario_id == "over-budget-blocked":
            return {
                "payments": [
                    {
                        "recipient": "Alice",
                        "task": "Large payout",
                        "wallet": "0xAlice",
                        "amount": 60,
                        "token": "USDC",
                    }
                ],
                "budgetRule": budget,
            }
        if scenario_id == "unknown-recipient-blocked":
            return {
                "payments": [
                    {
                        "recipient": "Bob",
                        "task": "Unapproved recipient",
                        "wallet": "0xBob",
                        "amount": 10,
                        "token": "USDC",
                    }
                ],
                "budgetRule": budget,
            }
        if scenario_id == "unsupported-token-blocked":
            return {
                "payments": [
                    {
                        "recipient": "Alice",
                        "task": "Wrong token",
                        "wallet": "0xAlice",
                        "amount": 10,
                        "token": "DAI",
                    }
                ],
                "budgetRule": budget,
            }
        if scenario_id == "duplicate-recipient-task-warning":
            return {
                "payments": [
                    {
                        "recipient": "Alice",
                        "task": "Duplicate task",
                        "wallet": "0xAlice",
                        "amount": 10,
                        "token": "USDC",
                    },
                    {
                        "recipient": "Alice",
                        "task": "Duplicate task",
                        "wallet": "0xAlice",
                        "amount": 10,
                        "token": "USDC",
                    },
                ],
                "budgetRule": budget,
            }
        return None

    def _risk_guardrails(
        self,
        payments: list[PaymentItem],
        budget_rule: BudgetRule,
        human_approval: HumanApproval | None,
    ):
        mapping = {
            "Total payment amount exceeds monthly budget": "monthly_budget",
            "Payment amount exceeds single payment limit": "single_payment_limit",
            "Token is not allowed": "token_allowlist",
            "Recipient wallet is not in whitelist": "recipient_allowlist",
            "Duplicate recipient wallet": "duplicate_recipient",
            "Duplicate task": "duplicate_task",
        }
        guardrails: list[RiskWhatIfGuardrail] = []
        for reason, guardrail_id in mapping.items():
            affected = [payment.id for payment in payments if reason in payment.risks]
            if affected:
                guardrails.append(
                    RiskWhatIfGuardrail(
                        guardrailId=guardrail_id,
                        label=reason,
                        status="blocked",
                        affectedPaymentIds=affected,
                        reason=reason,
                    )
                )
        if budget_rule.requiresHumanApproval and not (
            human_approval and human_approval.approved
        ):
            guardrails.append(
                RiskWhatIfGuardrail(
                    guardrailId="missing_human_approval",
                    label="Human approval required",
                    status="needs_approval",
                    affectedPaymentIds=[payment.id for payment in payments],
                    reason="Human approval is required before execution.",
                )
            )
        return guardrails
