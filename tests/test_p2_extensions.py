import os

import httpx
from fastapi.testclient import TestClient

os.environ["AGENTCFO_DB_PATH"] = ":memory:"
os.environ["CAW_ADAPTER_MODE"] = "mock"
os.environ["CAW_ENABLE_TRANSFERS"] = "false"
os.environ["REQUEST_FINANCE_MODE"] = "mock"
os.environ.pop("REQUEST_FINANCE_API_KEY", None)
os.environ.pop("REQUEST_FINANCE_ALLOW_INVOICE_CREATE", None)
os.environ.pop("REQUEST_FINANCE_AUTH_SCHEME", None)

from app.main import app
from app.store import store
import app.services.p2_extensions as p2_service_module
import app.routers.p2_extensions as p2_router_module
from app.models import RequestInvoiceCreate
from app.services.p2_extensions import P2ExtensionService
from app.services.request_finance import (
    LiveRequestFinanceClient,
    RequestFinanceConfig,
    RequestFinanceInvoiceResult,
    RequestFinanceProviderError,
    build_request_finance_invoice_payload,
)


client = TestClient(app)


def sample_budget():
    return {
        "monthlyBudget": 50,
        "singlePaymentLimit": 25,
        "allowedToken": "USDC",
        "whitelist": ["0xAlice", "0xCharlie"],
        "requiresHumanApproval": True,
    }


def create_p0_flow():
    plan_response = client.post(
        "/api/payment-plan",
        json={
            "contributions": [
                {
                    "name": "Alice",
                    "role": "Content Contributor",
                    "task": "Wrote event recap article",
                    "wallet": "0xAlice",
                    "amount": 20,
                    "token": "USDC",
                },
                {
                    "name": "Charlie",
                    "role": "Community Operator",
                    "task": "Managed community and exported data",
                    "wallet": "0xCharlie",
                    "amount": 10,
                    "token": "USDC",
                },
            ],
            "budgetRule": sample_budget(),
        },
    )
    assert plan_response.status_code == 200
    plan = plan_response.json()

    risk_response = client.post(
        "/api/risk-check",
        json={"paymentPlanId": plan["paymentPlanId"], "budgetRule": sample_budget()},
    )
    assert risk_response.status_code == 200

    execution_response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"]],
            "humanApproval": {"approved": True, "approvedBy": "p2-demo"},
        },
    )
    assert execution_response.status_code == 200
    execution = execution_response.json()
    return plan, execution


def setup_function():
    store.reset()


def test_external_reference_can_be_created_read_and_listed_without_changing_audit_snapshot():
    plan, execution = create_p0_flow()
    audit_before = client.get(f"/api/audit-report/{execution['auditReportId']}").json()

    response = client.post(
        "/api/external-references",
        json={
            "referenceType": "request_invoice",
            "provider": "request-network",
            "label": "Invoice evidence for Alice recap",
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": plan["payments"][0]["id"],
            "auditReportId": execution["auditReportId"],
            "cawRequestId": execution["payments"][0]["cawRequestId"],
            "status": "mock_recorded",
            "metadata": {"hostedUrl": "https://example.invalid/invoice/demo"},
        },
    )

    assert response.status_code == 200
    reference = response.json()
    assert reference["externalReferenceId"] == "ext_ref_001"
    assert reference["referenceType"] == "request_invoice"
    assert reference["liveIntegrationEnabled"] is False

    lookup = client.get(f"/api/external-references/{reference['externalReferenceId']}")
    assert lookup.status_code == 200
    assert lookup.json() == reference

    listing = client.get(
        f"/api/external-references?paymentPlanId={plan['paymentPlanId']}"
    )
    assert listing.status_code == 200
    assert listing.json()["items"] == [reference]

    audit_after = client.get(f"/api/audit-report/{execution['auditReportId']}").json()
    assert audit_after == audit_before


def test_request_invoice_record_is_demo_safe_and_audit_linked():
    plan, execution = create_p0_flow()

    response = client.post(
        "/api/request-invoices",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": plan["payments"][0]["id"],
            "auditReportId": execution["auditReportId"],
            "cawRequestId": execution["payments"][0]["cawRequestId"],
            "requestFinanceInvoiceId": "rf_demo_001",
            "requestId": "request_demo_001",
            "status": "draft",
            "hostedUrl": "https://example.invalid/request/rf_demo_001",
            "txHashReference": None,
        },
    )

    assert response.status_code == 200
    invoice = response.json()
    assert invoice["externalReference"]["referenceType"] == "request_invoice"
    assert invoice["externalReference"]["liveIntegrationEnabled"] is False
    assert invoice["requestFinanceInvoiceId"] == "rf_demo_001"
    assert invoice["status"] == "draft"
    assert invoice["externalReference"]["metadata"]["requestFinanceMode"] == "mock"

    lookup = client.get(f"/api/request-invoices/{invoice['externalReferenceId']}")
    assert lookup.status_code == 200
    assert lookup.json() == invoice


def test_evidence_timeline_aggregates_audit_caw_and_p2_references_without_mutating_snapshot():
    plan, execution = create_p0_flow()
    audit_before = client.get(f"/api/audit-report/{execution['auditReportId']}").json()

    reference_response = client.post(
        "/api/external-references",
        json={
            "referenceType": "request_invoice",
            "provider": "request-finance",
            "label": "Request invoice linked evidence",
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": plan["payments"][0]["id"],
            "auditReportId": execution["auditReportId"],
            "cawRequestId": execution["payments"][0]["cawRequestId"],
            "status": "created",
            "metadata": {
                "requestFinanceInvoiceId": "rf_demo_001",
                "requestFinanceMode": "mock",
            },
        },
    )
    assert reference_response.status_code == 200

    response = client.get(f"/api/p2/evidence-timeline/{execution['auditReportId']}")

    assert response.status_code == 200
    timeline = response.json()
    event_types = [event["eventType"] for event in timeline["events"]]
    assert timeline["auditReportId"] == execution["auditReportId"]
    assert timeline["mode"] == "demo-safe"
    assert "payment_plan" in event_types
    assert "risk_check" in event_types
    assert "human_approval" in event_types
    assert "execution_result" in event_types
    assert "caw_status" in event_types
    assert "external_reference" in event_types
    assert "audit_report" in event_types
    assert all("evidenceLinks" in event for event in timeline["events"])
    assert timeline["auditSnapshotImmutable"] is True

    audit_after = client.get(f"/api/audit-report/{execution['auditReportId']}").json()
    assert audit_after == audit_before


