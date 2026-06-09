from app.models import PaymentItem, PaymentStatus
from app.services.caw_adapter import (
    CawAdapter,
    CawAdapterConfig,
    MockCawAdapter,
    RealCawAdapter,
    create_caw_adapter,
)


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


class FakeCawSdkClient:
    def __init__(
        self,
        api_key="agent-credential-placeholder",
        pact=None,
        transfer_response=None,
        transfer_error=None,
    ):
        self.api_key = api_key
        self.pact = pact or {
            "pact_id": "pact_test_001",
            "status": "active",
            "api_key": "pact-credential-placeholder",
        }
        self.transfer_response = transfer_response or {
            "request_id": "agentcfo_exec_demo_001_pay_001",
            "transaction_hash": "0xrealtestnet",
            "status": 900,
        }
        self.transfer_error = transfer_error
        self.submit_pact_calls = []
        self.get_pact_calls = []
        self.transfer_calls = []

    def submit_pact(
        self,
        wallet_id=None,
        intent=None,
        original_intent=None,
        spec=None,
        name=None,
        recipe_slugs=None,
    ):
        self.submit_pact_calls.append(
            {
                "wallet_id": wallet_id,
                "intent": intent,
                "original_intent": original_intent,
                "spec": spec,
                "name": name,
                "recipe_slugs": recipe_slugs,
            }
        )
        return {"pact_id": self.pact["pact_id"]}

    def get_pact(self, pact_id):
        self.get_pact_calls.append(pact_id)
        return self.pact

    def transfer_tokens(
        self,
        wallet_uuid,
        *,
        dst_addr=None,
        amount=None,
        token_id="SETH",
        chain_id=None,
        request_id=None,
        fee=None,
        src_addr=None,
        sponsor=None,
        gas_provider=None,
        description=None,
    ):
        self.transfer_calls.append(
            {
                "wallet_uuid": wallet_uuid,
                "dst_addr": dst_addr,
                "amount": amount,
                "token_id": token_id,
                "chain_id": chain_id,
                "request_id": request_id,
                "fee": fee,
                "src_addr": src_addr,
                "sponsor": sponsor,
                "gas_provider": gas_provider,
                "description": description,
            }
        )
        if self.transfer_error is not None:
            raise self.transfer_error
        return self.transfer_response


class FakeCawSdkFactory:
    def __init__(self, pact=None, transfer_response=None, transfer_error=None):
        self.pact = pact
        self.transfer_response = transfer_response
        self.transfer_error = transfer_error
        self.clients = []

    def __call__(self, base_url, api_key):
        client = FakeCawSdkClient(
            api_key=api_key,
            pact=self.pact,
            transfer_response=self.transfer_response,
            transfer_error=self.transfer_error,
        )
        self.clients.append(client)
        return client


class FakePolicyDeniedError(Exception):
    def __init__(self):
        super().__init__("SHOULD_NOT_LEAK_CANARY")
        self.denial = type(
            "Denial",
            (),
            {
                "code": "TRANSFER_LIMIT_EXCEEDED",
                "reason": "SHOULD_NOT_LEAK_CANARY",
                "details": {"api_key": "SHOULD_NOT_LEAK_CANARY"},
            },
        )()


def real_config(**overrides):
    values = {
        "adapter_mode": "real",
        "enable_transfers": True,
        "api_url": "https://caw.example.test",
        "api_key": "agent-credential-placeholder",
        "wallet_id": "wallet_test_001",
        "allowed_chain_ids": ["SETH"],
        "allowed_token_ids": ["SETH"],
        "allowed_recipients": ["0xAlice"],
        "max_amount": "0.001",
    }
    values.update(overrides)
    return CawAdapterConfig(**values)


def sample_real_payment(**overrides):
    values = {
        "id": "pay_001",
        "recipient": "Alice",
        "task": "Wrote event recap article",
        "wallet": "0xAlice",
        "amount": 0.001,
        "token": "SETH",
        "reason": "Completed task: Wrote event recap article",
        "status": PaymentStatus.READY,
    }
    values.update(overrides)
    return PaymentItem(**values)


def test_caw_config_from_env_defaults_to_mock(monkeypatch):
    for name in [
        "CAW_ADAPTER_MODE",
        "CAW_ENABLE_TRANSFERS",
        "AGENT_WALLET_API_URL",
        "AGENT_WALLET_API_KEY",
        "AGENT_WALLET_WALLET_ID",
        "CAW_ALLOWED_CHAIN_IDS",
        "CAW_ALLOWED_TOKEN_IDS",
        "CAW_ALLOWED_RECIPIENTS",
        "CAW_MAX_AMOUNT",
    ]:
        monkeypatch.delenv(name, raising=False)

    config = CawAdapterConfig.from_env()

    assert config.adapter_mode == "mock"
    assert config.enable_transfers is False
    assert isinstance(create_caw_adapter(), MockCawAdapter)


