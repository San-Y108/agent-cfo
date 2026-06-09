from app.models import PaymentStatus


class CawStatusNormalizationError(ValueError):
    pass


PACT_STATUS_MAP = {
    "active": PaymentStatus.READY,
    "pending_approval": PaymentStatus.NEEDS_APPROVAL,
    "completed": PaymentStatus.EXECUTED,
    "rejected": PaymentStatus.BLOCKED,
    "revoked": PaymentStatus.BLOCKED,
    "expired": PaymentStatus.BLOCKED,
    "withdrawn": PaymentStatus.BLOCKED,
}

TRANSACTION_STATUS_MAP = {
    "pending": PaymentStatus.NEEDS_APPROVAL,
    "broadcasting": PaymentStatus.NEEDS_APPROVAL,
    "confirming": PaymentStatus.NEEDS_APPROVAL,
    "completed": PaymentStatus.EXECUTED,
    "failed": PaymentStatus.FAILED,
}

TRANSACTION_STATUS_CODE_MAP = {
    "100": PaymentStatus.NEEDS_APPROVAL,
    "300": PaymentStatus.NEEDS_APPROVAL,
    "400": PaymentStatus.NEEDS_APPROVAL,
    "900": PaymentStatus.EXECUTED,
    "901": PaymentStatus.FAILED,
    "902": PaymentStatus.FAILED,
    "903": PaymentStatus.FAILED,
}


def _normalize_provider_status(provider_status: str) -> str:
    return provider_status.strip().lower()


def normalize_pact_status(provider_status: str) -> PaymentStatus:
    normalized = _normalize_provider_status(provider_status)
    try:
        return PACT_STATUS_MAP[normalized]
    except KeyError as exc:
        raise CawStatusNormalizationError("Unsupported CAW pact status") from exc


def normalize_transaction_status(provider_status: str) -> PaymentStatus:
    normalized = _normalize_provider_status(provider_status)
    if normalized in TRANSACTION_STATUS_CODE_MAP:
        return TRANSACTION_STATUS_CODE_MAP[normalized]
    try:
        return TRANSACTION_STATUS_MAP[normalized]
    except KeyError as exc:
        raise CawStatusNormalizationError(
            "Unsupported CAW transaction status"
        ) from exc