def test_demo_scenario_pack_contains_judge_friendly_deterministic_scenarios():
    response = client.get("/api/p2/demo-scenarios")

    assert response.status_code == 200
    body = response.json()
    scenario_ids = {scenario["scenarioId"] for scenario in body["scenarios"]}
    assert body["mode"] == "demo-safe"
    assert body["externalSystemsTouched"] is False
    assert {
        "standard-approved-payout",
        "over-budget-blocked",
        "unknown-recipient-blocked",
        "unsupported-token-blocked",
        "duplicate-recipient-task-warning",
        "request-invoice-linked-evidence",
        "sablier-preview",
        "safe-reference",
        "multichain-readiness",
        "treasury-partition",
    }.issubset(scenario_ids)
    assert all("curlExample" in scenario for scenario in body["scenarios"])


def test_risk_what_if_reuses_deterministic_guardrails_without_persisting_plan():
    response = client.post(
        "/api/p2/risk-what-if",
        json={
            "payments": [
                {
                    "recipient": "Alice",
                    "task": "Duplicate task",
                    "wallet": "0xAlice",
                    "amount": 40,
                    "token": "USDC",
                    "reason": "what-if",
                },
                {
                    "recipient": "Mallory",
                    "task": "Duplicate task",
                    "wallet": "0xMallory",
                    "amount": 20,
                    "token": "DAI",
                    "reason": "what-if",
                },
            ],
            "budgetRule": sample_budget(),
            "humanApproval": {"approved": False},
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["createsPaymentPlan"] is False
    assert result["executesPayment"] is False
    assert result["overallStatus"] == "Blocked"
    guardrail_ids = {guardrail["guardrailId"] for guardrail in result["guardrails"]}
    assert "monthly_budget" in guardrail_ids
    assert "single_payment_limit" in guardrail_ids
    assert "token_allowlist" in guardrail_ids
    assert "recipient_allowlist" in guardrail_ids
    assert "duplicate_task" in guardrail_ids
    assert "missing_human_approval" in guardrail_ids

    assert client.get("/api/payment-plan/plan_demo_001").status_code == 404


def test_policy_guardrails_expose_non_secret_demo_safety_flags(monkeypatch):
    monkeypatch.setenv("CAW_ADAPTER_MODE", "mock")
    monkeypatch.setenv("CAW_ENABLE_TRANSFERS", "false")
    monkeypatch.setenv("REQUEST_FINANCE_MODE", "live")
    monkeypatch.setenv("REQUEST_FINANCE_API_KEY", "fake-key")
    monkeypatch.delenv("REQUEST_FINANCE_ALLOW_INVOICE_CREATE", raising=False)

    response = client.get("/api/p2/policy-guardrails")

    assert response.status_code == 200
    summary = response.json()
    assert summary["auditSnapshotImmutable"] is True
    assert summary["caw"]["mode"] == "mock"
    assert summary["caw"]["transferEnabled"] is False
    assert summary["requestFinance"]["mode"] == "live"
    assert summary["requestFinance"]["apiKeyConfigured"] is True
    assert summary["requestFinance"]["invoiceCreateGuardEnabled"] is False
    assert summary["sablier"]["liveEnabled"] is False
    assert summary["safe"]["moduleEnabled"] is False
    assert summary["multichain"]["liveExecutionEnabled"] is False
    assert "fake-key" not in response.text


def test_evidence_export_returns_markdown_ready_package_without_inventing_live_tx():
    plan, execution = create_p0_flow()
    client.post(
        "/api/external-references",
        json={
            "referenceType": "request_invoice",
            "provider": "request-finance",
            "label": "Request invoice linked evidence",
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": plan["payments"][0]["id"],
            "auditReportId": execution["auditReportId"],
            "cawRequestId": execution["payments"][0]["cawRequestId"],
            "status": "mock_recorded",
            "metadata": {"requestFinanceInvoiceId": "rf_demo_001"},
        },
    )

    response = client.get(f"/api/p2/evidence-export/{execution['auditReportId']}")

    assert response.status_code == 200
    package = response.json()
    assert package["auditReportId"] == execution["auditReportId"]
    assert package["paymentPlanId"] == plan["paymentPlanId"]
    assert package["txHashState"] == "mock-no-tx-hash"
    assert package["cawRequestIds"] == [execution["payments"][0]["cawRequestId"]]
    assert package["externalReferenceIds"] == ["ext_ref_001"]
    assert "Current real CAW evidence remains one low-value testnet transaction" in package[
        "approvedDemoWording"
    ]
    assert "payment integration complete" in package["forbiddenWording"]


def test_request_finance_preflight_validates_live_invoice_fields_without_provider_call(
    monkeypatch,
):
    def fail_if_called(_config):
        raise AssertionError("preflight must not create Request Finance client")

    monkeypatch.setattr(p2_service_module, "create_request_finance_client", fail_if_called)

    missing_response = client.post(
        "/api/p2/request-finance/preflight",
        json={
            "paymentPlanId": "plan_demo_001",
            "paymentItemId": "pay_001",
            "requestFinanceInvoiceId": "rf_demo_001",
            "status": "draft",
        },
    )

    assert missing_response.status_code == 200
    missing = missing_response.json()
    assert missing["ready"] is False
    assert "buyerEmail" in missing["missingFields"]
    assert missing["wouldCallProvider"] is False

    ready_response = client.post(
        "/api/p2/request-finance/preflight",
        json={
            "paymentPlanId": "plan_demo_001",
            "paymentItemId": "pay_001",
            "requestFinanceInvoiceId": "rf_demo_001",
            "status": "draft",
            "buyerEmail": "buyer@example.invalid",
            "invoiceNumber": "AGENTCFO-001",
            "invoiceItemName": "Demo service",
            "invoiceCurrency": "USD",
            "invoiceQuantity": 1,
            "invoiceUnitPrice": 100,
            "paymentCurrency": "USDC-matic",
            "paymentNetwork": "matic",
            "paymentAddress": "0xPaymentAddress",
            "creationDate": "2026-06-10T00:00:00.000Z",
            "dueDate": "2026-06-17T00:00:00.000Z",
        },
    )

    assert ready_response.status_code == 200
    ready = ready_response.json()
    assert ready["ready"] is True
    assert ready["missingFields"] == []
    assert ready["wouldCallProvider"] is False


def test_version_exposes_non_secret_p2_capability_flags():
    response = client.get("/version")

    assert response.status_code == 200
    version = response.json()
    assert version["p2Capabilities"]["evidenceTimeline"] is True
    assert version["p2Capabilities"]["riskWhatIf"] is True
    assert version["p2Capabilities"]["requestFinancePreflight"] is True
    assert version["p2Capabilities"]["plannerExplainability"] is True
    assert version["p2Capabilities"]["requestFinanceLifecycleMock"] is True
    assert version["p2Capabilities"]["sablierPayrollSimulation"] is True
    assert version["p2Capabilities"]["safeGuardPolicySimulation"] is True
    assert version["p2Capabilities"]["multiAgentTreasurySimulation"] is True
    assert version["p2Capabilities"]["demoRunbookContracts"] is True
    assert "REQUEST_FINANCE_API_KEY" not in response.text


def test_planner_explainability_documents_structured_outputs_and_llm_boundaries():
    plan, _execution = create_p0_flow()

    response = client.get(f"/api/p2/planner-explainability?paymentPlanId={plan['paymentPlanId']}")

    assert response.status_code == 200
    body = response.json()
    assert body["mode"] == "demo-safe"
    assert body["paymentPlanId"] == plan["paymentPlanId"]
    assert body["plannerMode"] == "mock"
    assert body["schemaValidation"]["responseFormat"] == "json_schema"
    assert body["schemaValidation"]["strict"] is True
    assert body["schemaValidation"]["additionalProperties"] is False
    assert "generate payment reasons" in body["allowedLlmResponsibilities"]
    assert "approve payments" in body["forbiddenLlmResponsibilities"]
    assert "invent wallet addresses" in body["forbiddenLlmResponsibilities"]
    assert body["malformedOutputFallbackDemo"]["wouldExecutePayment"] is False
    assert body["mockVsOpenAIComparison"]["authorizationBoundaryUnchanged"] is True
    assert all(trace["riskAuthority"] == "deterministic-risk-engine" for trace in body["reasonTrace"])


def test_request_finance_lifecycle_preview_is_event_log_only_and_audit_safe():
    plan, execution = create_p0_flow()
    audit_before = client.get(f"/api/audit-report/{execution['auditReportId']}").json()

    response = client.post(
        "/api/p2/request-finance/lifecycle-preview",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": plan["payments"][0]["id"],
            "auditReportId": execution["auditReportId"],
            "cawRequestId": execution["payments"][0]["cawRequestId"],
            "requestFinanceInvoiceId": "rf_lifecycle_demo_001",
            "currentStatus": "created",
            "events": ["created", "accepted", "paid"],
        },
    )

    assert response.status_code == 200
    preview = response.json()
    assert preview["mode"] == "simulation-only"
    assert preview["providerTouched"] is False
    assert preview["customerEmailSent"] is False
    assert preview["onchainConversionCalled"] is False
    assert preview["paymentTriggered"] is False
    assert [event["status"] for event in preview["eventLog"]] == ["created", "accepted", "paid"]
    assert preview["linkedIds"]["paymentPlanId"] == plan["paymentPlanId"]
    assert preview["linkedIds"]["paymentItemId"] == plan["payments"][0]["id"]
    assert preview["linkedIds"]["auditReportId"] == execution["auditReportId"]
    assert preview["linkedIds"]["cawRequestId"] == execution["payments"][0]["cawRequestId"]

    audit_after = client.get(f"/api/audit-report/{execution['auditReportId']}").json()
    assert audit_after == audit_before


def test_sablier_payroll_simulation_calculates_accrual_runway_and_guardrails_without_stream():
    plan, _execution = create_p0_flow()

    response = client.post(
        "/api/p2/sablier/payroll-simulation",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": plan["payments"][0]["id"],
            "durationDays": 30,
            "elapsedSeconds": 86400,
            "fundedAmount": 5,
            "withdrawnAmount": 1,
        },
    )

    assert response.status_code == 200
    simulation = response.json()
    assert simulation["mode"] == "simulation-only"
    assert simulation["streamCreated"] is False
    assert simulation["lifecycleStates"] == ["pending", "streaming", "paused", "voided"]
    assert simulation["ratePerSecond"] > 0
    assert simulation["accruedAmount"] > 0
    assert simulation["withdrawableAmount"] >= 0
    assert simulation["fundingRunwaySeconds"] > 0
    assert simulation["insolventStatePreview"]["isInsolvent"] is False
    assert "overdraw" in {guardrail["guardrailId"] for guardrail in simulation["guardrails"]}


