import os
from dataclasses import dataclass
from typing import Protocol
from urllib.parse import urljoin

import httpx

from app.models import RequestInvoiceCreate

DEFAULT_REQUEST_FINANCE_API_BASE_URL = "https://api.request.finance/"


class RequestFinanceConfigurationError(Exception):
    pass


class RequestFinanceLiveActionNotApproved(Exception):
    pass


class RequestFinanceProviderError(Exception):
    pass


class RequestFinanceValidationError(Exception):
    pass


@dataclass(frozen=True)
class RequestFinanceConfig:
    mode: str = "mock"
    api_base_url: str = DEFAULT_REQUEST_FINANCE_API_BASE_URL
    api_key: str | None = None
    auth_scheme: str = "api_key"
    allow_invoice_create: bool = False

    @classmethod
    def from_env(cls):
        mode = os.getenv("REQUEST_FINANCE_MODE", "mock").strip().lower()
        api_base_url = os.getenv(
            "REQUEST_FINANCE_API_BASE_URL",
            DEFAULT_REQUEST_FINANCE_API_BASE_URL,
        ).strip()
        api_key = os.getenv("REQUEST_FINANCE_API_KEY")
        auth_scheme = os.getenv("REQUEST_FINANCE_AUTH_SCHEME", "api_key").strip().lower()
        allow_invoice_create = (
            os.getenv("REQUEST_FINANCE_ALLOW_INVOICE_CREATE", "false").strip().lower()
            == "true"
        )
        return cls(
            mode=mode,
            api_base_url=api_base_url,
            api_key=api_key,
            auth_scheme=auth_scheme,
            allow_invoice_create=allow_invoice_create,
        )

    @property
    def public_mode(self):
        return self.mode if self.mode in {"mock", "live"} else "unknown"

    @property
    def api_key_configured(self):
        return bool(self.api_key)

    def require_live_config(self):
        if self.mode != "live":
            return
        if self.auth_scheme not in {"api_key", "oauth_bearer"}:
            raise RequestFinanceConfigurationError(
                "REQUEST_FINANCE_AUTH_SCHEME must be api_key or oauth_bearer"
            )
        if not self.api_base_url:
            raise RequestFinanceConfigurationError(
                "Request Finance live mode requires REQUEST_FINANCE_API_BASE_URL"
            )
        if not self.api_key:
            raise RequestFinanceConfigurationError(
                "Request Finance live mode requires REQUEST_FINANCE_API_KEY"
            )

    def require_invoice_create_approval(self):
        if not self.allow_invoice_create:
            raise RequestFinanceLiveActionNotApproved(
                "Live Request Finance invoice creation is disabled; explicit approval is required"
            )


@dataclass(frozen=True)
class RequestFinanceInvoiceResult:
    request_finance_invoice_id: str
    request_id: str | None
    status: str
    hosted_url: str | None
    view_url: str | None = None
    pay_url: str | None = None


class RequestFinanceClient(Protocol):
    def create_invoice(self, request: RequestInvoiceCreate) -> RequestFinanceInvoiceResult: ...
    def list_invoices(self, take: int = 1, skip: int = 0) -> dict: ...


class MockRequestFinanceClient:
    def create_invoice(self, request: RequestInvoiceCreate):
        return RequestFinanceInvoiceResult(
            request_finance_invoice_id=request.requestFinanceInvoiceId,
            request_id=request.requestId,
            status=request.status,
            hosted_url=request.hostedUrl,
        )

    def list_invoices(self, take: int = 1, skip: int = 0):
        return {"mode": "mock", "take": take, "skip": skip, "items": []}


