# Request Network Invoice Records Draft

Status: draft  
Mode: mock  
External systems touched: false

## Purpose

Prepare a local invoice-record shape that can later map AgentCFO payment items to Request Network requests. This document does not create Request Network requests, configure payment gateways, sign payloads, register webhooks, or call Request Network APIs.

Official concepts:

- Request Network represents payment requests and payment lifecycle concepts.
- Request records can be used for invoice/payment reconciliation.
- Future integration must use official Request Network SDK/API details supplied by the integration owner.

References:

- https://docs.request.network/
- https://docs.request.network/general/lifecycle-of-a-request

## Mock Schema Shape

```json
{
  "invoiceRecordId": "invoice_draft_001",
  "paymentPlanId": "plan_demo_001",
  "paymentItemId": "pay_001",
  "source": "mock",
  "status": "draft",
  "externalSystemTouched": false,
  "externalRequestId": null,
  "paymentReference": null,
  "recipient": "Alice",
  "wallet": "0xAlice",
  "amount": 20,
  "token": "USDC",
  "notes": "Draft invoice record only; no Request Network request exists."
}
```

## Required Future Inputs

- Official SDK/API choice and version.
- Auth model and environment names.
- Request creation payload fields.
- Payment reference rules.
- Webhook or polling strategy.
- Mapping from AgentCFO `paymentItemId` to external request id.

## Fail-Closed Boundary

- Do not mark `status` as issued/paid unless Request Network evidence exists.
- Do not populate `externalRequestId` from a mock value.
- Do not create or modify runtime payment execution based on this draft.