def test_safe_guard_policy_dry_run_blocks_risky_operations_without_enabling_module():
    response = client.post(
        "/api/p2/safe/guard-policy-dry-run",
        json={
            "safeAddress": "0xSafeDemo",
            "owners": ["0xOwner1", "0xOwner2", "0xOwner3"],
            "threshold": 2,
            "proposedSigners": ["0xOwner1"],
            "operation": "DELEGATECALL",
            "to": "0xUnapprovedTarget",
            "value": 0,
            "moduleName": "SpendingLimitModule",
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["mode"] == "dry-run"
    assert result["moduleEnabled"] is False
    assert result["guardEnabled"] is False
    assert result["wouldExecute"] is False
    assert result["ownerThreshold"]["meetsThreshold"] is False
    assert "delegatecall_blocked" in {entry["policyId"] for entry in result["riskMatrix"]}
    assert any(example["operation"] == "DELEGATECALL" for example in result["blockedOperationExamples"])
    assert result["safeVsCawComparison"]["executionAuthorityUnchanged"] is True


def test_multi_agent_treasury_coordination_is_mock_only_and_keeps_authorization_unchanged():
    plan, execution = create_p0_flow()
    audit_before = client.get(f"/api/audit-report/{execution['auditReportId']}").json()

    response = client.post(
        "/api/p2/treasury/coordination-simulation",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "departmentBudgets": {
                "agent-content": 25,
                "agent-operations": 5,
            },
            "proposals": [
                {
                    "agentId": "agent-content",
                    "paymentItemId": plan["payments"][0]["id"],
                    "requestedAmount": 20,
                },
                {
                    "agentId": "agent-operations",
                    "paymentItemId": plan["payments"][1]["id"],
                    "requestedAmount": 10,
                },
                {
                    "agentId": "agent-content",
                    "paymentItemId": plan["payments"][0]["id"],
                    "requestedAmount": 20,
                },
            ],
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["mode"] == "simulation-only"
    assert result["authorizationChanged"] is False
    assert result["humanApprovalRequired"] is True
    assert result["deterministicRiskStillRequired"] is True
    assert "budget_cap_exceeded" in {conflict["type"] for conflict in result["conflicts"]}
    assert "duplicate_payment_item" in {conflict["type"] for conflict in result["conflicts"]}
    assert len(result["approvalMatrix"]) == 3
    assert any(event["eventType"] == "proposal_conflict" for event in result["auditTimeline"])

    audit_after = client.get(f"/api/audit-report/{execution['auditReportId']}").json()
    assert audit_after == audit_before


def test_demo_runbook_storyboard_blocked_examples_and_contracts_are_frontend_ready():
    runbook = client.get("/api/demo/runbook")
    storyboard = client.get("/api/demo/storyboard")
    blocked = client.get("/api/demo/blocked-examples")
    contracts = client.get("/api/demo/contracts")

    assert runbook.status_code == 200
    assert storyboard.status_code == 200
    assert blocked.status_code == 200
    assert contracts.status_code == 200

    runbook_body = runbook.json()
    assert runbook_body["mode"] == "demo-safe"
    assert runbook_body["liveActionsDefaultEnabled"] is False
    assert any(step["endpoint"] == "/api/payment-plan" for step in runbook_body["steps"])
    assert "Request Finance payment integration is complete" in runbook_body["forbiddenClaims"]

    storyboard_body = storyboard.json()
    assert storyboard_body["frames"][0]["badge"] == "mock-demo"
    assert any("Audit Report" in frame["title"] for frame in storyboard_body["frames"])

    blocked_body = blocked.json()
    assert {example["guardrailId"] for example in blocked_body["examples"]}.issuperset(
        {"non_whitelisted_wallet", "missing_human_approval", "sablier_stream_creation_forbidden"}
    )

    contracts_body = contracts.json()
    assert contracts_body["mode"] == "contract-reference"
    assert contracts_body["noLiveActions"] is True
    assert "/api/p2/request-finance/preflight" in contracts_body["endpoints"]


def test_openapi_lite_contracts_are_machine_readable_and_docs_stay_disabled():
    response = client.get("/api/demo/contracts/openapi-lite")

    assert response.status_code == 200
    body = response.json()
    assert body["mode"] == "openapi-lite"
    assert body["openapiSource"] == "custom-lite"
    assert body["fastapiOpenapiEnabled"] is False
    assert body["docsUiEnabled"] is False
    assert body["noSecrets"] is True
    assert body["noLiveActions"] is True
    assert client.get("/openapi.json").status_code == 404
    assert client.get("/docs").status_code == 404

    contracts = {contract["path"]: contract for contract in body["contracts"]}
    assert {
        "/api/payment-plan",
        "/api/risk-check",
        "/api/execute-payment",
        "/api/audit-report/{auditReportId}",
        "/api/request-invoices",
        "/api/p2/request-finance/preflight",
        "/api/p2/request-finance/webhook-replay",
    }.issubset(contracts)

    payment_plan_contract = contracts["/api/payment-plan"]
    assert payment_plan_contract["method"] == "POST"
    assert payment_plan_contract["requestModel"] == "PaymentPlanRequest"
    assert payment_plan_contract["responseModel"] == "PaymentPlan"
    assert payment_plan_contract["requiredFields"] == ["contributions", "budgetRule"]
    assert payment_plan_contract["examplePayload"]["budgetRule"]["allowedToken"] == "USDC"

    for contract in contracts.values():
        assert set(contract).issuperset(
            {
                "path",
                "method",
                "purpose",
                "requestModel",
                "responseModel",
                "requiredFields",
                "examplePayload",
                "modeLabel",
                "liveActionBoundary",
                "safetyFlags",
                "frontendDisplayHints",
            }
        )
        assert contract["safetyFlags"]["noSecrets"] is True

    assert "REQUEST_FINANCE_API_KEY" not in response.text
    assert "AGENT_WALLET_API_KEY" not in response.text
    assert "OPENAI_API_KEY" not in response.text


def test_p2_readiness_reports_missing_links_without_mutating_audit_snapshot():
    _plan, execution = create_p0_flow()
    audit_id = execution["auditReportId"]
    audit_before = client.get(f"/api/audit-report/{audit_id}").json()

    response = client.get(f"/api/p2/readiness/{audit_id}")

    assert response.status_code == 200
    readiness = response.json()
    assert readiness["mode"] == "demo-safe-readiness"
    assert readiness["auditReportId"] == audit_id
    assert readiness["auditSnapshotImmutable"] is True
    assert readiness["linkedExternalReferences"]["count"] == 0
    assert readiness["requestFinance"]["status"] == "missing"
    assert readiness["sablier"]["status"] == "missing"
    assert readiness["safe"]["status"] == "missing"
    assert readiness["multichain"]["status"] == "design-only"
    assert readiness["treasury"]["status"] == "mock-ready"
    assert {
        "request_invoice",
        "sablier_stream_preview",
        "safe_permission_reference",
    }.issubset(set(readiness["missingLinks"]))
    assert readiness["safetyFlags"] == {
        "providerTouched": False,
        "emailSent": False,
        "paymentTriggered": False,
        "onChainConversion": False,
        "cawTransferCalled": False,
        "sablierStreamCreated": False,
        "safeModuleEnabled": False,
        "multichainLiveExecution": False,
        "auditSnapshotMutated": False,
    }

    audit_after = client.get(f"/api/audit-report/{audit_id}").json()
    assert audit_after == audit_before


def test_p2_readiness_summarizes_linked_refs_and_integrity_findings():
    plan, execution = create_p0_flow()
    audit_id = execution["auditReportId"]
    payment_id = plan["payments"][0]["id"]
    caw_request_id = execution["payments"][0]["cawRequestId"]
    client.post(
        "/api/request-invoices",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": payment_id,
            "auditReportId": audit_id,
            "cawRequestId": caw_request_id,
            "requestFinanceInvoiceId": "rf_ready_001",
            "requestId": "request_ready_001",
            "status": "draft",
        },
    )
    client.post(
        "/api/sablier-stream-previews",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": payment_id,
            "durationDays": 30,
        },
    )
    client.post(
        "/api/safe-permission-references",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "safeAddress": "0xSafeDemo",
            "moduleName": "SpendingLimitModule",
            "permissionNotes": ["demo-only"],
        },
    )
    client.post(
        "/api/external-references",
        json={
            "referenceType": "request_invoice",
            "provider": "request-finance-webhook-mock",
            "label": "Manually duplicated webhook event",
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": payment_id,
            "auditReportId": audit_id,
            "cawRequestId": caw_request_id,
            "status": "created",
            "metadata": {
                "webhookReplayVersion": "v2",
                "eventId": "evt_duplicate",
                "eventType": "invoice.created",
                "requestFinanceInvoiceId": "rf_ready_001",
                "normalizedStatus": "created",
            },
        },
    )
    client.post(
        "/api/external-references",
        json={
            "referenceType": "request_invoice",
            "provider": "request-finance-webhook-mock",
            "label": "Manually duplicated webhook event again",
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": payment_id,
            "auditReportId": audit_id,
            "cawRequestId": caw_request_id,
            "status": "created",
            "metadata": {
                "webhookReplayVersion": "v2",
                "eventId": "evt_duplicate",
                "eventType": "invoice.created",
                "requestFinanceInvoiceId": "rf_ready_001",
                "normalizedStatus": "created",
            },
        },
    )
    client.post(
        "/api/external-references",
        json={
            "referenceType": "request_invoice",
            "provider": "request-finance",
            "label": "Missing payment links but audit-linked",
            "auditReportId": audit_id,
            "status": "incomplete",
            "metadata": {"requestFinanceInvoiceId": "rf_missing_links"},
        },
    )

    response = client.get(f"/api/p2/readiness/{audit_id}")

    assert response.status_code == 200
    readiness = response.json()
    assert readiness["linkedExternalReferences"]["count"] == 6
    assert readiness["requestFinance"]["status"] == "linked"
    assert readiness["requestFinance"]["recordCount"] == 4
    assert readiness["sablier"]["status"] == "preview-linked"
    assert readiness["safe"]["status"] == "reference-linked"
    assert readiness["missingLinks"] == []
    assert readiness["integrity"]["duplicateInvoiceEventIds"] == [
        {"invoiceId": "rf_ready_001", "eventId": "evt_duplicate", "count": 2}
    ]
    assert any(
        finding["externalReferenceId"] == "ext_ref_006"
        and {"paymentPlanId", "paymentItemId", "cawRequestId"}.issubset(
            set(finding["missingFields"])
        )
        for finding in readiness["integrity"]["missingLinkedIds"]
    )
    assert readiness["integrity"]["orphanReferences"] == []


