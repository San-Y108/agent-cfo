import pytest

from app.models import (
    AuditReport,
    CawStatus,
    HumanApproval,
    PaymentExecutionItem,
    PaymentExecutionResult,
    PaymentItem,
    PaymentPlan,
    PaymentStatus,
    RiskCheckResult,
    RiskLevel,
)
from app.services.caw_observer import (
    CawProviderRefreshError,
    CawProviderStatusUnsupported,
    CawProviderTransactionNotFound,
    CawReadOnlyObserver,
)
from app.services.caw_read_only_client import (
    CawReadOnlyConfig,
    CawTransactionRecord,
    CawWalletAddress,
    FakeCawReadOnlyClient,
    MissingCawReadOnlyConfig,
    RealCawReadOnlyClient,
    create_caw_read_only_client,
)
from app.services.caw_status_normalizer import (
    CawStatusNormalizationError,
    normalize_pact_status,
    normalize_transaction_status,
)
from app.store import SQLiteStore


class FakeReadOnlySdkClient:
    def __init__(self):
        self.pacts = {"pact_demo_001": {"status": "active"}}
        self.transactions = {
            "request_demo_001": {
                "request_id": "request_demo_001",
                "status": 900,
                "transaction_hash": "0xtestnet",
            },
            "request_demo_failed": {
                "request_id": "request_demo_failed",
                "status": 901,
                "failed_reason": "SHOULD_NOT_LEAK_CANARY",
            },
        }
        self.audit_logs = [
            {
                "requestId": "request_demo_001",
                "action": "transaction.status.read",
                "api_key": "SHOULD_NOT_LEAK_CANARY",
                "metadata": {"secret": "SHOULD_NOT_LEAK_CANARY"},
            }
        ]
        self.wallet_addresses = [
            {"address": "0xPublicWalletAddress", "chain_id": "SETH", "private_key": "SHOULD_NOT_LEAK_CANARY"}
        ]

    def get_pact(self, pact_id):
        return self.pacts[pact_id]

    def get_user_transaction_by_request_id(self, wallet_uuid, request_id, ext=None):
        assert wallet_uuid == "wallet_test_001"
        assert ext is True
        return self.transactions[request_id]

    def list_user_transactions(self, wallet_uuid=None, status=None, token_id=None, chain_id=None, ext=None):
        assert wallet_uuid == "wallet_test_001"
        assert ext is True
        return {"items": list(self.transactions.values())}

    def list_audit_logs(self, wallet_id=None, action=None, result=None, limit=None):
        assert wallet_id == "wallet_test_001"
        assert limit == 10
        return {"items": self.audit_logs}

    def list_wallet_addresses(self, wallet_uuid):
        assert wallet_uuid == "wallet_test_001"
        return {"items": self.wallet_addresses}


def real_read_only_config(**overrides):
    values = {
        "mode": "real",
        "api_url": "https://caw.example.test",
        "api_key": "agent-credential-placeholder",
        "wallet_id": "wallet_test_001",
    }
    values.update(overrides)
    return CawReadOnlyConfig(**values)


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


def sample_audit_report():
    plan = sample_plan()
    risk = RiskCheckResult(
        paymentPlanId=plan.paymentPlanId,
        overallStatus=PaymentStatus.NEEDS_APPROVAL,
        riskLevel=RiskLevel.LOW,
        remainingBudget=30,
        requiresHumanApproval=True,
        payments=plan.payments,
    )
    execution = sample_execution()
    return AuditReport(
        auditReportId=execution.auditReportId,
        mode="mock",
        paymentPlan=plan,
        riskCheck=risk,
        humanApproval=HumanApproval(approved=True, approvedBy="demo-operator"),
        execution=execution,
        remainingBudget=risk.remainingBudget,
    )


@pytest.mark.parametrize(
    ("provider_status", "expected_status"),
    [
        ("active", PaymentStatus.READY),
        ("rejected", PaymentStatus.BLOCKED),
        ("revoked", PaymentStatus.BLOCKED),
    ],
)
def test_fake_pact_status_normalization_maps_required_states(
    provider_status,
    expected_status,
):
    client = FakeCawReadOnlyClient(pact_statuses={"pact_demo_001": provider_status})

    pact_status = client.get_pact_status("pact_demo_001")

    assert normalize_pact_status(pact_status.providerStatus) == expected_status


