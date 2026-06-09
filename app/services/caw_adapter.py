import asyncio
import inspect
import os
from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from typing import Callable, Protocol, runtime_checkable

from app.models import PaymentExecutionItem, PaymentItem, PaymentStatus

CAW_POLICY_DENIED_ERROR = "caw_policy_denied"
CAW_PROVIDER_ERROR = "caw_provider_error"
TESTNET_CHAIN_IDS = {"SETH", "TBASE_SETH", "SOLDEV_SOL"}
CAW_STATUS_CODE_MAP = {
    100: PaymentStatus.NEEDS_APPROVAL,
    300: PaymentStatus.NEEDS_APPROVAL,
    400: PaymentStatus.NEEDS_APPROVAL,
    900: PaymentStatus.EXECUTED,
    901: PaymentStatus.FAILED,
    902: PaymentStatus.FAILED,
    903: PaymentStatus.FAILED,
}


@runtime_checkable
class CawAdapter(Protocol):
    mode: str
    network: str
    agent_wallet_address: str

    def create_transfer(self, execution_id: str, payment: PaymentItem) -> PaymentExecutionItem:
        ...

    def failed_transfer(
        self, execution_id: str, payment: PaymentItem, error: str
    ) -> PaymentExecutionItem:
        ...


class MockCawAdapter(CawAdapter):
    mode = "mock"
    network = "mock-testnet"
    agent_wallet_address = "mock-agent-wallet"

    def create_transfer(self, execution_id: str, payment: PaymentItem) -> PaymentExecutionItem:
        return PaymentExecutionItem(
            paymentItemId=payment.id,
            status=PaymentStatus.EXECUTED,
            mode=self.mode,
            network=self.network,
            agentWalletAddress=self.agent_wallet_address,
            txHash=None,
            cawRequestId=f"mock_caw_{execution_id}_{payment.id}",
        )

    def failed_transfer(
        self, execution_id: str, payment: PaymentItem, error: str
    ) -> PaymentExecutionItem:
        return PaymentExecutionItem(
            paymentItemId=payment.id,
            status=PaymentStatus.FAILED,
            mode=self.mode,
            network=self.network,
            agentWalletAddress=self.agent_wallet_address,
            txHash=None,
            cawRequestId=f"mock_caw_{execution_id}_{payment.id}",
            error=error,
        )


@dataclass
class CawAdapterConfig:
    adapter_mode: str = "mock"
    enable_transfers: bool = False
    api_url: str | None = None
    api_key: str | None = None
    wallet_id: str | None = None
    allowed_chain_ids: list[str] = field(default_factory=list)
    allowed_token_ids: list[str] = field(default_factory=list)
    allowed_recipients: list[str] = field(default_factory=list)
    max_amount: Decimal | None = None
    pact_activation_max_polls: int = 3

    def __post_init__(self):
        if self.max_amount is not None and not isinstance(self.max_amount, Decimal):
            self.max_amount = Decimal(str(self.max_amount))

    @classmethod
    def from_env(cls):
        return cls(
            adapter_mode=os.getenv("CAW_ADAPTER_MODE", "mock").strip().lower(),
            enable_transfers=os.getenv("CAW_ENABLE_TRANSFERS", "false").strip().lower()
            == "true",
            api_url=_optional_env("AGENT_WALLET_API_URL"),
            api_key=_optional_env("AGENT_WALLET_API_KEY"),
            wallet_id=_optional_env("AGENT_WALLET_WALLET_ID"),
            allowed_chain_ids=_split_env("CAW_ALLOWED_CHAIN_IDS"),
            allowed_token_ids=_split_env("CAW_ALLOWED_TOKEN_IDS"),
            allowed_recipients=_split_env("CAW_ALLOWED_RECIPIENTS"),
            max_amount=_decimal_env("CAW_MAX_AMOUNT"),
        )


