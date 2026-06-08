from datetime import UTC, datetime

from app.models import CawStatus
from app.services.caw_read_only_client import CawReadOnlyClient
from app.services.caw_status_normalizer import normalize_transaction_status
from app.store import PaymentRepository

PROVIDER_FAILURE_ERROR = "provider_failed"


class CawReadOnlyObserver:
    def __init__(self, client: CawReadOnlyClient, repository: PaymentRepository):
        self.client = client
        self.repository = repository

    def refresh_caw_status(self, caw_request_id: str) -> CawStatus:
        current_status = self.repository.get_caw_status(caw_request_id)
        if current_status is None:
            raise LookupError("CAW status not found")

        transaction = self.client.get_transaction_by_request_id(caw_request_id)
        refreshed_status = current_status.model_copy(
            update={
                "providerStatus": transaction.providerStatus,
                "normalizedStatus": normalize_transaction_status(transaction.providerStatus),
                "txHash": transaction.txHash,
                "error": PROVIDER_FAILURE_ERROR if transaction.error else None,
                "lastCheckedAt": datetime.now(UTC).isoformat(),
            }
        )
        self.repository.save_caw_status(refreshed_status)
        return refreshed_status