def test_transaction_status_normalization_maps_known_states():
    assert normalize_transaction_status("pending") == PaymentStatus.NEEDS_APPROVAL
    assert normalize_transaction_status("broadcasting") == PaymentStatus.NEEDS_APPROVAL
    assert normalize_transaction_status("confirming") == PaymentStatus.NEEDS_APPROVAL
    assert normalize_transaction_status("completed") == PaymentStatus.EXECUTED
    assert normalize_transaction_status("failed") == PaymentStatus.FAILED
    assert normalize_transaction_status("100") == PaymentStatus.NEEDS_APPROVAL
    assert normalize_transaction_status("300") == PaymentStatus.NEEDS_APPROVAL
    assert normalize_transaction_status("400") == PaymentStatus.NEEDS_APPROVAL
    assert normalize_transaction_status("900") == PaymentStatus.EXECUTED
    assert normalize_transaction_status("901") == PaymentStatus.FAILED
    assert normalize_transaction_status("902") == PaymentStatus.FAILED
    assert normalize_transaction_status("903") == PaymentStatus.FAILED


def test_unknown_provider_status_fails_closed():
    try:
        normalize_transaction_status("mystery_status")
    except CawStatusNormalizationError as exc:
        assert "Unsupported CAW transaction status" in str(exc)
        assert "mystery_status" not in str(exc)
    else:
        raise AssertionError("unknown CAW status did not fail closed")


def test_unknown_pact_status_fails_closed_without_echoing_provider_value():
    try:
        normalize_pact_status("SHOULD_NOT_LEAK_CANARY")
    except CawStatusNormalizationError as exc:
        assert "Unsupported CAW pact status" in str(exc)
        assert "SHOULD_NOT_LEAK_CANARY" not in str(exc)
    else:
        raise AssertionError("unknown CAW pact status did not fail closed")


def test_missing_real_caw_config_error_does_not_leak_secret_values():
    secret_canary = "SHOULD_NOT_LEAK_CANARY"
    try:
        create_caw_read_only_client(
            {
                "CAW_READ_ONLY_MODE": "real",
                "AGENT_WALLET_API_KEY": secret_canary,
            }
        )
    except MissingCawReadOnlyConfig as exc:
        message = str(exc)
        assert "CAW read-only real mode is not configured" in message
        assert secret_canary not in message
    else:
        raise AssertionError("real CAW read-only client unexpectedly initialized")


def test_fake_read_only_client_supports_pact_transaction_and_audit_boundaries():
    client = FakeCawReadOnlyClient(
        pact_statuses={"pact_demo_001": "active"},
        transactions={
            "request_demo_001": CawTransactionRecord(
                requestId="request_demo_001",
                providerStatus="completed",
                txHash="0xtestnet",
            )
        },
        audit_logs=[
            {
                "requestId": "request_demo_001",
                "action": "transaction.status.read",
                "result": "ok",
            },
            {
                "requestId": "request_demo_002",
                "action": "transaction.status.read",
                "result": "ok",
            },
        ],
        wallet_addresses=[
            CawWalletAddress(address="0xPublicWalletAddress", chainId="SETH"),
        ],
    )

    assert client.get_pact_status("pact_demo_001").providerStatus == "active"
    assert client.get_transaction_by_request_id("request_demo_001").txHash == "0xtestnet"
    assert client.list_audit_logs({"requestId": "request_demo_001"}) == [
        {
            "requestId": "request_demo_001",
            "action": "transaction.status.read",
            "result": "ok",
        }
    ]
    assert client.list_wallet_addresses() == [
        CawWalletAddress(address="0xPublicWalletAddress", chainId="SETH")
    ]


def test_real_read_only_client_wraps_sdk_transaction_by_request_id():
    client = RealCawReadOnlyClient(
        config=real_read_only_config(),
        sdk_client=FakeReadOnlySdkClient(),
    )

    transaction = client.get_transaction_by_request_id("request_demo_001")

    assert transaction.requestId == "request_demo_001"
    assert normalize_transaction_status(transaction.providerStatus) == PaymentStatus.EXECUTED
    assert transaction.txHash == "0xtestnet"