class RealCawAdapter(CawAdapter):
    mode = "real"

    def __init__(
        self,
        config: CawAdapterConfig,
        sdk_client=None,
        sdk_client_factory: Callable[[str, str], object] | None = None,
    ):
        self.config = config
        self._sdk_client = sdk_client
        self._sdk_client_factory = sdk_client_factory
        self.network = config.allowed_chain_ids[0] if len(config.allowed_chain_ids) == 1 else "unknown"
        self.agent_wallet_address = config.wallet_id or "unconfigured-agent-wallet"

    def create_transfer(self, execution_id: str, payment: PaymentItem) -> PaymentExecutionItem:
        request_id = _stable_request_id(execution_id, payment.id)
        guard_error = self._first_guard_error(payment)
        if guard_error is not None:
            return self.failed_transfer_with_request_id(payment, request_id, guard_error)

        try:
            pact = self._activate_pact()
            if pact is None:
                return self.failed_transfer_with_request_id(
                    payment,
                    request_id,
                    "caw_pact_not_active",
                )
            result = self._call_transfer(payment, request_id, pact["api_key"])
        except Exception as exc:
            error = CAW_POLICY_DENIED_ERROR if _is_policy_denied(exc) else CAW_PROVIDER_ERROR
            return self.failed_transfer_with_request_id(payment, request_id, error)

        provider_status = _result_value(result, "status")
        normalized_status = _normalize_caw_status_code(provider_status)
        if normalized_status is None:
            return self.failed_transfer_with_request_id(payment, request_id, "caw_unknown_status")
        if normalized_status != PaymentStatus.EXECUTED:
            return PaymentExecutionItem(
                paymentItemId=payment.id,
                status=normalized_status,
                mode=self.mode,
                network=self.network,
                agentWalletAddress=self.agent_wallet_address,
                txHash=_result_value(result, "transaction_hash"),
                cawRequestId=request_id,
            )

        return PaymentExecutionItem(
            paymentItemId=payment.id,
            status=normalized_status,
            mode=self.mode,
            network=self.network,
            agentWalletAddress=self.agent_wallet_address,
            txHash=_result_value(result, "transaction_hash"),
            cawRequestId=request_id,
        )

    def failed_transfer(
        self, execution_id: str, payment: PaymentItem, error: str
    ) -> PaymentExecutionItem:
        return self.failed_transfer_with_request_id(
            payment,
            _stable_request_id(execution_id, payment.id),
            error,
        )

    def failed_transfer_with_request_id(
        self,
        payment: PaymentItem,
        request_id: str,
        error: str,
    ) -> PaymentExecutionItem:
        return PaymentExecutionItem(
            paymentItemId=payment.id,
            status=PaymentStatus.FAILED,
            mode=self.mode,
            network=self.network,
            agentWalletAddress=self.agent_wallet_address,
            txHash=None,
            cawRequestId=request_id,
            error=error,
        )

    def _first_guard_error(self, payment: PaymentItem) -> str | None:
        if self.config.adapter_mode != "real":
            return "caw_real_mode_required"
        if not self.config.enable_transfers:
            return "caw_transfers_disabled"
        if not self.config.api_url or not self.config.api_key or not self.config.wallet_id:
            return "caw_configuration_error"
        if len(self.config.allowed_chain_ids) != 1:
            return "caw_chain_not_allowed"
        if self.config.allowed_chain_ids[0] not in TESTNET_CHAIN_IDS:
            return "caw_chain_not_allowed"
        if payment.token not in self.config.allowed_token_ids:
            return "caw_token_not_allowed"
        if not self.config.allowed_recipients:
            return "caw_recipient_not_allowed"
        if payment.wallet not in self.config.allowed_recipients:
            return "caw_recipient_not_allowed"
        if self.config.max_amount is None:
            return "caw_amount_limit_required"
        try:
            amount = Decimal(str(payment.amount))
        except InvalidOperation:
            return "caw_amount_not_allowed"
        if amount > self.config.max_amount:
            return "caw_amount_not_allowed"
        return None

    def _activate_pact(self):
        client = self._client(self.config.api_key)
        pact_response = _maybe_await(
            client.submit_pact(
                wallet_id=self.config.wallet_id,
                spec={
                    "policies": [self._transfer_policy()],
                    "completion_conditions": [
                        {"type": "tx_count", "threshold": "1"},
                        {"type": "time_elapsed", "threshold": "3600"},
                    ],
                },
                name="agentcfo-testnet-transfer",
            )
        )
        pact_id = _result_value(pact_response, "pact_id")
        if not pact_id:
            return None

        for _ in range(self.config.pact_activation_max_polls):
            pact = _maybe_await(client.get_pact(pact_id))
            status = _result_value(pact, "status")
            pact_api_key = _result_value(pact, "api_key")
            if status and status.strip().lower() == "active" and pact_api_key:
                return {"pact_id": pact_id, "api_key": pact_api_key}
        return None

    def _transfer_policy(self):
        chain_id = self.config.allowed_chain_ids[0]
        return {
            "name": "agentcfo-testnet-transfer",
            "type": "transfer",
            "rules": {
                "effect": "allow",
                "when": {
                    "chain_in": self.config.allowed_chain_ids,
                    "token_in": [
                        {"chain_id": chain_id, "token_id": token_id}
                        for token_id in self.config.allowed_token_ids
                    ],
                    "destination_address_in": [
                        {"chain_id": chain_id, "address": address}
                        for address in self.config.allowed_recipients
                    ],
                },
                "deny_if": {
                    "amount_gt": _format_amount(self.config.max_amount),
                },
            },
        }

    def _call_transfer(self, payment: PaymentItem, request_id: str, pact_api_key: str):
        client = self._client(pact_api_key)
        result = client.transfer_tokens(
            self.config.wallet_id,
            dst_addr=payment.wallet,
            amount=_format_amount(payment.amount),
            token_id=payment.token,
            chain_id=self.config.allowed_chain_ids[0],
            request_id=request_id,
        )
        if inspect.isawaitable(result):
            return asyncio.run(result)
        return result

    def _client(self, api_key: str):
        if self._sdk_client is not None and api_key == self.config.api_key:
            return self._sdk_client
        if self._sdk_client_factory is not None:
            return self._sdk_client_factory(self.config.api_url, api_key)

        from cobo_agentic_wallet.client import WalletAPIClient

        return WalletAPIClient(
            base_url=self.config.api_url,
            api_key=api_key,
        )