def test_caw_config_from_env_parses_real_mode_allowlists(monkeypatch):
    monkeypatch.setenv("CAW_ADAPTER_MODE", "real")
    monkeypatch.setenv("CAW_ENABLE_TRANSFERS", "true")
    monkeypatch.setenv("AGENT_WALLET_API_URL", "https://caw.example.test")
    monkeypatch.setenv("AGENT_WALLET_API_KEY", "agent-credential-placeholder")
    monkeypatch.setenv("AGENT_WALLET_WALLET_ID", "wallet_test_001")
    monkeypatch.setenv("CAW_ALLOWED_CHAIN_IDS", "SETH")
    monkeypatch.setenv("CAW_ALLOWED_TOKEN_IDS", "SETH")
    monkeypatch.setenv("CAW_ALLOWED_RECIPIENTS", "0xAlice, 0xCharlie")
    monkeypatch.setenv("CAW_MAX_AMOUNT", "0.001")

    config = CawAdapterConfig.from_env()
    adapter = create_caw_adapter()

    assert config.adapter_mode == "real"
    assert config.enable_transfers is True
    assert config.api_url == "https://caw.example.test"
    assert config.api_key is not None
    assert config.wallet_id == "wallet_test_001"
    assert config.allowed_chain_ids == ["SETH"]
    assert config.allowed_token_ids == ["SETH"]
    assert config.allowed_recipients == ["0xAlice", "0xCharlie"]
    assert str(config.max_amount) == "0.001"
    assert isinstance(adapter, RealCawAdapter)


def test_real_caw_adapter_fails_closed_when_transfers_disabled():
    factory = FakeCawSdkFactory()
    adapter = RealCawAdapter(
        config=real_config(enable_transfers=False),
        sdk_client_factory=factory,
    )

    result = adapter.create_transfer("exec_demo_001", sample_real_payment())

    assert result.status == PaymentStatus.FAILED
    assert result.error == "caw_transfers_disabled"
    assert result.txHash is None
    assert factory.clients == []


def test_real_caw_adapter_fails_closed_when_required_config_is_missing():
    factory = FakeCawSdkFactory()
    adapter = RealCawAdapter(
        config=real_config(api_key=None),
        sdk_client_factory=factory,
    )

    result = adapter.create_transfer("exec_demo_001", sample_real_payment())

    assert result.status == PaymentStatus.FAILED
    assert result.error == "caw_configuration_error"
    assert result.txHash is None
    assert factory.clients == []


def test_real_caw_adapter_fails_closed_when_chain_is_not_testnet():
    factory = FakeCawSdkFactory()
    adapter = RealCawAdapter(
        config=real_config(allowed_chain_ids=["ETH"]),
        sdk_client_factory=factory,
    )

    result = adapter.create_transfer("exec_demo_001", sample_real_payment())

    assert result.status == PaymentStatus.FAILED
    assert result.error == "caw_chain_not_allowed"
    assert result.txHash is None
    assert factory.clients == []


def test_real_caw_adapter_fails_closed_when_token_is_not_allowed():
    factory = FakeCawSdkFactory()
    adapter = RealCawAdapter(
        config=real_config(allowed_token_ids=["OTHER_TEST_TOKEN"]),
        sdk_client_factory=factory,
    )

    result = adapter.create_transfer("exec_demo_001", sample_real_payment())

    assert result.status == PaymentStatus.FAILED
    assert result.error == "caw_token_not_allowed"
    assert result.txHash is None
    assert factory.clients == []


def test_real_caw_adapter_fails_closed_when_recipient_is_not_allowed():
    factory = FakeCawSdkFactory()
    adapter = RealCawAdapter(
        config=real_config(allowed_recipients=["0xSomeoneElse"]),
        sdk_client_factory=factory,
    )

    result = adapter.create_transfer("exec_demo_001", sample_real_payment())

    assert result.status == PaymentStatus.FAILED
    assert result.error == "caw_recipient_not_allowed"
    assert result.txHash is None
    assert factory.clients == []


def test_real_caw_adapter_fails_closed_when_amount_exceeds_limit():
    factory = FakeCawSdkFactory()
    adapter = RealCawAdapter(
        config=real_config(max_amount="0.0001"),
        sdk_client_factory=factory,
    )

    result = adapter.create_transfer("exec_demo_001", sample_real_payment())

    assert result.status == PaymentStatus.FAILED
    assert result.error == "caw_amount_not_allowed"
    assert result.txHash is None
    assert factory.clients == []


def test_real_caw_adapter_fails_closed_without_active_pact():
    factory = FakeCawSdkFactory(pact={"pact_id": "pact_test_001", "status": "pending_approval"})
    adapter = RealCawAdapter(
        config=real_config(),
        sdk_client_factory=factory,
    )

    result = adapter.create_transfer("exec_demo_001", sample_real_payment())

    assert result.status == PaymentStatus.FAILED
    assert result.error == "caw_pact_not_active"
    assert result.txHash is None
    assert len(factory.clients) == 1
    assert factory.clients[0].transfer_calls == []