def test_real_read_only_client_lists_transactions_without_transfer_methods():
    client = RealCawReadOnlyClient(
        config=real_read_only_config(),
        sdk_client=FakeReadOnlySdkClient(),
    )

    transactions = client.list_transactions({"chainId": "SETH"})

    assert [transaction.requestId for transaction in transactions] == [
        "request_demo_001",
        "request_demo_failed",
    ]
    assert not hasattr(client, "transfer_tokens")


def test_real_read_only_client_redacts_audit_logs():
    client = RealCawReadOnlyClient(
        config=real_read_only_config(),
        sdk_client=FakeReadOnlySdkClient(),
    )

    audit_logs = client.list_audit_logs({"limit": "10"})

    assert audit_logs == [
        {
            "requestId": "request_demo_001",
            "action": "transaction.status.read",
            "api_key": "[redacted]",
            "metadata": {"secret": "[redacted]"},
        }
    ]
    assert "SHOULD_NOT_LEAK_CANARY" not in str(audit_logs)


def test_real_read_only_client_wallet_addresses_are_public_only():
    client = RealCawReadOnlyClient(
        config=real_read_only_config(),
        sdk_client=FakeReadOnlySdkClient(),
    )

    addresses = client.list_wallet_addresses()

    assert addresses == [
        CawWalletAddress(address="0xPublicWalletAddress", chainId="SETH")
    ]
    assert "SHOULD_NOT_LEAK_CANARY" not in str(addresses)


def test_create_real_read_only_client_uses_caw_adapter_mode_when_explicit():
    client = create_caw_read_only_client(
        {
            "CAW_ADAPTER_MODE": "real",
            "AGENT_WALLET_API_URL": "https://caw.example.test",
            "AGENT_WALLET_API_KEY": "agent-credential-placeholder",
            "AGENT_WALLET_WALLET_ID": "wallet_test_001",
        }
    )

    assert isinstance(client, RealCawReadOnlyClient)


@pytest.mark.parametrize(
    ("provider_status", "expected_status", "tx_hash", "provider_error"),
    [
        ("pending", PaymentStatus.NEEDS_APPROVAL, None, None),
        ("broadcasting", PaymentStatus.NEEDS_APPROVAL, None, None),
        ("confirming", PaymentStatus.NEEDS_APPROVAL, None, None),
        ("completed", PaymentStatus.EXECUTED, "0xtestnet", None),
        ("failed", PaymentStatus.FAILED, None, "SHOULD_NOT_LEAK_CANARY"),
    ],
)
def test_observer_refresh_maps_transaction_statuses_without_raw_error_leak(
    tmp_path,
    provider_status,
    expected_status,
    tx_hash,
    provider_error,
):
    repository = SQLiteStore(str(tmp_path / "agentcfo.sqlite3"))
    original_status = CawStatus.from_execution_item(
        sample_execution().executionId,
        sample_execution().payments[0],
    )
    client = FakeCawReadOnlyClient(
        transactions={
            original_status.cawRequestId: CawTransactionRecord(
                requestId=original_status.cawRequestId,
                providerStatus=provider_status,
                txHash=tx_hash,
                error=provider_error,
            )
        }
    )
    observer = CawReadOnlyObserver(client, repository)

    repository.save_caw_status(original_status)
    refreshed_status = observer.refresh_caw_status(original_status.cawRequestId)
    saved_status = repository.get_caw_status(original_status.cawRequestId)

    assert refreshed_status.normalizedStatus == expected_status
    assert refreshed_status.txHash == tx_hash
    assert refreshed_status.error == ("provider_failed" if provider_error else None)
    assert "SHOULD_NOT_LEAK_CANARY" not in refreshed_status.model_dump_json()
    assert saved_status == refreshed_status


