# P2F Request Finance Live Spike

> 从合并前 [`README-20260613-pre-polish.md`](../backup/README-20260613-pre-polish.md) 拆出。

Request Finance integration is guarded by environment variables and defaults to mock mode:

```text
REQUEST_FINANCE_MODE=mock
REQUEST_FINANCE_API_BASE_URL=https://api.request.finance/
REQUEST_FINANCE_API_KEY=<Render secret env var>
REQUEST_FINANCE_AUTH_SCHEME=api_key
REQUEST_FINANCE_ALLOW_INVOICE_CREATE=false
```

Safety behavior:

- `/version` exposes only non-sensitive status: mode, whether a key is configured, whether the invoice-create guard is enabled, and whether invoice creation is implemented.
- Mock mode keeps the previous `/api/request-invoices` behavior and does not create a live client.
- Live mode fails closed if `REQUEST_FINANCE_API_KEY` or base URL is missing.
- API key auth uses `Authorization: <REQUEST_FINANCE_API_KEY>` with no `Bearer` prefix. `oauth_bearer` is a future explicit auth scheme and is never the default.
- Live mode with the invoice-create guard disabled still records a demo-safe linked invoice record and marks it as `requestFinanceMode=live-readonly`.
- Live off-chain invoice creation is implemented but disabled unless `REQUEST_FINANCE_ALLOW_INVOICE_CREATE=true`; do not enable the guard or call `POST /invoices` without explicit approval and test invoice inputs.
- One approved test/off-chain invoice was created through `POST /invoices` during P2F validation, then the guard was turned back off. This is invoice-record evidence only: no `POST /invoices/{id}`, no on-chain conversion, no CAW transfer, and no payment.
- Live create validates required input/config fields and fails closed when buyer email, invoice number, invoice item, currency, payment option, creation date, or due date fields are missing.
- Live create only targets Request Finance `POST /invoices`; it must not call `POST /invoices/{id}`, convert an invoice to an on-chain request, trigger CAW, or pay.
- Local/Render live smoke may use only `GET /invoices?take=1&skip=0` for read-only validation.
- Audit Report snapshots stay immutable; Request Finance records remain linked external metadata.

## 相关

- 环境变量：[`ENV_VARS.md`](ENV_VARS.md)
- P2 API 全表：[`P2_APIS.md`](P2_APIS.md)
