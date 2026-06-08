from app.models import PaymentItem, PaymentStatus
from app.services.caw_adapter import CawAdapter, MockCawAdapter, create_caw_adapter


def sample_payment():
    return PaymentItem(
        id="pay_001",
        recipient="Alice",
        task="Wrote event recap article",
        wallet="0xAlice",
        amount=20,
        token="USDC",
        reason="Completed task: Wrote event recap article",
        status=PaymentStatus.READY,
    )


def test_mock_caw_adapter_create_transfer_contract():
    adapter = MockCawAdapter()
    payment = sample_payment()

    result = adapter.create_transfer("exec_demo_001", payment)

    assert isinstance(adapter, CawAdapter)
    assert result.paymentItemId == payment.id
    assert result.status == PaymentStatus.EXECUTED
    assert result.mode == "mock"
    assert result.network == "mock-testnet"
    assert result.agentWalletAddress == "mock-agent-wallet"
    assert result.txHash is None
    assert result.cawRequestId == "mock_caw_exec_demo_001_pay_001"
    assert result.error is None


def test_mock_caw_adapter_failed_transfer_contract():
    adapter = MockCawAdapter()
    payment = sample_payment()

    result = adapter.failed_transfer("exec_demo_001", payment, "mock CAW unavailable")

    assert isinstance(adapter, CawAdapter)
    assert result.paymentItemId == payment.id
    assert result.status == PaymentStatus.FAILED
    assert result.mode == "mock"
    assert result.network == "mock-testnet"
    assert result.agentWalletAddress == "mock-agent-wallet"
    assert result.txHash is None
    assert result.cawRequestId == "mock_caw_exec_demo_001_pay_001"
    assert result.error == "mock CAW unavailable"


def test_create_caw_adapter_defaults_to_mock_contract():
    adapter = create_caw_adapter()

    assert isinstance(adapter, CawAdapter)
    assert adapter.mode == "mock"
    assert adapter.network == "mock-testnet"
    assert adapter.agent_wallet_address == "mock-agent-wallet"
