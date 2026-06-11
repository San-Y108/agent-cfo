import os

from fastapi.testclient import TestClient

os.environ["AGENTCFO_DB_PATH"] = ":memory:"
os.environ["CAW_ADAPTER_MODE"] = "mock"
os.environ["CAW_ENABLE_TRANSFERS"] = "false"

from app.main import app, get_public_caw_mode
from app.routers import payments as payments_router
from app.services.caw_read_only_client import CawTransactionRecord, FakeCawReadOnlyClient
from app.store import store


client = TestClient(app)


def sample_contributions():
    return [
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
    ]


def sample_budget(**overrides):
    budget = {
        "monthlyBudget": 50,
        "singlePaymentLimit": 25,
        "allowedToken": "USDC",
        "whitelist": ["0xAlice", "0xCharlie"],
        "requiresHumanApproval": True,
    }
    budget.update(overrides)
    return budget


def create_plan(contributions=None, budget_rule=None):
    response = client.post(
        "/api/payment-plan",
        json={
            "contributions": contributions or sample_contributions(),
            "budgetRule": budget_rule or sample_budget(),
        },
    )
    assert response.status_code == 200
    return response.json()


def run_risk_check(payment_plan_id, budget_rule=None):
    response = client.post(
        "/api/risk-check",
        json={
            "paymentPlanId": payment_plan_id,
            "budgetRule": budget_rule or sample_budget(),
        },
    )
    assert response.status_code == 200
    return response.json()


def setup_function():
    store.reset()


def test_health_check_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "agent-cfo-backend"}


def test_version_returns_non_sensitive_demo_metadata(monkeypatch):
    monkeypatch.delenv("REQUEST_FINANCE_API_KEY", raising=False)
    monkeypatch.delenv("REQUEST_FINANCE_ALLOW_INVOICE_CREATE", raising=False)

    response = client.get("/version")

    assert response.status_code == 200
    body = response.json()
    assert {
        key: body[key]
        for key in [
            "service",
            "version",
            "apiMode",
            "docsEnabled",
            "openapiEnabled",
            "cawMode",
            "requestFinance",
        ]
    } == {
        "service": "agent-cfo-backend",
        "version": "0.1.0",
        "apiMode": "mock-demo",
        "docsEnabled": False,
        "openapiEnabled": False,
        "cawMode": "mock",
        "requestFinance": {
            "mode": "mock",
            "apiKeyConfigured": False,
            "invoiceCreateGuardEnabled": False,
            "invoiceCreateImplemented": True,
        },
    }
    assert body["p2Capabilities"] == {
        "evidenceTimeline": True,
        "demoScenarioPack": True,
        "riskWhatIf": True,
        "policyGuardrails": True,
        "evidenceExport": True,
        "requestFinancePreflight": True,
        "plannerExplainability": True,
        "requestFinanceLifecycleMock": True,
        "requestFinanceWebhookReplayMockV2": True,
        "sablierPayrollSimulation": True,
        "safeGuardPolicySimulation": True,
        "multiAgentTreasurySimulation": True,
        "demoRunbookContracts": True,
        "openApiLiteContracts": True,
        "liveExternalActionsDefaultEnabled": False,
    }
    assert "AGENTCFO_DB_PATH" not in response.text
    assert "OPENAI_API_KEY" not in response.text
    assert "REQUEST_FINANCE_API_KEY" not in response.text


def test_public_caw_mode_does_not_echo_unknown_env_values(monkeypatch):
    monkeypatch.setenv("CAW_ADAPTER_MODE", "SHOULD_NOT_LEAK_CANARY")

    assert get_public_caw_mode() == "unknown"


def test_public_request_finance_status_does_not_echo_secret(monkeypatch):
    monkeypatch.setenv("REQUEST_FINANCE_MODE", "SHOULD_NOT_LEAK_CANARY")
    monkeypatch.setenv("REQUEST_FINANCE_API_KEY", "SECRET_CANARY")

    response = client.get("/version")

    assert response.status_code == 200
    assert response.json()["requestFinance"]["mode"] == "unknown"
    assert response.json()["requestFinance"]["apiKeyConfigured"] is True
    assert "SECRET_CANARY" not in response.text