def test_request_finance_webhook_replay_v2_is_idempotent_simulation_and_audit_safe():
    plan, execution = create_p0_flow()
    audit_id = execution["auditReportId"]
    audit_before = client.get(f"/api/audit-report/{audit_id}").json()
    payload = {
        "eventId": "evt_rf_001",
        "eventType": "invoice.created",
        "invoiceId": "rf_webhook_demo_001",
        "requestId": "request_webhook_demo_001",
        "status": "created",
        "paymentPlanId": plan["paymentPlanId"],
        "paymentItemId": plan["payments"][0]["id"],
        "auditReportId": audit_id,
        "cawRequestId": execution["payments"][0]["cawRequestId"],
        "payload": {"invoice": {"id": "rf_webhook_demo_001", "status": "created"}},
    }

    response = client.post("/api/p2/request-finance/webhook-replay", json=payload)
    duplicate = client.post("/api/p2/request-finance/webhook-replay", json=payload)

    assert response.status_code == 200
    assert duplicate.status_code == 200
    body = response.json()
    duplicate_body = duplicate.json()
    assert body["mode"] == "simulation-only"
    assert body["providerTouched"] is False
    assert body["emailSent"] is False
    assert body["paymentTriggered"] is False
    assert body["onChainConversion"] is False
    assert body["acceptedEvent"] is True
    assert body["duplicateEvent"] is False
    assert body["replayResult"] == "event_recorded"
    assert body["normalizedStatus"] == "created"
    assert body["linkedIds"] == {
        "paymentPlanId": plan["paymentPlanId"],
        "paymentItemId": plan["payments"][0]["id"],
        "auditReportId": audit_id,
        "cawRequestId": execution["payments"][0]["cawRequestId"],
    }
    assert body["eventTimeline"] == [
        {
            "eventId": "evt_rf_001",
            "eventType": "invoice.created",
            "invoiceId": "rf_webhook_demo_001",
            "requestId": "request_webhook_demo_001",
            "status": "created",
            "providerTouched": False,
            "emailSent": False,
            "paymentTriggered": False,
            "onChainConversion": False,
        }
    ]
    assert duplicate_body["duplicateEvent"] is True
    assert duplicate_body["replayResult"] == "duplicate_ignored"
    assert duplicate_body["eventTimeline"] == body["eventTimeline"]

    audit_after = client.get(f"/api/audit-report/{audit_id}").json()
    assert audit_after == audit_before