def test_observer_refresh_does_not_rewrite_audit_report(tmp_path):
    repository = SQLiteStore(str(tmp_path / "agentcfo.sqlite3"))
    audit_report = sample_audit_report()
    original_status = CawStatus.from_execution_item(
        audit_report.execution.executionId,
        audit_report.execution.payments[0],
    )
    client = FakeCawReadOnlyClient(
        transactions={
            original_status.cawRequestId: CawTransactionRecord(
                requestId=original_status.cawRequestId,
                providerStatus="failed",
                txHash=None,
                error="provider reported failure",
            )
        }
    )
    observer = CawReadOnlyObserver(client, repository)

    repository.save_audit_report(audit_report)
    repository.save_caw_status(original_status)
    refreshed_status = observer.refresh_caw_status(original_status.cawRequestId)

    saved_report = repository.get_audit_report(audit_report.auditReportId)
    saved_status = repository.get_caw_status(original_status.cawRequestId)

    assert refreshed_status.normalizedStatus == PaymentStatus.FAILED
    assert refreshed_status.error == "provider_failed"
    assert saved_status == refreshed_status
    assert saved_report == audit_report
    assert saved_report.execution.payments[0].status == PaymentStatus.EXECUTED


def test_observer_refresh_maps_status_code_900_and_stores_tx_hash(tmp_path):
    repository = SQLiteStore(str(tmp_path / "agentcfo.sqlite3"))
    original_status = CawStatus.from_execution_item(
        sample_execution().executionId,
        sample_execution().payments[0],
    )
    client = FakeCawReadOnlyClient(
        transactions={
            original_status.cawRequestId: CawTransactionRecord(
                requestId=original_status.cawRequestId,
                providerStatus="900",
                txHash="0xtestnet",
            )
        }
    )
    observer = CawReadOnlyObserver(client, repository)

    repository.save_caw_status(original_status)
    refreshed_status = observer.refresh_caw_status(original_status.cawRequestId)
    saved_report = repository.get_audit_report(sample_execution().auditReportId)

    assert refreshed_status.providerStatus == "900"
    assert refreshed_status.normalizedStatus == PaymentStatus.EXECUTED
    assert refreshed_status.txHash == "0xtestnet"
    assert repository.get_caw_status(original_status.cawRequestId) == refreshed_status
    assert saved_report is None


def test_observer_refresh_provider_not_found_is_safe_public_error(tmp_path):
    repository = SQLiteStore(str(tmp_path / "agentcfo.sqlite3"))
    original_status = CawStatus.from_execution_item(
        sample_execution().executionId,
        sample_execution().payments[0],
    )
    observer = CawReadOnlyObserver(FakeCawReadOnlyClient(), repository)

    repository.save_caw_status(original_status)

    with pytest.raises(CawProviderTransactionNotFound) as exc_info:
        observer.refresh_caw_status(original_status.cawRequestId)

    assert str(exc_info.value) == "CAW provider transaction not found"


def test_observer_refresh_provider_error_is_safe_public_error(tmp_path):
    class BrokenReadOnlyClient(FakeCawReadOnlyClient):
        def get_transaction_by_request_id(self, request_id):
            raise RuntimeError("SHOULD_NOT_LEAK_CANARY")

    repository = SQLiteStore(str(tmp_path / "agentcfo.sqlite3"))
    original_status = CawStatus.from_execution_item(
        sample_execution().executionId,
        sample_execution().payments[0],
    )
    observer = CawReadOnlyObserver(BrokenReadOnlyClient(), repository)

    repository.save_caw_status(original_status)

    with pytest.raises(CawProviderRefreshError) as exc_info:
        observer.refresh_caw_status(original_status.cawRequestId)

    assert str(exc_info.value) == "CAW status refresh failed"
    assert "SHOULD_NOT_LEAK_CANARY" not in str(exc_info.value)


def test_observer_refresh_unknown_provider_status_fails_closed(tmp_path):
    repository = SQLiteStore(str(tmp_path / "agentcfo.sqlite3"))
    original_status = CawStatus.from_execution_item(
        sample_execution().executionId,
        sample_execution().payments[0],
    )
    client = FakeCawReadOnlyClient(
        transactions={
            original_status.cawRequestId: CawTransactionRecord(
                requestId=original_status.cawRequestId,
                providerStatus="SHOULD_NOT_LEAK_CANARY",
                txHash=None,
            )
        }
    )
    observer = CawReadOnlyObserver(client, repository)

    repository.save_caw_status(original_status)

    with pytest.raises(CawProviderStatusUnsupported) as exc_info:
        observer.refresh_caw_status(original_status.cawRequestId)

    assert str(exc_info.value) == "Unsupported CAW transaction status"
    assert "SHOULD_NOT_LEAK_CANARY" not in str(exc_info.value)