class LiveRequestFinanceClient:
    def __init__(self, config: RequestFinanceConfig, http_client: httpx.Client | None = None):
        config.require_live_config()
        self.config = config
        self.http_client = http_client or httpx.Client(timeout=10)

    def create_invoice(self, request: RequestInvoiceCreate):
        self.config.require_invoice_create_approval()
        endpoint = urljoin(self.config.api_base_url.rstrip("/") + "/", "invoices")
        payload = build_request_finance_invoice_payload(request)
        try:
            response = self.http_client.post(
                endpoint,
                json=payload,
                headers=self._headers(),
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as error:
            raise RequestFinanceProviderError(
                f"Request Finance invoice create failed with HTTP {error.response.status_code}"
            ) from error
        except httpx.HTTPError as error:
            raise RequestFinanceProviderError(
                "Request Finance invoice create failed with a transport error"
            ) from error

        try:
            data = response.json()
        except ValueError as error:
            raise RequestFinanceProviderError(
                "Request Finance invoice create returned invalid JSON"
            ) from error
        invoice_id = _response_value(data, "id")
        if not invoice_id:
            raise RequestFinanceProviderError(
                "Request Finance invoice create response missing id"
            )
        return RequestFinanceInvoiceResult(
            request_finance_invoice_id=invoice_id,
            request_id=_response_value(data, "requestId", fallback=request.requestId),
            status=_response_value(data, "status", fallback="created"),
            hosted_url=_first_response_value(
                data,
                "hostedUrl",
                "invoiceUrl",
                "url",
                "view",
                fallback=request.hostedUrl,
            ),
            view_url=_first_response_value(data, "viewUrl", "viewLink", "view"),
            pay_url=_first_response_value(data, "payUrl", "paymentUrl", "payLink", "pay"),
        )

    def list_invoices(self, take: int = 1, skip: int = 0):
        endpoint = urljoin(self.config.api_base_url.rstrip("/") + "/", "invoices")
        try:
            response = self.http_client.get(
                endpoint,
                params={"take": take, "skip": skip},
                headers=self._headers(),
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as error:
            raise RequestFinanceProviderError(
                f"Request Finance read-only smoke failed with HTTP {error.response.status_code}"
            ) from error
        except httpx.HTTPError as error:
            raise RequestFinanceProviderError(
                "Request Finance read-only smoke failed with a transport error"
            ) from error
        return response.json()

    def _headers(self):
        authorization = self.config.api_key
        if self.config.auth_scheme == "oauth_bearer":
            authorization = f"Bearer {self.config.api_key}"
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": authorization,
        }


def build_request_finance_invoice_payload(request: RequestInvoiceCreate):
    invoice_number = request.invoiceNumber or request.requestFinanceInvoiceId
    required_fields = {
        "buyerEmail": request.buyerEmail,
        "invoiceNumber": invoice_number,
        "invoiceItemName": request.invoiceItemName,
        "invoiceCurrency": request.invoiceCurrency,
        "invoiceQuantity": request.invoiceQuantity,
        "invoiceUnitPrice": request.invoiceUnitPrice,
        "paymentCurrency": request.paymentCurrency,
        "paymentNetwork": request.paymentNetwork,
        "paymentAddress": request.paymentAddress,
        "creationDate": request.creationDate,
        "dueDate": request.dueDate,
    }
    missing = [name for name, value in required_fields.items() if value in (None, "")]
    if missing:
        raise RequestFinanceValidationError(
            "Request Finance live invoice create requires: " + ", ".join(missing)
        )

    return {
        "meta": {
            "format": "rnf_invoice",
            "version": "0.0.3",
        },
        "invoiceNumber": invoice_number,
        "buyerInfo": {
            "email": request.buyerEmail,
        },
        "invoiceItems": [
            {
                "currency": request.invoiceCurrency,
                "name": request.invoiceItemName,
                "quantity": request.invoiceQuantity,
                "unitPrice": request.invoiceUnitPrice,
            }
        ],
        "paymentOptions": [
            {
                "type": "wallet",
                "value": {
                    "currencies": [request.paymentCurrency],
                    "paymentInformation": {
                        "paymentAddress": request.paymentAddress,
                        "chain": request.paymentNetwork,
                    },
                },
            }
        ],
        "creationDate": request.creationDate,
        "paymentTerms": {
            "dueDate": request.dueDate,
        },
    }


def _response_value(data: dict, key: str, fallback: str | None = None):
    value = data.get(key)
    if value in (None, ""):
        return fallback
    return value


def _first_response_value(data: dict, *keys: str, fallback: str | None = None):
    for key in keys:
        value = _response_value(data, key)
        if value:
            return value
    links = data.get("links")
    if isinstance(links, dict):
        for key in keys:
            value = _response_value(links, key)
            if value:
                return value
    invoice_links = data.get("invoiceLinks")
    if isinstance(invoice_links, dict):
        for key in keys:
            value = _response_value(invoice_links, key)
            if value:
                return value
    return fallback


def create_request_finance_client(config: RequestFinanceConfig | None = None):
    selected_config = config or RequestFinanceConfig.from_env()
    if selected_config.mode == "mock":
        return MockRequestFinanceClient()
    if selected_config.mode == "live":
        return LiveRequestFinanceClient(selected_config)
    raise RequestFinanceConfigurationError("REQUEST_FINANCE_MODE must be mock or live")