def test_request_finance_webhook_replay_v2_ignores_events_after_terminal_state():
    plan, execution = create_p0_flow()
    audit_id = execution["auditReportId"]
    base_payload = {
        "invoiceId": "rf_webhook_terminal_001",
        "requestId": "request_webhook_terminal_001",
        "paymentPlanId": plan["paymentPlanId"],
        "paymentItemId": plan["payments"][0]["id"],
        "auditReportId": audit_id,
        "cawRequestId": execution["payments"][0]["cawRequestId"],
        "payload": {},
    }
    created = client.post(
        "/api/p2/request-finance/webhook-replay",
        json={
            **base_payload,
            "eventId": "evt_terminal_created",
            "eventType": "invoice.created",
            "status": "created",
        },
    )
    paid = client.post(
        "/api/p2/request-finance/webhook-replay",
        json={
            **base_payload,
            "eventId": "evt_terminal_paid",
            "eventType": "invoice.paid",
            "status": "paid",
        },
    )
    after_paid = client.post(
        "/api/p2/request-finance/webhook-replay",
        json={
            **base_payload,
            "eventId": "evt_terminal_canceled",
            "eventType": "invoice.canceled",
            "status": "canceled",
        },
    )

    assert created.status_code == 200
    assert paid.status_code == 200
    assert after_paid.status_code == 200
    ignored = after_paid.json()
    assert ignored["acceptedEvent"] is False
    assert ignored["duplicateEvent"] is False
    assert ignored["replayResult"] == "terminal_state_ignored"
    assert ignored["normalizedStatus"] == "paid"
    assert [event["eventId"] for event in ignored["eventTimeline"]] == [
        "evt_terminal_created",
        "evt_terminal_paid",
    ]
    assert ignored["providerTouched"] is False
    assert ignored["emailSent"] is False
    assert ignored["paymentTriggered"] is False
    assert ignored["onChainConversion"] is False


