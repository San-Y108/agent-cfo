import os
from datetime import UTC, datetime
from typing import Any

from app.models import (
    BudgetRule,
    DemoScenario,
    DemoScenarioPack,
    DemoBlockedExamples,
    DemoContracts,
    DemoRunbook,
    DemoStoryboard,
    EvidenceExport,
    EvidenceTimeline,
    EvidenceTimelineEvent,
    ExternalReference,
    ExternalReferenceCreate,
    ExternalReferenceType,
    HumanApproval,
    MultichainReadiness,
    OpenApiLiteContract,
    OpenApiLiteContracts,
    PaymentItem,
    PaymentStatus,
    P2ReadinessReport,
    PlannerExplainability,
    PolicyGuardrailSummary,
    RequestInvoiceCreate,
    RequestInvoiceRecord,
    RequestFinanceLifecyclePreview,
    RequestFinanceLifecyclePreviewRequest,
    RequestFinancePreflight,
    RequestFinanceWebhookReplayRequest,
    RequestFinanceWebhookReplayResult,
    RiskWhatIfGuardrail,
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

    def get_planner_explainability(self, payment_plan_id: str | None = None):
        payment_plan = (
            self._get_payment_plan(payment_plan_id)
            if payment_plan_id is not None
            else None
        )
        payments = payment_plan.payments if payment_plan else []
        return PlannerExplainability(
            mode="demo-safe",
            paymentPlanId=payment_plan.paymentPlanId if payment_plan else "not-linked",
            plannerMode=str(payment_plan.plannerMode) if payment_plan else "mock",
            schemaValidation={
                "source": "OpenAI Structured Outputs",
                "responseFormat": "json_schema",
                "strict": True,
                "additionalProperties": False,
                "validatedBeforeRiskCheck": True,
                "unsafeCoercionAllowed": False,
            },
            allowedLlmResponsibilities=[
                "normalize contribution records",
                "generate payment reasons",
                "generate a structured payment plan",
                "explain suspicious payment items",
            ],
            forbiddenLlmResponsibilities=[
                "approve payments",
                "execute payments",
                "invent wallet addresses",
                "invent tx hashes",
                "bypass deterministic risk checks",
                "invent CAW configuration",
            ],
            mockVsOpenAIComparison={
                "mockPlanner": {"deterministic": True, "externalModelCall": False},
                "openAiPlanner": {
                    "structuredOutputs": True,
                    "strictSchemaExpected": True,
                },
                "authorizationBoundaryUnchanged": True,
                "riskEngineUnchanged": True,
                "auditSnapshotUnchanged": True,
            },
            malformedOutputFallbackDemo={
                "example": "missing wallet or non-numeric amount",
                "result": "validation_error",
                "wouldPersistPlan": False,
                "wouldExecutePayment": False,
                "retryPolicy": "bounded-or-explicit-error",
            },
            reasonTrace=[
                {
                    "paymentItemId": payment.id,
                    "recipient": payment.recipient,
                    "reason": payment.reason,
                    "plannerAuthority": "reason-generation-only",
                    "riskAuthority": "deterministic-risk-engine",
                    "approvalAuthority": "human-approval",
                }
                for payment in payments
            ],
            safetyNotes=[
                "LLM output is display/planning input only.",
                "Risk check and human approval remain mandatory before execution.",
            ],
        )

    def preview_request_finance_lifecycle(
        self, request: RequestFinanceLifecyclePreviewRequest
    ):
        self._validate_links(
            request.paymentPlanId,
            request.paymentItemId,
            request.auditReportId,
            request.cawRequestId,
        )
        allowed_statuses = ["created", "accepted", "canceled", "rejected", "paid"]
        events = request.events or [request.currentStatus]
        event_log = [
            {
                "eventId": f"rf_lifecycle_event_{index:03d}",
                "status": status,
                "acceptedStatus": status in allowed_statuses,
                "source": "mock-webhook",
                "providerTouched": False,
            }
            for index, status in enumerate(events, start=1)
        ]
        return RequestFinanceLifecyclePreview(
            mode="simulation-only",
            requestFinanceInvoiceId=request.requestFinanceInvoiceId,
            currentStatus=request.currentStatus,
            providerTouched=False,
            customerEmailSent=False,
            onchainConversionCalled=False,
            paymentTriggered=False,
            linkedIds={
                "paymentPlanId": request.paymentPlanId,
                "paymentItemId": request.paymentItemId,
                "auditReportId": request.auditReportId,
                "cawRequestId": request.cawRequestId,
            },
            statusTimeline=[
                {
                    "status": status,
                    "meaning": f"Mock Request Finance invoice lifecycle status: {status}",
                    "terminal": status in {"canceled", "rejected", "paid"},
                }
                for status in allowed_statuses
            ],
            eventLog=event_log,
            safetyNotes=[
                "Lifecycle preview is mock metadata only.",
                "Does not call Request Finance, POST /invoices/{id}, send email, convert on-chain, or pay.",
            ],
        )

    def replay_request_finance_webhook(
        self, request: RequestFinanceWebhookReplayRequest
    ):
        self._validate_links(
            request.paymentPlanId,
            request.paymentItemId,
            request.auditReportId,
            request.cawRequestId,
        )
        event_statuses = {
            "invoice.created": "created",
            "invoice.accepted": "accepted",
            "invoice.canceled": "canceled",
            "invoice.rejected": "rejected",
            "invoice.paid": "paid",
        }
        normalized_status = event_statuses.get(request.eventType)
        if normalized_status is None:
            allowed = ", ".join(event_statuses)
            raise P2ValidationError(
                f"Unsupported Request Finance webhook event type. Allowed event types: {allowed}"
            )

        existing_events = self._request_finance_webhook_events(
            request.paymentPlanId,
            request.invoiceId,
        )
        timeline = self._request_finance_webhook_timeline(existing_events)
        duplicate = next(
            (
                event
                for event in existing_events
                if event.metadata.get("eventId") == request.eventId
            ),
            None,
        )
        external_reference_id = duplicate.externalReferenceId if duplicate is not None else None
        terminal_status = next(
            (event["status"] for event in reversed(timeline) if event["status"] in {"canceled", "rejected", "paid"}),
            None,
        )
        if duplicate is None and terminal_status is not None:
            return RequestFinanceWebhookReplayResult(
                mode="simulation-only",
                replayResult="terminal_state_ignored",
                acceptedEvent=False,
                duplicateEvent=False,
                normalizedStatus=terminal_status,
                externalReferenceId=timeline[-1].get("externalReferenceId") if timeline else None,
                providerTouched=False,
                emailSent=False,
                paymentTriggered=False,
                onChainConversion=False,
                linkedIds={
                    "paymentPlanId": request.paymentPlanId,
                    "paymentItemId": request.paymentItemId,
                    "auditReportId": request.auditReportId,
                    "cawRequestId": request.cawRequestId,
                },
                eventTimeline=[
                    {key: value for key, value in event.items() if key != "externalReferenceId"}
                    for event in timeline
                ],
                safetyNotes=[
                    "Webhook replay v2 is a local mock based on Request Finance invoice lifecycle event concepts.",
                    "Terminal invoice states ignore later mock events without calling providers or payments.",
                ],
            )
        if duplicate is None and not self._request_finance_transition_allowed(
            [event["status"] for event in timeline],
            normalized_status,
        ):
            last_status = timeline[-1]["status"] if timeline else "none"
            return RequestFinanceWebhookReplayResult(
                mode="simulation-only",
                replayResult="invalid_transition_ignored",
                acceptedEvent=False,
                duplicateEvent=False,
                normalizedStatus=last_status,
                externalReferenceId=timeline[-1].get("externalReferenceId") if timeline else None,
                providerTouched=False,
                emailSent=False,
                paymentTriggered=False,
                onChainConversion=False,
                linkedIds={
                    "paymentPlanId": request.paymentPlanId,
                    "paymentItemId": request.paymentItemId,
                    "auditReportId": request.auditReportId,
                    "cawRequestId": request.cawRequestId,
                },
                eventTimeline=[
                    {key: value for key, value in event.items() if key != "externalReferenceId"}
                    for event in timeline
                ],
                safetyNotes=[
                    "Webhook replay v2 ignored an invalid mock lifecycle transition.",
                    "No provider, email, on-chain conversion, or payment was triggered.",
                ],
            )
        if duplicate is None:
            reference = self.create_external_reference(
                ExternalReferenceCreate(
                    referenceType=ExternalReferenceType.REQUEST_INVOICE,
                    provider="request-finance-webhook-mock",
                    label=f"Request Finance webhook {request.eventType}",
                    paymentPlanId=request.paymentPlanId,
                    paymentItemId=request.paymentItemId,
                    auditReportId=request.auditReportId,
                    cawRequestId=request.cawRequestId,
                    status=normalized_status,
                    metadata={
                        "webhookReplayVersion": "v2",
                        "eventId": request.eventId,
                        "eventType": request.eventType,
                        "requestFinanceInvoiceId": request.invoiceId,
                        "requestId": request.requestId,
                        "normalizedStatus": normalized_status,
                        "payloadShape": sorted(request.payload.keys()),
                        "providerTouched": False,
                        "emailSent": False,
                        "paymentTriggered": False,
                        "onChainConversion": False,
                    },
                )
            )
            existing_events.append(reference)
            external_reference_id = reference.externalReferenceId

        timeline = self._request_finance_webhook_timeline(existing_events)
        return RequestFinanceWebhookReplayResult(
            mode="simulation-only",
            replayResult="duplicate_ignored" if duplicate is not None else "event_recorded",
            acceptedEvent=True,
            duplicateEvent=duplicate is not None,
            normalizedStatus=normalized_status,
            externalReferenceId=external_reference_id,
            providerTouched=False,
            emailSent=False,
            paymentTriggered=False,
            onChainConversion=False,
            linkedIds={
                "paymentPlanId": request.paymentPlanId,
                "paymentItemId": request.paymentItemId,
                "auditReportId": request.auditReportId,
                "cawRequestId": request.cawRequestId,
            },
            eventTimeline=[
                {key: value for key, value in event.items() if key != "externalReferenceId"}
                for event in timeline
            ],
            safetyNotes=[
                "Webhook replay v2 is a local mock based on Request Finance invoice lifecycle event concepts.",
                "It does not call Request Finance, POST /invoices/{id}, send email, convert on-chain, or pay.",
            ],
        )

    def simulate_sablier_payroll(self, request: SablierPayrollSimulationRequest):
        payment = self._get_payment_item(request.paymentPlanId, request.paymentItemId)
        duration_seconds = request.durationDays * 24 * 60 * 60
        elapsed_seconds = min(request.elapsedSeconds, duration_seconds)
        rate_per_second = payment.amount / duration_seconds
        accrued_amount = min(payment.amount, rate_per_second * elapsed_seconds)
        withdrawable_amount = max(0, accrued_amount - request.withdrawnAmount)
        funding_runway_seconds = (
            request.fundedAmount / rate_per_second if rate_per_second > 0 else None
        )
        uncovered_debt = max(0, accrued_amount - request.fundedAmount)
        is_insolvent = uncovered_debt > 0
        guardrails = [
            {
                "guardrailId": "stream_creation_forbidden",
                "status": "blocked-live-action",
                "reason": "Demo endpoint never creates a real Sablier stream.",
            },
            {
                "guardrailId": "overdraw",
                "status": "watch" if withdrawable_amount > request.fundedAmount else "clear",
                "reason": "Withdrawable amount must not exceed available simulated funding.",
            },
            {
                "guardrailId": "insolvent_stream",
                "status": "blocked" if is_insolvent else "clear",
                "reason": "Uncovered debt indicates simulated insolvency.",
            },
        ]
        return SablierPayrollSimulation(
            mode="simulation-only",
            streamCreated=False,
            paymentPlanId=request.paymentPlanId,
            paymentItemId=request.paymentItemId,
            lifecycleStates=["pending", "streaming", "paused", "voided"],
            durationSeconds=duration_seconds,
            elapsedSeconds=elapsed_seconds,
            ratePerSecond=rate_per_second,
            accruedAmount=accrued_amount,
            withdrawableAmount=withdrawable_amount,
            fundedAmount=request.fundedAmount,
            fundingRunwaySeconds=funding_runway_seconds,
            insolventStatePreview={
                "isInsolvent": is_insolvent,
                "uncoveredDebt": uncovered_debt,
                "coveredDebt": min(accrued_amount, request.fundedAmount),
            },
            guardrails=guardrails,
            safetyNotes=[
                "Simulation uses Sablier Flow-style rate-per-second and debt concepts.",
                "No stream, transaction, approval, or wallet action is created.",
            ],
        )

    def dry_run_safe_guard_policy(self, request: SafeGuardPolicyDryRunRequest):
        signer_count = len(set(request.proposedSigners).intersection(request.owners))
        meets_threshold = signer_count >= request.threshold
        risky_operation = request.operation.upper() in {"DELEGATECALL", "ENABLE_MODULE"}
        would_execute = meets_threshold and not risky_operation
        risk_matrix = [
            {
                "policyId": "owner_threshold",
                "status": "pass" if meets_threshold else "blocked",
                "reason": "Safe execution requires enough owner signatures.",
            },
            {
                "policyId": "delegatecall_blocked",
                "status": "blocked" if request.operation.upper() == "DELEGATECALL" else "clear",
                "reason": "Delegatecall is blocked in the demo guard policy.",
            },
            {
                "policyId": "module_enablement_requires_review",
                "status": "blocked-live-action",
                "reason": "Module enablement requires explicit owner approval and security review.",
            },
        ]
        return SafeGuardPolicyDryRun(
            mode="dry-run",
            safeAddress=request.safeAddress,
            moduleName=request.moduleName,
            moduleEnabled=False,
            guardEnabled=False,
            wouldExecute=would_execute,
            ownerThreshold={
                "owners": request.owners,
                "threshold": request.threshold,
                "validSignerCount": signer_count,
                "meetsThreshold": meets_threshold,
            },
            enablementChecklist=[
                {"item": "owner approval", "complete": False},
                {"item": "security review", "complete": False},
                {"item": "test coverage", "complete": False},
                {"item": "explicit deployment approval", "complete": False},
            ],
            riskMatrix=risk_matrix,
            blockedOperationExamples=[
                {"operation": "DELEGATECALL", "reason": "blocked by guard simulation"},
                {"operation": "ENABLE_MODULE", "reason": "live Safe module enablement forbidden"},
                {"operation": "EXEC_TRANSACTION_FROM_MODULE", "reason": "module execution forbidden"},
            ],
            safeVsCawComparison={
                "safeConcepts": ["owners", "threshold", "modules", "guards"],
                "cawBoundary": "All real payment execution stays behind CAW adapter.",
                "executionAuthorityUnchanged": True,
            },
            safetyNotes=[
                "Dry run only; no Safe module or guard is enabled, deployed, or executed.",
                "Human approval and deterministic risk checks remain the execution gates.",
            ],
        )

    def simulate_treasury_coordination(
        self, request: TreasuryCoordinationSimulationRequest
    ):
        payment_plan = self._get_payment_plan(request.paymentPlanId)
        payment_by_id = {payment.id: payment for payment in payment_plan.payments}
        conflicts: list[dict[str, Any]] = []
        spent_by_agent: dict[str, float] = {}
        seen_payment_items: set[str] = set()
        proposal_rows = []
        for proposal in request.proposals:
            payment = payment_by_id.get(proposal.paymentItemId)
            if payment is None:
                raise P2RecordNotFound("Payment item not found")
            spent_by_agent[proposal.agentId] = (
                spent_by_agent.get(proposal.agentId, 0) + proposal.requestedAmount
            )
            if proposal.paymentItemId in seen_payment_items:
                conflicts.append(
                    {
                        "type": "duplicate_payment_item",
                        "agentId": proposal.agentId,
                        "paymentItemId": proposal.paymentItemId,
                    }
                )
            seen_payment_items.add(proposal.paymentItemId)
            proposal_rows.append(
                {
                    "agentId": proposal.agentId,
                    "paymentItemId": proposal.paymentItemId,
                    "requestedAmount": proposal.requestedAmount,
                    "recipient": payment.recipient,
                    "token": payment.token,
                }
            )
        for agent_id, amount in spent_by_agent.items():
            cap = request.departmentBudgets.get(agent_id)
            if cap is not None and amount > cap:
                conflicts.append(
                    {
                        "type": "budget_cap_exceeded",
                        "agentId": agent_id,
                        "requestedAmount": amount,
                        "budgetCap": cap,
                    }
                )
        return TreasuryCoordinationSimulation(
            mode="simulation-only",
            paymentPlanId=request.paymentPlanId,
            authorizationChanged=False,
            humanApprovalRequired=True,
            deterministicRiskStillRequired=True,
            proposals=proposal_rows,
            conflicts=conflicts,
            approvalMatrix=[
                {
                    "agentId": proposal["agentId"],
                    "paymentItemId": proposal["paymentItemId"],
                    "agentCanRecommend": True,
                    "agentCanApprove": False,
                    "humanApprovalRequired": True,
                    "riskCheckRequired": True,
                }
                for proposal in proposal_rows
            ],
            responsibilitySplit=[
                {"actor": "department-agent", "responsibility": "propose and explain"},
                {"actor": "risk-engine", "responsibility": "deterministic guardrails"},
                {"actor": "human-approver", "responsibility": "final approval"},
                {"actor": "CAW-adapter", "responsibility": "only approved execution path"},
            ],
            auditTimeline=[
                {
                    "eventType": "proposal_received",
                    "count": len(proposal_rows),
                    "mode": "mock",
                },
                {
                    "eventType": "proposal_conflict",
                    "count": len(conflicts),
                    "mode": "simulation-only",
                },
                {
                    "eventType": "authorization_boundary",
                    "status": "unchanged",
                    "mode": "demo-safe",
                },
            ],
            safetyNotes=[
                "Multi-agent treasury coordination is advisory only.",
                "No new approval role, wallet permission, or payment authority is created.",
            ],
        )

    def get_p2_readiness(self, audit_report_id: str):
        audit_report = self.store.get_audit_report(audit_report_id)
        if audit_report is None:
            raise P2RecordNotFound("Audit report not found")
        payment_plan_id = audit_report.paymentPlan.paymentPlanId
        references = self._readiness_external_references(audit_report_id, payment_plan_id)
        integrity = self.check_external_reference_integrity(references)
        reference_summaries = [
            {
                "externalReferenceId": reference.externalReferenceId,
                "referenceType": reference.referenceType,
                "provider": reference.provider,
                "status": reference.status,
                "paymentPlanId": reference.paymentPlanId,
                "paymentItemId": reference.paymentItemId,
                "auditReportId": reference.auditReportId,
                "cawRequestId": reference.cawRequestId,
                "mode": reference.mode,
                "liveIntegrationEnabled": reference.liveIntegrationEnabled,
            }
            for reference in references
        ]
        by_type: dict[str, list[ExternalReference]] = {}
        for reference in references:
            by_type.setdefault(reference.referenceType, []).append(reference)
        request_invoice_refs = by_type.get(ExternalReferenceType.REQUEST_INVOICE, [])
        sablier_refs = by_type.get(ExternalReferenceType.SABLIER_STREAM_PREVIEW, [])
        safe_refs = by_type.get(ExternalReferenceType.SAFE_PERMISSION_REFERENCE, [])
        missing_links = [
            reference_type
            for reference_type, items in {
                ExternalReferenceType.REQUEST_INVOICE: request_invoice_refs,
                ExternalReferenceType.SABLIER_STREAM_PREVIEW: sablier_refs,
                ExternalReferenceType.SAFE_PERMISSION_REFERENCE: safe_refs,
            }.items()
            if not items
        ]
        config = self.request_finance_config
        return P2ReadinessReport(
            mode="demo-safe-readiness",
            auditReportId=audit_report_id,
            paymentPlanId=payment_plan_id,
            auditSnapshotImmutable=True,
            linkedExternalReferences={
                "count": len(references),
                "listSummary": reference_summaries,
                "byType": {
                    reference_type: len(items)
                    for reference_type, items in sorted(by_type.items())
                },
            },
            requestFinance={
                "mode": config.public_mode,
                "status": "linked" if request_invoice_refs else "missing",
                "recordCount": len(request_invoice_refs),
                "liveIntegrationEnabled": any(
                    reference.liveIntegrationEnabled for reference in request_invoice_refs
                ),
                "invoiceCreateGuardEnabled": config.allow_invoice_create,
                "webhookReplayMockV2": True,
            },
            sablier={
                "status": "preview-linked" if sablier_refs else "missing",
                "referenceCount": len(sablier_refs),
                "streamCreated": False,
                "liveEnabled": False,
            },
            safe={
                "status": "reference-linked" if safe_refs else "missing",
                "referenceCount": len(safe_refs),
                "moduleEnabled": False,
                "guardEnabled": False,
            },
            multichain={
                "status": "design-only",
                "liveExecutionEnabled": False,
                "currentExecutionBoundary": "existing CAW adapter allowlist only",
            },
            treasury={
                "status": "mock-ready",
                "authorizationChanged": False,
                "humanApprovalRequired": True,
                "deterministicRiskStillRequired": True,
            },
            missingLinks=missing_links,
            integrity=integrity,
            safetyFlags={
                "providerTouched": False,
                "emailSent": False,
                "paymentTriggered": False,
                "onChainConversion": False,
                "cawTransferCalled": False,
                "sablierStreamCreated": False,
                "safeModuleEnabled": False,
                "multichainLiveExecution": False,
                "auditSnapshotMutated": False,
            },
            safetyNotes=[
                "Readiness is computed from existing audit and external-reference metadata only.",
                "No provider, email, CAW transfer, Sablier, Safe, multichain, or payment action is triggered.",
            ],
        )

    def check_external_reference_integrity(self, references: list[ExternalReference]):
        orphan_references = []
        missing_linked_ids = []
        event_counts: dict[tuple[str, str], int] = {}
        for reference in references:
            orphan_fields = []
            if (
                reference.paymentPlanId is not None
                and self.store.get_payment_plan(reference.paymentPlanId) is None
            ):
                orphan_fields.append("paymentPlanId")
            if (
                reference.auditReportId is not None
                and self.store.get_audit_report(reference.auditReportId) is None
            ):
                orphan_fields.append("auditReportId")
            if (
                reference.cawRequestId is not None
                and self.store.get_caw_status(reference.cawRequestId) is None
            ):
                orphan_fields.append("cawRequestId")
            if reference.paymentPlanId is not None and reference.paymentItemId is not None:
                payment_plan = self.store.get_payment_plan(reference.paymentPlanId)
                if payment_plan is None or all(
                    payment.id != reference.paymentItemId
                    for payment in payment_plan.payments
                ):
                    orphan_fields.append("paymentItemId")
            if orphan_fields:
                orphan_references.append(
                    {
                        "externalReferenceId": reference.externalReferenceId,
                        "orphanFields": orphan_fields,
                    }
                )
            missing_fields = [
                field
                for field in ["paymentPlanId", "paymentItemId", "auditReportId", "cawRequestId"]
                if getattr(reference, field) is None
            ]
            if missing_fields:
                missing_linked_ids.append(
                    {
                        "externalReferenceId": reference.externalReferenceId,
                        "referenceType": reference.referenceType,
                        "missingFields": missing_fields,
                    }
                )
            event_id = reference.metadata.get("eventId")
            invoice_id = reference.metadata.get("requestFinanceInvoiceId")
            if (
                reference.metadata.get("webhookReplayVersion") == "v2"
                and event_id is not None
                and invoice_id is not None
            ):
                key = (invoice_id, event_id)
                event_counts[key] = event_counts.get(key, 0) + 1
        duplicate_invoice_event_ids = [
            {"invoiceId": invoice_id, "eventId": event_id, "count": count}
            for (invoice_id, event_id), count in sorted(event_counts.items())
            if count > 1
        ]
        return {
            "orphanReferences": orphan_references,
            "duplicateInvoiceEventIds": duplicate_invoice_event_ids,
            "missingLinkedIds": missing_linked_ids,
        }

    def get_demo_runbook(self):
        return DemoRunbook(
            mode="demo-safe",
            liveActionsDefaultEnabled=False,
            steps=[
                {"order": 1, "endpoint": "/health", "badge": "online"},
                {"order": 2, "endpoint": "/version", "badge": "capabilities"},
                {"order": 3, "endpoint": "/api/demo-sample", "badge": "mock-input"},
                {"order": 4, "endpoint": "/api/payment-plan", "badge": "planner"},
                {"order": 5, "endpoint": "/api/risk-check", "badge": "deterministic-risk"},
                {"order": 6, "endpoint": "/api/execute-payment", "badge": "mock-caw"},
                {"order": 7, "endpoint": "/api/p2/evidence-timeline/{auditReportId}", "badge": "linked-evidence"},
                {"order": 8, "endpoint": "/api/p2/planner-explainability", "badge": "llm-boundary"},
                {"order": 9, "endpoint": "/api/p2/request-finance/lifecycle-preview", "badge": "invoice-lifecycle-mock"},
                {"order": 10, "endpoint": "/api/p2/sablier/payroll-simulation", "badge": "stream-simulation"},
                {"order": 11, "endpoint": "/api/p2/safe/guard-policy-dry-run", "badge": "safe-dry-run"},
                {"order": 12, "endpoint": "/api/p2/treasury/coordination-simulation", "badge": "multi-agent-simulation"},
            ],
            expectedBadges=[
                "mock-demo",
                "demo-safe",
                "simulation-only",
                "reference-only",
                "preflight",
                "no-live-action",
            ],
            forbiddenClaims=[
                "Request Finance payment integration is complete",
                "Sablier stream was created",
                "Safe module or guard is enabled",
                "multi-agent authorization is live",
                "new live chain execution is enabled",
            ],
            safetyNotes=["Runbook endpoints are presentation metadata only."],
        )

    def get_demo_storyboard(self):
        return DemoStoryboard(
            mode="demo-safe",
            frames=[
                {"order": 1, "title": "Load mock contribution records", "badge": "mock-demo"},
                {"order": 2, "title": "Generate AI Payment Plan", "badge": "planner"},
                {"order": 3, "title": "Run deterministic Risk Check", "badge": "risk-engine"},
                {"order": 4, "title": "Capture Human Approval", "badge": "human-gate"},
                {"order": 5, "title": "Execute through mock CAW path", "badge": "mock-caw"},
                {"order": 6, "title": "Render immutable Audit Report", "badge": "audit-evidence"},
                {"order": 7, "title": "Show P2 linked evidence simulations", "badge": "demo-safe"},
            ],
            safetyNotes=["Storyboard copy must not claim live payment integration completion."],
        )

    def get_demo_blocked_examples(self):
        return DemoBlockedExamples(
            mode="demo-safe",
            examples=[
                {"guardrailId": "non_whitelisted_wallet", "endpoint": "/api/risk-check"},
                {"guardrailId": "missing_human_approval", "endpoint": "/api/execute-payment"},
                {"guardrailId": "request_finance_onchain_conversion_forbidden", "endpoint": "/api/p2/request-finance/lifecycle-preview"},
                {"guardrailId": "sablier_stream_creation_forbidden", "endpoint": "/api/p2/sablier/payroll-simulation"},
                {"guardrailId": "safe_module_enablement_forbidden", "endpoint": "/api/p2/safe/guard-policy-dry-run"},
                {"guardrailId": "multi_agent_authorization_forbidden", "endpoint": "/api/p2/treasury/coordination-simulation"},
            ],
            safetyNotes=["Blocked examples are static demo contracts and do not trigger live actions."],
        )

    def get_demo_contracts(self):
        endpoints = {
            "/api/p2/planner-explainability": {"mode": "demo-safe", "method": "GET"},
            "/api/p2/request-finance/lifecycle-preview": {"mode": "simulation-only", "method": "POST"},
            "/api/p2/sablier/payroll-simulation": {"mode": "simulation-only", "method": "POST"},
            "/api/p2/safe/guard-policy-dry-run": {"mode": "dry-run", "method": "POST"},
            "/api/p2/treasury/coordination-simulation": {"mode": "simulation-only", "method": "POST"},
            "/api/p2/request-finance/preflight": {"mode": "preflight", "method": "POST"},
            "/api/demo/runbook": {"mode": "demo-safe", "method": "GET"},
            "/api/demo/storyboard": {"mode": "demo-safe", "method": "GET"},
            "/api/demo/blocked-examples": {"mode": "demo-safe", "method": "GET"},
        }
        return DemoContracts(
            mode="contract-reference",
            noLiveActions=True,
            endpoints=endpoints,
            globalInvariants=[
                "P0/P1 payment authorization is unchanged.",
                "Audit Report snapshots are immutable.",
                "No secrets are exposed.",
                "No CAW transfer, Sablier stream, Safe enablement, on-chain Request conversion, or payment is triggered.",
            ],
        )

    def get_openapi_lite_contracts(self):
        contracts = [
            self._openapi_lite_contract(
                path="/api/payment-plan",
                method="POST",
                purpose="Create an AI-assisted payment plan from contribution records.",
                request_model="PaymentPlanRequest",
                response_model="PaymentPlan",
                required_fields=["contributions", "budgetRule"],
                example_payload={
                    "contributions": [
                        {
                            "name": "Alice",
                            "role": "community",
                            "task": "Community moderation",
                            "wallet": "0xAlice",
                            "amount": 20,
                            "token": "USDC",
                        }
                    ],
                    "budgetRule": {
                        "monthlyBudget": 50,
                        "singlePaymentLimit": 25,
                        "allowedToken": "USDC",
                        "whitelist": ["0xAlice"],
                        "requiresHumanApproval": True,
                    },
                },
                mode_label="mock/openai planner; deterministic checks still separate",
                live_action_boundary="No payment, CAW transfer, provider call, or audit mutation.",
                display_hints={"primaryBadge": "planner", "showAs": "plan-table"},
            ),
            self._openapi_lite_contract(
                path="/api/risk-check",
                method="POST",
                purpose="Run deterministic budget, token, whitelist, duplicate, and approval guardrails.",
                request_model="RiskCheckRequest",
                response_model="RiskCheckResult",
                required_fields=["paymentPlanId", "budgetRule"],
                example_payload={
                    "paymentPlanId": "plan_demo_001",
                    "budgetRule": {
                        "monthlyBudget": 50,
                        "singlePaymentLimit": 25,
                        "allowedToken": "USDC",
                        "whitelist": ["0xAlice"],
                        "requiresHumanApproval": True,
                    },
                },
                mode_label="deterministic-risk",
                live_action_boundary="No payment or external provider call.",
                display_hints={"primaryBadge": "risk", "showAs": "guardrail-list"},
            ),
            self._openapi_lite_contract(
                path="/api/execute-payment",
                method="POST",
                purpose="Execute approved, risk-checked payment items through configured CAW adapter mode.",
                request_model="ExecutePaymentRequest",
                response_model="PaymentExecutionResult",
                required_fields=["paymentPlanId", "approvedPaymentIds", "humanApproval"],
                example_payload={
                    "paymentPlanId": "plan_demo_001",
                    "approvedPaymentIds": ["pay_1"],
                    "humanApproval": {"approved": True, "approvedBy": "demo-approver"},
                },
                mode_label="mock-caw by default",
                live_action_boundary="Real CAW transfer requires separate credentials and approval; P2 utilities do not change this.",
                display_hints={"primaryBadge": "execution", "showAs": "execution-result"},
            ),
            self._openapi_lite_contract(
                path="/api/audit-report/{auditReportId}",
                method="GET",
                purpose="Read immutable audit snapshot for a completed execution.",
                request_model=None,
                response_model="AuditReport",
                required_fields=["auditReportId"],
                example_payload=None,
                mode_label="immutable-read",
                live_action_boundary="Read-only audit snapshot; P2 metadata does not rewrite it.",
                display_hints={"primaryBadge": "audit", "showAs": "evidence-snapshot"},
            ),
            self._openapi_lite_contract(
                path="/api/request-invoices",
                method="POST",
                purpose="Create linked Request Finance invoice metadata; live invoice create remains env-gated.",
                request_model="RequestInvoiceCreate",
                response_model="RequestInvoiceRecord",
                required_fields=[
                    "paymentPlanId",
                    "paymentItemId",
                    "requestFinanceInvoiceId",
                    "status",
                ],
                example_payload={
                    "paymentPlanId": "plan_demo_001",
                    "paymentItemId": "pay_1",
                    "auditReportId": "audit_demo_001",
                    "cawRequestId": "caw_mock_001",
                    "requestFinanceInvoiceId": "rf_demo_001",
                    "requestId": "request_demo_001",
                    "status": "draft",
                    "hostedUrl": "https://example.invalid/request/rf_demo_001",
                },
                mode_label="mock/live-readonly metadata",
                live_action_boundary="Default path stores metadata only; POST /invoices requires REQUEST_FINANCE_ALLOW_INVOICE_CREATE=true.",
                display_hints={"primaryBadge": "request-finance", "showAs": "external-reference"},
            ),
            self._openapi_lite_contract(
                path="/api/p2/request-finance/preflight",
                method="POST",
                purpose="Validate whether an off-chain Request Finance create payload is sufficiently configured.",
                request_model="RequestInvoiceCreate",
                response_model="RequestFinancePreflight",
                required_fields=["paymentPlanId", "paymentItemId"],
                example_payload={
                    "paymentPlanId": "plan_demo_001",
                    "paymentItemId": "pay_1",
                    "buyerEmail": "buyer@example.invalid",
                    "invoiceNumber": "AGENTCFO-DEMO-001",
                    "invoiceItemName": "AgentCFO demo service",
                    "invoiceCurrency": "USD",
                    "invoiceQuantity": 1,
                    "invoiceUnitPrice": 100,
                    "paymentCurrency": "USDC-matic",
                    "paymentNetwork": "matic",
                    "paymentAddress": "0x0000000000000000000000000000000000000000",
                    "status": "draft",
                    "requestFinanceInvoiceId": "preflight-only",
                },
                mode_label="preflight",
                live_action_boundary="No provider call; reports configuration/input gaps only.",
                display_hints={"primaryBadge": "preflight", "showAs": "checklist"},
            ),
            self._openapi_lite_contract(
                path="/api/p2/request-finance/webhook-replay",
                method="POST",
                purpose="Replay a mock Request Finance invoice lifecycle webhook event and record linked metadata.",
                request_model="RequestFinanceWebhookReplayRequest",
                response_model="RequestFinanceWebhookReplayResult",
                required_fields=[
                    "eventId",
                    "eventType",
                    "invoiceId",
                    "status",
                    "paymentPlanId",
                    "paymentItemId",
                ],
                example_payload={
                    "eventId": "evt_rf_001",
                    "eventType": "invoice.created",
                    "invoiceId": "rf_webhook_demo_001",
                    "requestId": "request_webhook_demo_001",
                    "status": "created",
                    "paymentPlanId": "plan_demo_001",
                    "paymentItemId": "pay_1",
                    "auditReportId": "audit_demo_001",
                    "cawRequestId": "caw_mock_001",
                    "payload": {"invoice": {"id": "rf_webhook_demo_001", "status": "created"}},
                },
                mode_label="simulation-only",
                live_action_boundary="No Request Finance provider call, email, on-chain conversion, or payment.",
                display_hints={"primaryBadge": "webhook-mock", "showAs": "timeline"},
            ),
        ]
        return OpenApiLiteContracts(
            mode="openapi-lite",
            openapiSource="custom-lite",
            fastapiOpenapiEnabled=False,
            docsUiEnabled=False,
            noSecrets=True,
            noLiveActions=True,
            contracts=contracts,
            globalInvariants=[
                "FastAPI public /docs and /openapi.json stay disabled.",
                "P0/P1 authorization, risk checks, CAW adapter behavior, and Audit Report immutability are unchanged.",
                "No secrets, raw environment values, or private wallet credentials are exposed.",
                "No CAW transfer, Sablier stream, Safe enablement, on-chain Request conversion, or payment is triggered.",
            ],
        )

    def _openapi_lite_contract(
        self,
        path: str,
        method: str,
        purpose: str,
        request_model: str | None,
        response_model: str,
        required_fields: list[str],
        example_payload: dict[str, Any] | None,
        mode_label: str,
        live_action_boundary: str,
        display_hints: dict[str, Any],
    ):
        return OpenApiLiteContract(
            path=path,
            method=method,
            purpose=purpose,
            requestModel=request_model,
            responseModel=response_model,
            requiredFields=required_fields,
            examplePayload=example_payload,
            modeLabel=mode_label,
            liveActionBoundary=live_action_boundary,
            safetyFlags={
                "noSecrets": True,
                "noCawTransfer": True,
                "noSablierStream": True,
                "noSafeModule": True,
                "noOnChainRequestConversion": True,
                "noPayment": True,
                "auditSnapshotImmutable": True,
            },
            frontendDisplayHints=display_hints,
        )

    def _request_finance_webhook_events(
        self,
        payment_plan_id: str,
        invoice_id: str,
    ):
        return [
            reference
            for reference in self.store.list_external_references(
                payment_plan_id=payment_plan_id,
                reference_type=ExternalReferenceType.REQUEST_INVOICE,
            )
            if reference.provider == "request-finance-webhook-mock"
            and reference.metadata.get("webhookReplayVersion") == "v2"
            and reference.metadata.get("requestFinanceInvoiceId") == invoice_id
        ]

    def _request_finance_webhook_timeline(self, events: list[ExternalReference]):
        return [
            {
                "externalReferenceId": event.externalReferenceId,
                "eventId": event.metadata["eventId"],
                "eventType": event.metadata["eventType"],
                "invoiceId": event.metadata["requestFinanceInvoiceId"],
                "requestId": event.metadata.get("requestId"),
                "status": event.metadata["normalizedStatus"],
                "providerTouched": False,
                "emailSent": False,
                "paymentTriggered": False,
                "onChainConversion": False,
            }
            for event in sorted(
                events,
                key=lambda event: (event.createdAt, event.metadata.get("eventId", "")),
            )
        ]

    def _request_finance_transition_allowed(
        self,
        existing_statuses: list[str],
        next_status: str,
    ):
        if not existing_statuses:
            return next_status == "created"
        current_status = existing_statuses[-1]
        allowed_transitions = {
            "created": {"accepted", "canceled", "rejected", "paid"},
            "accepted": {"paid", "canceled", "rejected"},
        }
        return next_status in allowed_transitions.get(current_status, set())

    def _readiness_external_references(
        self,
        audit_report_id: str,
        payment_plan_id: str,
    ):
        references_by_id: dict[str, ExternalReference] = {}
        for reference in self.store.list_external_references(audit_report_id=audit_report_id):
            references_by_id[reference.externalReferenceId] = reference
        for reference in self.store.list_external_references(payment_plan_id=payment_plan_id):
            references_by_id[reference.externalReferenceId] = reference
        return sorted(
            references_by_id.values(),
            key=lambda reference: reference.externalReferenceId,
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
