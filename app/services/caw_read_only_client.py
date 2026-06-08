from typing import Any, Mapping, Protocol, runtime_checkable

from pydantic import BaseModel


class MissingCawReadOnlyConfig(RuntimeError):
    pass


class CawPactStatus(BaseModel):
    pactId: str
    providerStatus: str


class CawTransactionRecord(BaseModel):
    requestId: str
    providerStatus: str
    txHash: str | None = None
    error: str | None = None


@runtime_checkable
class CawReadOnlyClient(Protocol):
    def get_pact_status(self, pact_id: str) -> CawPactStatus:
        ...

    def get_transaction_by_request_id(self, request_id: str) -> CawTransactionRecord:
        ...

    def list_audit_logs(self, filters: Mapping[str, str]) -> list[dict[str, Any]]:
        ...


class FakeCawReadOnlyClient(CawReadOnlyClient):
    def __init__(
        self,
        pact_statuses: Mapping[str, str] | None = None,
        transactions: Mapping[str, CawTransactionRecord] | None = None,
        audit_logs: list[dict[str, Any]] | None = None,
    ):
        self.pact_statuses = dict(pact_statuses or {})
        self.transactions = dict(transactions or {})
        self.audit_logs = list(audit_logs or [])

    def get_pact_status(self, pact_id: str) -> CawPactStatus:
        return CawPactStatus(
            pactId=pact_id,
            providerStatus=self.pact_statuses[pact_id],
        )

    def get_transaction_by_request_id(self, request_id: str) -> CawTransactionRecord:
        return self.transactions[request_id]

    def list_audit_logs(self, filters: Mapping[str, str]) -> list[dict[str, Any]]:
        if not filters:
            return self.audit_logs
        return [
            audit_log
            for audit_log in self.audit_logs
            if all(audit_log.get(key) == value for key, value in filters.items())
        ]


def create_caw_read_only_client(
    config: Mapping[str, str] | None = None,
) -> CawReadOnlyClient:
    mode = (config or {}).get("CAW_READ_ONLY_MODE", "fake").strip().lower()
    if mode in {"fake", "mock"}:
        return FakeCawReadOnlyClient()
    raise MissingCawReadOnlyConfig(
        "CAW read-only real mode is not configured. "
        "Official CAW SDK/auth/wallet/pact/status details are required."
    )