def test_request_finance_webhook_replay_v2_rejects_unknown_event_type():
    plan, execution = create_p0_flow()
    response = client.post(
        "/api/p2/request-finance/webhook-replay",
        json={
            "eventId": "evt_rf_bad",
            "eventType": "invoice.refunded",
            "invoiceId": "rf_webhook_demo_bad",
            "requestId": "request_webhook_demo_bad",
            "status": "refunded",
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": plan["payments"][0]["id"],
            "auditReportId": execution["auditReportId"],
            "cawRequestId": execution["payments"][0]["cawRequestId"],
            "payload": {},
        },
    )

    assert response.status_code == 400
    assert "Unsupported Request Finance webhook event type" in response.json()["detail"]


def test_request_invoice_mock_mode_does_not_call_live_client(monkeypatch):
    plan, execution = create_p0_flow()

    def fail_if_called(_config):
        raise AssertionError("live client should not be created in mock mode")

    monkeypatch.setenv("REQUEST_FINANCE_MODE", "mock")
    monkeypatch.setenv("REQUEST_FINANCE_API_KEY", "fake-key-not-used")
    monkeypatch.setattr(p2_service_module, "create_request_finance_client", fail_if_called)

    response = client.post(
        "/api/request-invoices",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": plan["payments"][0]["id"],
            "auditReportId": execution["auditReportId"],
            "cawRequestId": execution["payments"][0]["cawRequestId"],
            "requestFinanceInvoiceId": "rf_demo_001",
            "requestId": "request_demo_001",
            "status": "draft",
            "hostedUrl": "https://example.invalid/request/rf_demo_001",
            "txHashReference": None,
        },
    )

    assert response.status_code == 200
    assert response.json()["externalReference"]["liveIntegrationEnabled"] is False


def test_request_invoice_live_mode_uses_fake_client_without_mutating_audit_snapshot():
    class FakeRequestFinanceClient:
        def __init__(self):
            self.calls = 0

        def create_invoice(self, request: RequestInvoiceCreate):
            self.calls += 1
            return RequestFinanceInvoiceResult(
                request_finance_invoice_id="rf_live_fake_001",
                request_id="request_live_fake_001",
                status="created",
                hosted_url="https://example.invalid/request/rf_live_fake_001",
                view_url="https://example.invalid/view/rf_live_fake_001",
                pay_url="https://example.invalid/pay/rf_live_fake_001",
            )

        def list_invoices(self, take: int = 1):
            return {"items": [], "take": take}

    plan, execution = create_p0_flow()
    audit_before = client.get(f"/api/audit-report/{execution['auditReportId']}").json()
    fake_client = FakeRequestFinanceClient()
    service = P2ExtensionService(
        store,
        request_finance_config=RequestFinanceConfig(
            mode="live",
            api_key="fake-key",
            allow_invoice_create=True,
        ),
        request_finance_client=fake_client,
    )

    invoice = service.create_request_invoice(
        RequestInvoiceCreate(
            paymentPlanId=plan["paymentPlanId"],
            paymentItemId=plan["payments"][0]["id"],
            auditReportId=execution["auditReportId"],
            cawRequestId=execution["payments"][0]["cawRequestId"],
            requestFinanceInvoiceId="rf_demo_001",
            requestId=None,
            status="draft",
            hostedUrl=None,
            txHashReference=None,
        )
    )

    audit_after = client.get(f"/api/audit-report/{execution['auditReportId']}").json()
    assert fake_client.calls == 1
    assert invoice.requestFinanceInvoiceId == "rf_live_fake_001"
    assert invoice.requestId == "request_live_fake_001"
    assert invoice.status == "created"
    assert invoice.externalReference.metadata["requestFinanceMode"] == "live"
    assert invoice.externalReference.metadata["status"] == "created"
    assert invoice.externalReference.metadata["viewUrl"] == (
        "https://example.invalid/view/rf_live_fake_001"
    )
    assert invoice.externalReference.metadata["payUrl"] == (
        "https://example.invalid/pay/rf_live_fake_001"
    )
    assert audit_after == audit_before


def test_request_invoice_live_mode_without_key_fails_closed(monkeypatch):
    plan, execution = create_p0_flow()

    monkeypatch.setenv("REQUEST_FINANCE_MODE", "live")
    monkeypatch.delenv("REQUEST_FINANCE_API_KEY", raising=False)
    monkeypatch.setenv("REQUEST_FINANCE_ALLOW_INVOICE_CREATE", "true")

    response = client.post(
        "/api/request-invoices",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": plan["payments"][0]["id"],
            "auditReportId": execution["auditReportId"],
            "cawRequestId": execution["payments"][0]["cawRequestId"],
            "requestFinanceInvoiceId": "rf_demo_001",
            "requestId": "request_demo_001",
            "status": "draft",
            "hostedUrl": "https://example.invalid/request/rf_demo_001",
            "txHashReference": None,
        },
    )

    assert response.status_code == 503
    assert response.json()["detail"] == (
        "Request Finance live mode requires REQUEST_FINANCE_API_KEY"
    )


def test_request_invoice_live_readonly_mode_records_demo_safe_invoice_without_live_create(
    monkeypatch,
):
    plan, execution = create_p0_flow()

    def fail_if_called(_config):
        raise AssertionError("live create client should not be created in live-readonly mode")

    monkeypatch.setenv("REQUEST_FINANCE_MODE", "live")
    monkeypatch.setenv("REQUEST_FINANCE_API_KEY", "fake-key")
    monkeypatch.delenv("REQUEST_FINANCE_ALLOW_INVOICE_CREATE", raising=False)
    monkeypatch.setattr(p2_service_module, "create_request_finance_client", fail_if_called)

    response = client.post(
        "/api/request-invoices",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": plan["payments"][0]["id"],
            "auditReportId": execution["auditReportId"],
            "cawRequestId": execution["payments"][0]["cawRequestId"],
            "requestFinanceInvoiceId": "rf_demo_001",
            "requestId": "request_demo_001",
            "status": "draft",
            "hostedUrl": "https://example.invalid/request/rf_demo_001",
            "txHashReference": None,
        },
    )

    assert response.status_code == 200
    invoice = response.json()
    assert invoice["externalReference"]["metadata"]["requestFinanceMode"] == "live-readonly"