def create_caw_adapter() -> CawAdapter:
    config = CawAdapterConfig.from_env()
    if config.adapter_mode == "real":
        return RealCawAdapter(config=config)
    return MockCawAdapter()


def _optional_env(name: str) -> str | None:
    value = os.getenv(name)
    return value.strip() if value and value.strip() else None


def _split_env(name: str) -> list[str]:
    value = os.getenv(name, "")
    return [item.strip() for item in value.split(",") if item.strip()]


def _decimal_env(name: str) -> Decimal | None:
    value = _optional_env(name)
    if value is None:
        return None
    try:
        return Decimal(value)
    except InvalidOperation:
        return None


def _stable_request_id(execution_id: str, payment_id: str) -> str:
    return f"agentcfo_{execution_id}_{payment_id}"


def _format_amount(amount) -> str:
    return format(Decimal(str(amount)).normalize(), "f")


def _result_value(result, key: str):
    if isinstance(result, dict):
        return result.get(key)
    return getattr(result, key, None)


def _is_policy_denied(exc: Exception) -> bool:
    return exc.__class__.__name__ == "PolicyDeniedError" or hasattr(exc, "denial")


def _maybe_await(result):
    if inspect.isawaitable(result):
        return asyncio.run(result)
    return result


def _normalize_caw_status_code(status_code) -> PaymentStatus | None:
    if status_code is None:
        return PaymentStatus.EXECUTED
    try:
        return CAW_STATUS_CODE_MAP[int(status_code)]
    except (TypeError, ValueError, KeyError):
        return None