def test_cors_preflight_allows_configured_origin():
    response = client.options(
        "/api/payment-plan",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "POST" in response.headers["access-control-allow-methods"]


def test_cors_preflight_rejects_unconfigured_origin():
    response = client.options(
        "/api/payment-plan",
        headers={
            "Origin": "https://not-allowed.example",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert "access-control-allow-origin" not in response.headers


def test_payment_plan_starts_unchecked():
    plan = create_plan()

    assert plan["riskLevel"] == "Unchecked"
    assert plan["totalAmount"] == 30
    assert plan["plannerMode"] == "mock"
    assert plan["plannerWarnings"] == []
    assert [payment["status"] for payment in plan["payments"]] == ["Ready", "Ready"]


def test_payment_plan_schema_validation_rejects_invalid_amount():
    response = client.post(
        "/api/payment-plan",
        json={
            "contributions": [
                {
                    "name": "Alice",
                    "role": "Content Contributor",
                    "task": "Wrote event recap article",
                    "wallet": "0xAlice",
                    "amount": -1,
                    "token": "USDC",
                }
            ],
            "budgetRule": sample_budget(),
        },
    )

    assert response.status_code == 422


def test_registered_business_routes_include_p0_and_caw_status():
    routes = sorted(route.path for route in app.routes if getattr(route, "include_in_schema", False))

    assert {
        "/api/audit-report/{auditReportId}",
        "/api/caw-status/{cawRequestId}",
        "/api/caw-status/{cawRequestId}/refresh",
        "/api/demo-sample",
        "/api/execute-payment",
        "/api/payment-plan",
        "/api/risk-check",
    }.issubset(set(routes))


def test_demo_sample_returns_non_mutating_payment_plan_request():
    response = client.get("/api/demo-sample")

    assert response.status_code == 200
    sample = response.json()
    assert sample["mode"] == "mock-demo"
    assert sample["externalSystemTouched"] is False
    assert sample["paymentPlanRequest"]["budgetRule"]["allowedToken"] == "USDC"
    assert len(sample["paymentPlanRequest"]["contributions"]) == 4
    assert "0xBob" not in sample["paymentPlanRequest"]["budgetRule"]["whitelist"]
    assert store.next_plan_id() == "plan_demo_001"


def test_full_mock_flow_returns_audit_report():
    plan = create_plan()
    risk = run_risk_check(plan["paymentPlanId"])

    assert risk["overallStatus"] == "NeedsApproval"
    assert [payment["status"] for payment in risk["payments"]] == [
        "NeedsApproval",
        "NeedsApproval",
    ]

    execution_response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [payment["id"] for payment in plan["payments"]],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )

    assert execution_response.status_code == 200
    execution = execution_response.json()
    assert execution["mode"] == "mock"
    assert execution["agentWalletAddress"] == "mock-agent-wallet"
    assert execution["payments"][0]["network"] == "mock-testnet"
    assert all(payment["txHash"] is None for payment in execution["payments"])

    status_response = client.get(f"/api/caw-status/{execution['payments'][0]['cawRequestId']}")

    assert status_response.status_code == 200
    caw_status = status_response.json()
    assert caw_status["cawRequestId"] == execution["payments"][0]["cawRequestId"]
    assert caw_status["paymentItemId"] == execution["payments"][0]["paymentItemId"]
    assert caw_status["normalizedStatus"] == "Executed"
    assert caw_status["mode"] == "mock"
    assert caw_status["txHash"] is None
    assert caw_status["error"] is None
    assert caw_status["lastCheckedAt"]

    report_response = client.get(f"/api/audit-report/{execution['auditReportId']}")

    assert report_response.status_code == 200
    report = report_response.json()
    assert report["mode"] == "mock"
    assert report["paymentPlan"]["paymentPlanId"] == plan["paymentPlanId"]
    assert report["remainingBudget"] == 20
    assert report["auditVersion"] == "p0-evidence-v1"
    assert [event["step"] for event in report["decisionTrail"]] == [
        "payment-plan",
        "risk-check",
        "human-approval",
        "caw-execution",
        "audit-snapshot",
    ]
    assert report["humanApprovalEvidence"]["approvedBy"] == "demo-operator"
    assert report["humanApprovalEvidence"]["approvedPaymentIds"] == [
        payment["id"] for payment in plan["payments"]
    ]
    assert report["cawEvidence"][0]["mode"] == "mock"
    assert report["cawEvidence"][0]["txHash"] is None
    assert report["cawEvidence"][0]["txHashExplanation"] == "mock execution does not create a real tx hash"
    assert report["outcomeSummary"]["executedPaymentIds"] == [
        payment["id"] for payment in plan["payments"]
    ]
    assert report["snapshot"]["immutable"] is True


def test_read_only_payment_plan_and_execution_lookup_endpoints():
    plan = create_plan()
    run_risk_check(plan["paymentPlanId"])
    execution_response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"]],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )
    execution = execution_response.json()

    plan_response = client.get(f"/api/payment-plan/{plan['paymentPlanId']}")
    execution_lookup_response = client.get(f"/api/execution/{execution['executionId']}")

    assert plan_response.status_code == 200
    assert plan_response.json()["paymentPlanId"] == plan["paymentPlanId"]
    assert execution_lookup_response.status_code == 200
    assert execution_lookup_response.json()["executionId"] == execution["executionId"]


def test_read_only_lookup_endpoints_return_404_for_missing_records():
    plan_response = client.get("/api/payment-plan/missing_plan")
    execution_response = client.get("/api/execution/missing_execution")

    assert plan_response.status_code == 404
    assert plan_response.json()["detail"] == "Payment plan not found"
    assert execution_response.status_code == 404
    assert execution_response.json()["detail"] == "Execution not found"


def test_non_whitelisted_wallet_is_blocked():
    contributions = sample_contributions() + [
        {
            "name": "Bob",
            "role": "Designer",
            "task": "Designed event poster",
            "wallet": "0xBob",
            "amount": 15,
            "token": "USDC",
        }
    ]
    plan = create_plan(contributions=contributions)
    risk = run_risk_check(plan["paymentPlanId"])

    bob = next(payment for payment in risk["payments"] if payment["recipient"] == "Bob")
    assert bob["status"] == "Blocked"
    assert "Recipient wallet is not in whitelist" in bob["risks"]


def test_single_payment_limit_is_blocked():
    contributions = [
        {
            "name": "Alice",
            "role": "Content Contributor",
            "task": "Wrote event recap article",
            "wallet": "0xAlice",
            "amount": 30,
            "token": "USDC",
        }
    ]
    plan = create_plan(contributions=contributions)
    risk = run_risk_check(plan["paymentPlanId"])

    assert risk["overallStatus"] == "Blocked"
    assert risk["payments"][0]["status"] == "Blocked"
    assert "Payment amount exceeds single payment limit" in risk["payments"][0]["risks"]


def test_monthly_budget_limit_is_blocked():
    plan = create_plan(budget_rule=sample_budget(monthlyBudget=25))
    risk = run_risk_check(plan["paymentPlanId"], budget_rule=sample_budget(monthlyBudget=25))

    assert risk["overallStatus"] == "Blocked"
    assert all(payment["status"] == "Blocked" for payment in risk["payments"])
    assert "Total payment amount exceeds monthly budget" in risk["payments"][0]["risks"]


def test_disallowed_token_is_blocked():
    contributions = [
        {
            "name": "Alice",
            "role": "Content Contributor",
            "task": "Wrote event recap article",
            "wallet": "0xAlice",
            "amount": 20,
            "token": "DAI",
        }
    ]
    plan = create_plan(contributions=contributions)
    risk = run_risk_check(plan["paymentPlanId"])

    assert risk["overallStatus"] == "Blocked"
    assert risk["payments"][0]["status"] == "Blocked"
    assert "Token is not allowed" in risk["payments"][0]["risks"]


def test_duplicate_task_or_wallet_is_detected():
    contributions = [
        {
            "name": "Alice",
            "role": "Content Contributor",
            "task": "Wrote event recap article",
            "wallet": "0xAlice",
            "amount": 10,
            "token": "USDC",
        },
        {
            "name": "Alice Again",
            "role": "Content Contributor",
            "task": "Wrote event recap article",
            "wallet": "0xAlice",
            "amount": 5,
            "token": "USDC",
        },
    ]
    plan = create_plan(contributions=contributions)
    risk = run_risk_check(plan["paymentPlanId"])

    assert risk["overallStatus"] == "Blocked"
    assert "Duplicate recipient wallet" in risk["payments"][0]["risks"]
    assert "Duplicate task" in risk["payments"][0]["risks"]


def test_execute_requires_human_approval():
    plan = create_plan()
    run_risk_check(plan["paymentPlanId"])

    response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"]],
            "humanApproval": {"approved": False, "approvedBy": "demo-operator"},
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Human approval is required before execution"


def test_execute_rejects_empty_approved_payment_ids():
    plan = create_plan()
    run_risk_check(plan["paymentPlanId"])

    response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "At least one payment item must be approved"


def test_execute_rejects_duplicate_approved_payment_ids_without_adapter_call(monkeypatch):
    adapter_calls = {"count": 0}

    def count_transfer(execution_id, payment):
        adapter_calls["count"] += 1
        raise AssertionError("duplicate payment reached CAW adapter")

    monkeypatch.setattr(payments_router.caw_adapter, "create_transfer", count_transfer)
    plan = create_plan()
    run_risk_check(plan["paymentPlanId"])

    response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"], plan["payments"][0]["id"]],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Duplicate approved payment ids are not allowed"
    assert adapter_calls["count"] == 0


def test_execute_requires_risk_check_without_adapter_call(monkeypatch):
    adapter_calls = {"count": 0}

    def count_transfer(execution_id, payment):
        adapter_calls["count"] += 1
        raise AssertionError("payment without risk check reached CAW adapter")

    monkeypatch.setattr(payments_router.caw_adapter, "create_transfer", count_transfer)
    plan = create_plan()

    response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"]],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Risk check is required before execution"
    assert adapter_calls["count"] == 0


def test_execute_rejects_unknown_approved_payment_id_without_adapter_call(monkeypatch):
    adapter_calls = {"count": 0}

    def count_transfer(execution_id, payment):
        adapter_calls["count"] += 1
        raise AssertionError("unknown payment id reached CAW adapter")

    monkeypatch.setattr(payments_router.caw_adapter, "create_transfer", count_transfer)
    plan = create_plan()
    run_risk_check(plan["paymentPlanId"])

    response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": ["pay_missing"],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Payment item not found: pay_missing"
    assert adapter_calls["count"] == 0


def test_caw_status_not_found_returns_404():
    response = client.get("/api/caw-status/missing_caw_request")

    assert response.status_code == 404
    assert response.json()["detail"] == "CAW status not found"


def test_caw_status_refresh_not_found_returns_404():
    response = client.get("/api/caw-status/missing_caw_request/refresh")

    assert response.status_code == 404
    assert response.json()["detail"] == "CAW status not found"


def test_caw_status_response_schema_remains_compatible():
    plan = create_plan()
    run_risk_check(plan["paymentPlanId"])
    execution_response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"]],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )
    execution = execution_response.json()

    response = client.get(f"/api/caw-status/{execution['payments'][0]['cawRequestId']}")

    assert response.status_code == 200
    assert set(response.json()) == {
        "cawRequestId",
        "executionId",
        "paymentItemId",
        "providerStatus",
        "normalizedStatus",
        "mode",
        "network",
        "agentWalletAddress",
        "txHash",
        "error",
        "diagnosticCode",
        "lastCheckedAt",
    }


def test_caw_status_refresh_updates_latest_status_without_mutating_audit(monkeypatch):
    plan = create_plan()
    run_risk_check(plan["paymentPlanId"])
    execution_response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"]],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )
    execution = execution_response.json()
    caw_request_id = execution["payments"][0]["cawRequestId"]
    audit_report_id = execution["auditReportId"]
    before_report = client.get(f"/api/audit-report/{audit_report_id}").json()

    monkeypatch.setattr(
        payments_router,
        "create_caw_read_only_client",
        lambda: FakeCawReadOnlyClient(
            transactions={
                caw_request_id: CawTransactionRecord(
                    requestId=caw_request_id,
                    providerStatus="900",
                    txHash="0xtestnet",
                )
            }
        ),
    )

    refresh_response = client.get(f"/api/caw-status/{caw_request_id}/refresh")
    current_response = client.get(f"/api/caw-status/{caw_request_id}")
    after_report = client.get(f"/api/audit-report/{audit_report_id}").json()

    assert refresh_response.status_code == 200
    refreshed = refresh_response.json()
    assert refreshed["providerStatus"] == "900"
    assert refreshed["normalizedStatus"] == "Executed"
    assert refreshed["txHash"] == "0xtestnet"
    assert current_response.json() == refreshed
    assert after_report == before_report
    assert after_report["cawEvidence"][0]["txHash"] is None


def test_caw_status_refresh_provider_missing_is_safe_404(monkeypatch):
    plan = create_plan()
    run_risk_check(plan["paymentPlanId"])
    execution_response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"]],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )
    caw_request_id = execution_response.json()["payments"][0]["cawRequestId"]
    monkeypatch.setattr(
        payments_router,
        "create_caw_read_only_client",
        lambda: FakeCawReadOnlyClient(),
    )

    response = client.get(f"/api/caw-status/{caw_request_id}/refresh")

    assert response.status_code == 404
    assert response.json()["detail"] == "CAW provider transaction not found"


def test_caw_status_refresh_unknown_status_fails_closed_without_secret_leak(monkeypatch):
    plan = create_plan()
    run_risk_check(plan["paymentPlanId"])
    execution_response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"]],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )
    caw_request_id = execution_response.json()["payments"][0]["cawRequestId"]
    monkeypatch.setattr(
        payments_router,
        "create_caw_read_only_client",
        lambda: FakeCawReadOnlyClient(
            transactions={
                caw_request_id: CawTransactionRecord(
                    requestId=caw_request_id,
                    providerStatus="SHOULD_NOT_LEAK_CANARY",
                    txHash=None,
                )
            }
        ),
    )

    response = client.get(f"/api/caw-status/{caw_request_id}/refresh")

    assert response.status_code == 502
    assert response.json()["detail"] == "Unsupported CAW transaction status"
    assert "SHOULD_NOT_LEAK_CANARY" not in response.text


def test_caw_status_refresh_provider_error_is_safe_502(monkeypatch):
    class BrokenReadOnlyClient:
        def get_transaction_by_request_id(self, request_id):
            raise RuntimeError("SHOULD_NOT_LEAK_CANARY")

    plan = create_plan()
    run_risk_check(plan["paymentPlanId"])
    execution_response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"]],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )
    caw_request_id = execution_response.json()["payments"][0]["cawRequestId"]
    monkeypatch.setattr(
        payments_router,
        "create_caw_read_only_client",
        lambda: BrokenReadOnlyClient(),
    )

    response = client.get(f"/api/caw-status/{caw_request_id}/refresh")

    assert response.status_code == 502
    assert response.json()["detail"] == "CAW status refresh failed"
    assert "SHOULD_NOT_LEAK_CANARY" not in response.text


def test_blocked_payment_is_not_sent_to_mock_caw(monkeypatch):
    adapter_calls = {"count": 0}

    def count_transfer(execution_id, payment):
        adapter_calls["count"] += 1
        raise AssertionError("blocked payment reached CAW adapter")

    monkeypatch.setattr(payments_router.caw_adapter, "create_transfer", count_transfer)
    contributions = [
        {
            "name": "Bob",
            "role": "Designer",
            "task": "Designed event poster",
            "wallet": "0xBob",
            "amount": 15,
            "token": "USDC",
        }
    ]
    plan = create_plan(contributions=contributions)
    run_risk_check(plan["paymentPlanId"])

    response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"]],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Blocked payments cannot be executed"
    assert adapter_calls["count"] == 0


def test_execute_rejects_stale_or_mismatched_risk_snapshot(monkeypatch):
    plan = create_plan()
    risk = run_risk_check(plan["paymentPlanId"])
    tampered_payment = risk["payments"][0].copy()
    tampered_payment["amount"] = tampered_payment["amount"] + 1
    stale_risk = risk.copy()
    stale_risk["payments"] = [tampered_payment, *risk["payments"][1:]]
    store.save_risk_check(payments_router.RiskCheckResult.model_validate(stale_risk))

    response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"]],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Risk check snapshot does not match payment plan"


def test_caw_adapter_failure_appears_in_audit_report(monkeypatch):
    def fail_transfer(execution_id, payment):
        raise RuntimeError("SHOULD_NOT_LEAK_CANARY")

    monkeypatch.setattr(payments_router.caw_adapter, "create_transfer", fail_transfer)
    plan = create_plan()
    run_risk_check(plan["paymentPlanId"])

    execution_response = client.post(
        "/api/execute-payment",
        json={
            "paymentPlanId": plan["paymentPlanId"],
            "approvedPaymentIds": [plan["payments"][0]["id"]],
            "humanApproval": {"approved": True, "approvedBy": "demo-operator"},
        },
    )
    assert execution_response.status_code == 200
    execution = execution_response.json()
    assert execution["payments"][0]["status"] == "Failed"
    assert execution["payments"][0]["mode"] == "mock"
    assert execution["payments"][0]["txHash"] is None
    assert execution["payments"][0]["error"] == "caw_provider_error"
    assert execution["payments"][0]["diagnosticCode"] is None
    assert "SHOULD_NOT_LEAK_CANARY" not in execution_response.text

    status_response = client.get(f"/api/caw-status/{execution['payments'][0]['cawRequestId']}")

    assert status_response.status_code == 200
    caw_status = status_response.json()
    assert caw_status["normalizedStatus"] == "Failed"
    assert caw_status["mode"] == "mock"
    assert caw_status["txHash"] is None
    assert caw_status["error"] == "caw_provider_error"
    assert caw_status["diagnosticCode"] is None
    assert "SHOULD_NOT_LEAK_CANARY" not in status_response.text

    report_response = client.get(f"/api/audit-report/{execution['auditReportId']}")

    assert report_response.status_code == 200
    report = report_response.json()
    assert report["execution"]["payments"][0]["status"] == "Failed"
    assert report["execution"]["payments"][0]["error"] == "caw_provider_error"
    assert report["execution"]["payments"][0]["diagnosticCode"] is None
    assert report["outcomeSummary"]["failedPaymentIds"] == [plan["payments"][0]["id"]]
    assert report["outcomeSummary"]["failedReasons"][plan["payments"][0]["id"]] == "caw_provider_error"
    assert report["cawEvidence"][0]["error"] == "caw_provider_error"
    assert report["cawEvidence"][0]["diagnosticCode"] is None
    assert "SHOULD_NOT_LEAK_CANARY" not in report_response.text