def test_request_invoice_live_create_missing_payload_fields_fails_closed(monkeypatch):
    plan, execution = create_p0_flow()

    monkeypatch.setenv("REQUEST_FINANCE_MODE", "live")
    monkeypatch.setenv("REQUEST_FINANCE_API_KEY", "fake-key")
    monkeypatch.setenv("REQUEST_FINANCE_ALLOW_INVOICE_CREATE", "true")

    response = client.post(
        "/api/request-invoices",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": plan["payments"][0]["id"],
            "auditReportId": execution["auditReportId"],
            "cawRequestId": execution["payments"][0]["cawRequestId"],
            "requestFinanceInvoiceId": "rf_demo_001",
            "requestId": "request_demo_001",
            "status": "draft",
            "hostedUrl": "https://example.invalid/request/rf_demo_001",
            "txHashReference": None,
        },
    )

    assert response.status_code == 400
    assert "buyerEmail" in response.json()["detail"]
    assert "paymentAddress" in response.json()["detail"]


def test_request_finance_live_create_payload_mapper_requires_payment_fields():
    request = RequestInvoiceCreate(
        paymentPlanId="plan_demo_001",
        paymentItemId="pay_001",
        requestFinanceInvoiceId="rf_demo_001",
        status="draft",
        buyerEmail="buyer@example.invalid",
        invoiceNumber="AGENTCFO-001",
        invoiceItemName="Contributor payment",
        invoiceCurrency="USD",
        invoiceQuantity=1,
        invoiceUnitPrice=20,
        paymentCurrency="USDC",
        paymentNetwork="sepolia",
        paymentAddress="0xPaymentAddress",
        creationDate="2026-06-10",
        dueDate="2026-06-17",
    )

    payload = build_request_finance_invoice_payload(request)

    assert payload["meta"] == {"format": "rnf_invoice", "version": "0.0.3"}
    assert payload["invoiceNumber"] == "AGENTCFO-001"
    assert payload["buyerInfo"] == {"email": "buyer@example.invalid"}
    assert payload["invoiceItems"] == [
        {
            "currency": "USD",
            "name": "Contributor payment",
            "quantity": 1,
            "unitPrice": 20,
        }
    ]
    assert payload["paymentOptions"] == [
        {
            "type": "wallet",
            "value": {
                "currencies": ["USDC"],
                "paymentInformation": {
                    "paymentAddress": "0xPaymentAddress",
                    "chain": "sepolia",
                },
            },
        }
    ]
    assert payload["creationDate"] == "2026-06-10"
    assert payload["paymentTerms"] == {"dueDate": "2026-06-17"}


