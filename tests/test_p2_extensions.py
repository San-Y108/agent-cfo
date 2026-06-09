import os

from fastapi.testclient import TestClient

os.environ["AGENTCFO_DB_PATH"] = ":memory:"
os.environ["CAW_ADAPTER_MODE"] = "mock"
os.environ["CAW_ENABLE_TRANSFERS"] = "false"

from app.main import app
from app.store import store


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

    lookup = client.get(f"/api/request-invoices/{invoice['externalReferenceId']}")
    assert lookup.status_code == 200
    assert lookup.json() == invoice


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
