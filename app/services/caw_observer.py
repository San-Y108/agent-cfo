from datetime import UTC, datetime

from app.models import CawStatus
from app.services.caw_read_only_client import CawReadOnlyClient
from app.services.caw_status_normalizer import (
    CawStatusNormalizationError,
    normalize_transaction_status,
)
from app.store import PaymentRepository

PROVIDER_FAILURE_ERROR = "provider_failed"


class CawStatusNotFound(LookupError):
    pass


class CawProviderTransactionNotFound(LookupError):
    pass


class CawProviderStatusUnsupported(RuntimeError):
    pass


class CawProviderRefreshError(RuntimeError):
    pass


class CawReadOnlyObserver:
    def __init__(self, client: CawReadOnlyClient, repository: PaymentRepository):
        self.client = client
        self.repository = repository

    def refresh_caw_status(self, caw_request_id: str) -> CawStatus:
        current_status = self.repository.get_caw_status(caw_request_id)
        if current_status is None:
            raise CawStatusNotFound("CAW status not found")

        try:
            transaction = self.client.get_transaction_by_request_id(caw_request_id)
        except Exception as exc:
            if _is_provider_not_found(exc):
                raise CawProviderTransactionNotFound(
                    "CAW provider transaction not found"
                ) from exc
            raise CawProviderRefreshError("CAW status refresh failed") from exc

        try:
            normalized_status = normalize_transaction_status(transaction.providerStatus)
        except CawStatusNormalizationError as exc:
            raise CawProviderStatusUnsupported(
                "Unsupported CAW transaction status"
            ) from exc

        refreshed_status = current_status.model_copy(
            update={
                "providerStatus": transaction.providerStatus,
                "normalizedStatus": normalized_status,
                "txHash": transaction.txHash,
                "error": PROVIDER_FAILURE_ERROR if transaction.error else None,
                "lastCheckedAt": datetime.now(UTC).isoformat(),
            }
        )
        self.repository.save_caw_status(refreshed_status)
        return refreshed_status


def _is_provider_not_found(exc: Exception) -> bool:
    if isinstance(exc, KeyError):
        return True
    status_code = getattr(exc, "status_code", None) or getattr(exc, "status", None)
    if status_code == 404:
        return True
    error_name = exc.__class__.__name__.lower()
    return "notfound" in error_name or "not_found" in error_name