def test_request_finance_live_create_uses_fake_transport_without_onchain_conversion():
    captured = {}

    def handler(request: httpx.Request):
        captured["method"] = request.method
        captured["url"] = str(request.url)
        captured["authorization"] = request.headers.get("Authorization")
        captured["payload"] = request.read().decode()
        return httpx.Response(
            200,
            json={
                "id": "rf_live_fake_001",
                "requestId": "request_live_fake_001",
                "status": "created",
                "invoiceLinks": {
                    "view": "https://example.invalid/view/rf_live_fake_001",
                    "pay": "https://example.invalid/pay/rf_live_fake_001",
                },
            },
        )

    request_finance_client = LiveRequestFinanceClient(
        RequestFinanceConfig(
            mode="live",
            api_key="SECRET_CANARY",
            allow_invoice_create=True,
        ),
        http_client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    result = request_finance_client.create_invoice(
        RequestInvoiceCreate(
            paymentPlanId="plan_demo_001",
            paymentItemId="pay_001",
            requestFinanceInvoiceId="rf_demo_001",
            status="draft",
            buyerEmail="buyer@example.invalid",
            invoiceNumber="AGENTCFO-001",
            invoiceItemName="Contributor payment",
            invoiceCurrency="USD",
            invoiceQuantity=1,
            invoiceUnitPrice=20,
            paymentCurrency="USDC",
            paymentNetwork="sepolia",
            paymentAddress="0xPaymentAddress",
            creationDate="2026-06-10",
            dueDate="2026-06-17",
        )
    )

    assert captured["method"] == "POST"
    assert captured["authorization"] == "SECRET_CANARY"
    assert str(captured["url"]).endswith("/invoices")
    assert "/invoices/" not in captured["url"].removesuffix("/invoices")
    assert "Contributor payment" in captured["payload"]
    assert result.request_finance_invoice_id == "rf_live_fake_001"
    assert result.request_id == "request_live_fake_001"
    assert result.status == "created"
    assert result.hosted_url == "https://example.invalid/view/rf_live_fake_001"
    assert result.view_url == "https://example.invalid/view/rf_live_fake_001"
    assert result.pay_url == "https://example.invalid/pay/rf_live_fake_001"


def test_request_finance_live_create_provider_errors_fail_closed_without_secret_leak():
    for status_code in [400, 401, 403]:
        request_finance_client = LiveRequestFinanceClient(
            RequestFinanceConfig(
                mode="live",
                api_key="SECRET_CANARY",
                allow_invoice_create=True,
            ),
            http_client=httpx.Client(
                transport=httpx.MockTransport(
                    lambda _request: httpx.Response(
                        status_code,
                        text="SECRET_CANARY provider body should not leak",
                    )
                )
            ),
        )

        try:
            request_finance_client.create_invoice(
                RequestInvoiceCreate(
                    paymentPlanId="plan_demo_001",
                    paymentItemId="pay_001",
                    requestFinanceInvoiceId="rf_demo_001",
                    status="draft",
                    buyerEmail="buyer@example.invalid",
                    invoiceNumber="AGENTCFO-001",
                    invoiceItemName="Contributor payment",
                    invoiceCurrency="USD",
                    invoiceQuantity=1,
                    invoiceUnitPrice=20,
                    paymentCurrency="USDC",
                    paymentNetwork="sepolia",
                    paymentAddress="0xPaymentAddress",
                    creationDate="2026-06-10",
                    dueDate="2026-06-17",
                )
            )
        except RequestFinanceProviderError as error:
            message = str(error)
        else:
            raise AssertionError("provider error should fail closed")

        assert f"HTTP {status_code}" in message
        assert "SECRET_CANARY" not in message
        assert "provider body" not in message


def test_request_finance_live_create_requires_provider_invoice_id():
    request_finance_client = LiveRequestFinanceClient(
        RequestFinanceConfig(
            mode="live",
            api_key="SECRET_CANARY",
            allow_invoice_create=True,
        ),
        http_client=httpx.Client(
            transport=httpx.MockTransport(
                lambda _request: httpx.Response(200, json={"status": "created"})
            )
        ),
    )

    try:
        request_finance_client.create_invoice(
            RequestInvoiceCreate(
                paymentPlanId="plan_demo_001",
                paymentItemId="pay_001",
                requestFinanceInvoiceId="rf_demo_001",
                status="draft",
                buyerEmail="buyer@example.invalid",
                invoiceNumber="AGENTCFO-001",
                invoiceItemName="Contributor payment",
                invoiceCurrency="USD",
                invoiceQuantity=1,
                invoiceUnitPrice=20,
                paymentCurrency="USDC",
                paymentNetwork="sepolia",
                paymentAddress="0xPaymentAddress",
                creationDate="2026-06-10",
                dueDate="2026-06-17",
            )
        )
    except RequestFinanceProviderError as error:
        message = str(error)
    else:
        raise AssertionError("provider response without id should fail closed")

    assert "missing id" in message
    assert "SECRET_CANARY" not in message


def test_request_finance_live_list_uses_api_key_auth_without_bearer():
    captured = {}

    def handler(request: httpx.Request):
        captured["authorization"] = request.headers.get("Authorization")
        captured["accept"] = request.headers.get("Accept")
        captured["content_type"] = request.headers.get("Content-Type")
        captured["url"] = str(request.url)
        return httpx.Response(200, json={"items": []})

    client_with_transport = httpx.Client(transport=httpx.MockTransport(handler))
    request_finance_client = LiveRequestFinanceClient(
        RequestFinanceConfig(mode="live", api_key="SECRET_CANARY"),
        http_client=client_with_transport,
    )

    result = request_finance_client.list_invoices(take=1, skip=0)

    assert result == {"items": []}
    assert captured["authorization"] == "SECRET_CANARY"
    assert not captured["authorization"].startswith("Bearer ")
    assert captured["accept"] == "application/json"
    assert captured["content_type"] == "application/json"
    assert str(captured["url"]).endswith("/invoices?take=1&skip=0")


def test_request_finance_oauth_bearer_is_explicitly_env_gated_design_path():
    captured = {}

    def handler(request: httpx.Request):
        captured["authorization"] = request.headers.get("Authorization")
        return httpx.Response(200, json={"items": []})

    request_finance_client = LiveRequestFinanceClient(
        RequestFinanceConfig(
            mode="live",
            api_key="SECRET_CANARY",
            auth_scheme="oauth_bearer",
        ),
        http_client=httpx.Client(transport=httpx.MockTransport(handler)),
    )

    request_finance_client.list_invoices()

    assert captured["authorization"] == "Bearer SECRET_CANARY"


def test_request_finance_readonly_provider_errors_fail_closed_without_secret_leak():
    for status_code in [400, 401, 403]:
        request_finance_client = LiveRequestFinanceClient(
            RequestFinanceConfig(mode="live", api_key="SECRET_CANARY"),
            http_client=httpx.Client(
                transport=httpx.MockTransport(
                    lambda _request: httpx.Response(
                        status_code,
                        text="SECRET_CANARY provider body should not leak",
                    )
                )
            ),
        )

        try:
            request_finance_client.list_invoices(take=1, skip=0)
        except RequestFinanceProviderError as error:
            message = str(error)
        else:
            raise AssertionError("provider error should fail closed")

        assert f"HTTP {status_code}" in message
        assert "SECRET_CANARY" not in message
        assert "provider body" not in message


def test_sablier_stream_preview_calculates_rate_without_creating_stream():
    plan, _execution = create_p0_flow()

    response = client.post(
        "/api/sablier-stream-previews",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "paymentItemId": plan["payments"][0]["id"],
            "durationDays": 30,
        },
    )

    assert response.status_code == 200
    preview = response.json()
    assert preview["mode"] == "preview-only"
    assert preview["streamCreated"] is False
    assert preview["externalReferenceId"] == "ext_ref_001"
    assert preview["recipient"] == "Alice"
    assert preview["amount"] == 20
    assert preview["token"] == "USDC"
    assert preview["durationSeconds"] == 30 * 24 * 60 * 60
    assert preview["ratePerSecond"] > 0
    assert "not create a real Sablier stream" in preview["safetyNotes"][0]


def test_safe_reference_multichain_readiness_and_treasury_partition_are_metadata_only():
    plan, _execution = create_p0_flow()

    safe_response = client.post(
        "/api/safe-permission-references",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "safeAddress": "0xSafeDemo",
            "moduleName": "SpendingLimitModule",
            "permissionNotes": ["future owner-threshold approval reference"],
        },
    )
    assert safe_response.status_code == 200
    safe_reference = safe_response.json()
    assert safe_reference["mode"] == "reference-only"
    assert safe_reference["moduleEnabled"] is False
    assert safe_reference["externalReferenceId"] == "ext_ref_001"

    chains = client.get("/api/multichain-readiness")
    assert chains.status_code == 200
    readiness = chains.json()
    assert readiness["currentExecutionBoundary"]["chain"] == "Sepolia"
    assert readiness["liveMultichainExecutionEnabled"] is False
    assert any(chain["status"] == "design-only" for chain in readiness["chains"])

    partition = client.get(f"/api/treasury-budget-partitions/{plan['paymentPlanId']}")
    assert partition.status_code == 200
    view = partition.json()
    assert view["mode"] == "mock-budget-partition"
    assert view["authorizationChanged"] is False
    assert view["totalPlannedAmount"] == 30
    assert {item["departmentAgentId"] for item in view["partitions"]} == {
        "agent-content",
        "agent-community",
    }
