from fastapi.testclient import TestClient

from app.main import app
from app.routers import payments as payments_router
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


def test_registered_business_routes_are_only_p0():
    routes = sorted(route.path for route in app.routes if getattr(route, "include_in_schema", False))

    assert routes == [
        "/api/audit-report/{auditReportId}",
        "/api/execute-payment",
        "/api/payment-plan",
        "/api/risk-check",
    ]


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

    report_response = client.get(f"/api/audit-report/{execution['auditReportId']}")

    assert report_response.status_code == 200
    report = report_response.json()
    assert report["mode"] == "mock"
    assert report["paymentPlan"]["paymentPlanId"] == plan["paymentPlanId"]
    assert report["remainingBudget"] == 20


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


def test_caw_adapter_failure_appears_in_audit_report(monkeypatch):
    def fail_transfer(execution_id, payment):
        raise RuntimeError("mock CAW unavailable")

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
    assert execution["payments"][0]["error"] == "mock CAW unavailable"

    report_response = client.get(f"/api/audit-report/{execution['auditReportId']}")

    assert report_response.status_code == 200
    report = report_response.json()
    assert report["execution"]["payments"][0]["status"] == "Failed"
    assert report["execution"]["payments"][0]["error"] == "mock CAW unavailable"