def test_real_caw_adapter_submits_pact_and_uses_pact_scoped_key_for_transfer():
    factory = FakeCawSdkFactory(
        transfer_response={
            "request_id": "agentcfo_exec_demo_001_pay_001",
            "transaction_hash": "0xrealtestnet",
            "status": 900,
        }
    )
    adapter = RealCawAdapter(
        config=real_config(),
        sdk_client_factory=factory,
    )

    result = adapter.create_transfer("exec_demo_001", sample_real_payment())

    assert result.status == PaymentStatus.EXECUTED
    assert result.mode == "real"
    assert result.network == "SETH"
    assert result.agentWalletAddress == "wallet_test_001"
    assert result.cawRequestId == "agentcfo_exec_demo_001_pay_001"
    assert result.txHash == "0xrealtestnet"
    assert result.error is None
    agent_client, pact_client = factory.clients
    assert agent_client.api_key == "agent-credential-placeholder"
    assert pact_client.api_key == "pact-credential-placeholder"
    assert agent_client.submit_pact_calls[0]["wallet_id"] == "wallet_test_001"
    spec = agent_client.submit_pact_calls[0]["spec"]
    policy = spec["policies"][0]
    assert policy["type"] == "transfer"
    assert policy["rules"]["when"]["chain_in"] == ["SETH"]
    assert policy["rules"]["when"]["token_in"] == [{"chain_id": "SETH", "token_id": "SETH"}]
    assert policy["rules"]["when"]["destination_address_in"] == [
        {"chain_id": "SETH", "address": "0xAlice"}
    ]
    assert policy["rules"]["deny_if"]["amount_gt"] == "0.001"
    assert spec["completion_conditions"] == [
        {"type": "tx_count", "threshold": "1"},
        {"type": "time_elapsed", "threshold": "3600"},
    ]
    assert pact_client.transfer_calls == [
        {
            "wallet_uuid": "wallet_test_001",
            "dst_addr": "0xAlice",
            "amount": "0.001",
            "token_id": "SETH",
            "chain_id": "SETH",
            "request_id": "agentcfo_exec_demo_001_pay_001",
            "fee": None,
            "src_addr": None,
            "sponsor": None,
            "gas_provider": None,
            "description": None,
        }
    ]


def test_real_caw_adapter_keeps_tx_hash_null_when_caw_does_not_return_hash():
    factory = FakeCawSdkFactory(
        transfer_response={
            "request_id": "agentcfo_exec_demo_001_pay_001",
            "transaction_hash": None,
            "status": 900,
        }
    )
    adapter = RealCawAdapter(
        config=real_config(),
        sdk_client_factory=factory,
    )

    result = adapter.create_transfer("exec_demo_001", sample_real_payment())

    assert result.status == PaymentStatus.EXECUTED
    assert result.txHash is None


def test_real_caw_adapter_maps_known_caw_status_codes_to_safe_statuses():
    cases = [
        (100, PaymentStatus.NEEDS_APPROVAL),
        (300, PaymentStatus.NEEDS_APPROVAL),
        (400, PaymentStatus.NEEDS_APPROVAL),
        (901, PaymentStatus.FAILED),
        (902, PaymentStatus.FAILED),
        (903, PaymentStatus.FAILED),
    ]
    for status_code, expected_status in cases:
        factory = FakeCawSdkFactory(
            transfer_response={
                "request_id": "agentcfo_exec_demo_001_pay_001",
                "transaction_hash": None,
                "status": status_code,
            }
        )
        adapter = RealCawAdapter(
            config=real_config(),
            sdk_client_factory=factory,
        )

        result = adapter.create_transfer("exec_demo_001", sample_real_payment())

        assert result.status == expected_status
        assert result.txHash is None


def test_real_caw_adapter_policy_denied_error_is_redacted():
    factory = FakeCawSdkFactory(transfer_error=FakePolicyDeniedError())
    adapter = RealCawAdapter(
        config=real_config(),
        sdk_client_factory=factory,
    )

    result = adapter.create_transfer("exec_demo_001", sample_real_payment())

    assert result.status == PaymentStatus.FAILED
    assert result.error == "caw_policy_denied"
    assert result.txHash is None
    assert "SHOULD_NOT_LEAK_CANARY" not in result.model_dump_json()


def test_real_caw_adapter_unknown_provider_status_fails_closed():
    factory = FakeCawSdkFactory(
        transfer_response={
            "request_id": "agentcfo_exec_demo_001_pay_001",
            "transaction_hash": None,
            "status": 777,
        }
    )
    adapter = RealCawAdapter(
        config=real_config(),
        sdk_client_factory=factory,
    )

    result = adapter.create_transfer("exec_demo_001", sample_real_payment())

    assert result.status == PaymentStatus.FAILED
    assert result.error == "caw_unknown_status"
    assert result.txHash is None
