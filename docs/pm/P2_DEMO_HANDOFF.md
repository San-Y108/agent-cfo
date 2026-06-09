# AgentCFO P2 Demo Handoff

Date: 2026-06-09

Backend status: demo-safe P2 surface is available for presentation and frontend integration. It is metadata, preview, reference, and mock by default. P2F adds an env-gated Request Finance live-client/read-only smoke path, but it does not enable live invoice creation without explicit approval. It does not enable Sablier streams, Safe modules, multichain execution, or multi-agent authorization.

Online backend base URL:

```text
https://agentcfo-backend.onrender.com
```

## Demo Boundary

Show P2 as a linked-evidence preview layer on top of the completed P0/P1 flow.

Allowed demo claims:

- P2 APIs can attach external reference metadata to a payment plan item, Audit Report id, and CAW request id.
- Request invoice records are mock/demo-safe records by default.
- Request Finance live mode can expose non-sensitive status and read-only smoke validation when explicitly configured.
- Sablier payroll is preview-only and creates no stream.
- Safe module work is reference-only and enables no module.
- Multichain is readiness/design-only and does not add a new execution chain.
- Multi-agent treasury is a mock budget partition view and does not change authorization.

Do not claim:

- Live Request Finance invoice creation is complete.
- A real Sablier stream was created.
- A Safe module was enabled or deployed.
- New multichain execution is live.
- Multi-agent authorization is live.
- CAW evidence has three real tx hashes. Current real CAW evidence remains exactly one low-value testnet tx.

## Frontend Flow

1. Load `/api/demo-sample`.
2. Create a P0 payment plan with `POST /api/payment-plan`.
3. Run `POST /api/risk-check`.
4. Run mock execution with `POST /api/execute-payment`.
5. Use the returned `paymentPlanId`, payment item `id`, `auditReportId`, and `cawRequestId` to create/read P2 preview records.
6. Render P2 in a separate `P2 Preview / Linked Evidence` area. Do not merge P2 metadata into the immutable Audit Report snapshot.

## P0 Setup Curl

```bash
BASE_URL="https://agentcfo-backend.onrender.com"

curl -s "$BASE_URL/api/demo-sample"

curl -s -X POST "$BASE_URL/api/payment-plan" \
  -H "Content-Type: application/json" \
  -d '{
    "contributions": [
      {
        "name": "Alice",
        "role": "Content Contributor",
        "task": "Wrote event recap article",
        "wallet": "0xAlice",
        "amount": 20,
        "token": "USDC"
      },
      {
        "name": "Charlie",
        "role": "Community Operator",
        "task": "Managed community and exported data",
        "wallet": "0xCharlie",
        "amount": 10,
        "token": "USDC"
      }
    ],
    "budgetRule": {
      "monthlyBudget": 50,
      "singlePaymentLimit": 25,
      "allowedToken": "USDC",
      "whitelist": ["0xAlice", "0xCharlie"],
      "requiresHumanApproval": true
    }
  }'
```

Then run risk check and mock execution with ids from the payment-plan response:

```bash
curl -s -X POST "$BASE_URL/api/risk-check" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentPlanId": "plan_demo_001",
    "budgetRule": {
      "monthlyBudget": 50,
      "singlePaymentLimit": 25,
      "allowedToken": "USDC",
      "whitelist": ["0xAlice", "0xCharlie"],
      "requiresHumanApproval": true
    }
  }'

curl -s -X POST "$BASE_URL/api/execute-payment" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentPlanId": "plan_demo_001",
    "approvedPaymentIds": ["pay_demo_001"],
    "humanApproval": {
      "approved": true,
      "approvedBy": "p2-demo"
    }
  }'
```

Expected P0 execution boundary on Render mock-demo:

- `mode`: `mock`
- `txHash`: `null`
- `cawRequestId`: present on each attempted payment
- no live CAW transfer

Expected Request Finance boundary:

- default `REQUEST_FINANCE_MODE`: `mock`
- `/version` may expose `requestFinance.mode`, `requestFinance.apiKeyConfigured`, `requestFinance.invoiceCreateGuardEnabled`, and `requestFinance.invoiceCreateImplemented`
- `apiKeyConfigured` is boolean only and never returns the key
- real invoice creation is not implemented in this spike and remains blocked unless explicitly approved in a later step

## P2 API Curl Examples

Create an external reference:

```bash
curl -s -X POST "$BASE_URL/api/external-references" \
  -H "Content-Type: application/json" \
  -d '{
    "referenceType": "request_invoice",
    "provider": "request-network",
    "label": "Invoice evidence for Alice recap",
    "paymentPlanId": "plan_demo_001",
    "paymentItemId": "pay_demo_001",
    "auditReportId": "audit_demo_001",
    "cawRequestId": "caw_mock_001",
    "status": "mock_recorded",
    "metadata": {
      "hostedUrl": "https://example.invalid/invoice/demo"
    }
  }'
```

Read an external reference:

```bash
curl -s "$BASE_URL/api/external-references/ext_ref_001"
```

List external references for a payment plan:

```bash
curl -s "$BASE_URL/api/external-references?paymentPlanId=plan_demo_001"
```

Create a mock/default Request invoice record:

```bash
curl -s -X POST "$BASE_URL/api/request-invoices" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentPlanId": "plan_demo_001",
    "paymentItemId": "pay_demo_001",
    "auditReportId": "audit_demo_001",
    "cawRequestId": "caw_mock_001",
    "requestFinanceInvoiceId": "rf_demo_001",
    "requestId": "request_demo_001",
    "status": "draft",
    "hostedUrl": "https://example.invalid/request/rf_demo_001",
    "txHashReference": null
  }'
```

Read a mock Request invoice record:

```bash
curl -s "$BASE_URL/api/request-invoices/ext_ref_001"
```

Create a Sablier stream preview:

```bash
curl -s -X POST "$BASE_URL/api/sablier-stream-previews" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentPlanId": "plan_demo_001",
    "paymentItemId": "pay_demo_001",
    "durationDays": 30
  }'
```

Create a Safe permission reference:

```bash
curl -s -X POST "$BASE_URL/api/safe-permission-references" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentPlanId": "plan_demo_001",
    "safeAddress": "0xSafeDemo",
    "moduleName": "SpendingLimitModule",
    "permissionNotes": ["future owner-threshold approval reference"]
  }'
```

Read multichain readiness:

```bash
curl -s "$BASE_URL/api/multichain-readiness"
```

Read treasury budget partitions:

```bash
curl -s "$BASE_URL/api/treasury-budget-partitions/plan_demo_001"
```

## Frontend Field Contract

`ExternalReference`:

- `externalReferenceId`: string
- `referenceType`: `request_invoice`, `sablier_stream_preview`, `safe_permission_reference`, or `multichain_readiness`
- `provider`: string
- `label`: string
- `paymentPlanId`: string or null
- `paymentItemId`: string or null
- `auditReportId`: string or null
- `cawRequestId`: string or null
- `status`: string
- `metadata`: object
- `mode`: `metadata-only`
- `liveIntegrationEnabled`: false
- `createdAt`: ISO timestamp string

`RequestInvoiceRecord`:

- `externalReferenceId`: string
- `paymentPlanId`: string
- `paymentItemId`: string
- `auditReportId`: string or null
- `cawRequestId`: string or null
- `requestFinanceInvoiceId`: string
- `requestId`: string or null
- `status`: string
- `hostedUrl`: string or null
- `txHashReference`: string or null
- `externalReference`: `ExternalReference`

`/version` Request Finance status:

- `requestFinance.mode`: `mock`, `live`, or `unknown`
- `requestFinance.apiKeyConfigured`: boolean
- `requestFinance.invoiceCreateGuardEnabled`: boolean
- `requestFinance.invoiceCreateImplemented`: false

`SablierStreamPreview`:

- `externalReferenceId`: string
- `mode`: `preview-only`
- `streamCreated`: false
- `paymentPlanId`: string
- `paymentItemId`: string
- `recipient`: string
- `wallet`: string
- `amount`: number
- `token`: string
- `durationDays`: number
- `durationSeconds`: number
- `ratePerSecond`: number
- `safetyNotes`: string[]

`SafePermissionReference`:

- `externalReferenceId`: string
- `mode`: `reference-only`
- `moduleEnabled`: false
- `paymentPlanId`: string
- `safeAddress`: string
- `moduleName`: string
- `permissionNotes`: string[]
- `safetyNotes`: string[]

`MultichainReadiness`:

- `currentExecutionBoundary`: object
- `liveMultichainExecutionEnabled`: false
- `chains`: object[]
- `safetyNotes`: string[]

`TreasuryBudgetPartition`:

- `mode`: `mock-budget-partition`
- `authorizationChanged`: false
- `paymentPlanId`: string
- `totalPlannedAmount`: number
- `partitions`: object[]
- `safetyNotes`: string[]

## Frontend Task

Frontend repository is not present in the current backend workspace. Implement this as a frontend task:

- Add a `P2 Preview / Linked Evidence` section near the completed payment/audit view.
- Keep Audit Report snapshot read-only and separate from linked P2 metadata.
- Display badges from backend fields: `metadata-only`, `mock invoice`, `preview-only`, `reference-only`, `design-only`, `mock-budget-partition`.
- For Request invoice records, show `requestFinanceInvoiceId`, `requestId`, `status`, `hostedUrl`, `paymentItemId`, `auditReportId`, and `cawRequestId`.
- If `/version.requestFinance.mode=live`, show it as "Request Finance live client configured" only; do not label invoice creation complete unless a test invoice was explicitly approved and created.
- For Sablier preview, show `streamCreated=false`, `durationDays`, `durationSeconds`, `ratePerSecond`, `recipient`, `wallet`, `amount`, and `token`.
- For Safe reference, show `moduleEnabled=false`, `safeAddress`, `moduleName`, and `permissionNotes`.
- For multichain readiness, show `liveMultichainExecutionEnabled=false` and the readiness rows.
- For treasury budget partitions, show `authorizationChanged=false`, `totalPlannedAmount`, and partition rows.

## PM And Video Wording

Recommended wording:

- "P2 adds a demo-safe linked evidence layer on top of the completed P0/P1 payment flow."
- "The Request invoice record is linked to the payment plan item, Audit Report id, and CAW request id. By default it is mock/demo-safe; P2F adds an env-gated live client and read-only smoke path."
- "Sablier is shown as a payroll stream preview only; no stream is created."
- "Safe and multichain are readiness/reference surfaces only."
- "The multi-agent treasury view is advisory and does not change payment authorization."
- "Current real CAW evidence remains one low-value testnet transaction; Render mock-demo execution returns mock mode and no tx hash."
- "Live Request Finance invoice creation is not claimed unless a separate approved test invoice is created."

Avoid wording:

- "Request Finance live invoice creation is done."
- "A Sablier stream was created."
- "Safe module automation is enabled."
- "Multichain execution is live."
- "Multi-agent approval is live."
- "We have three real CAW tx hashes."

## Human-only Blockers

- Live Request Finance invoice creation requires an API key, explicit approval, and enabling the invoice-create guard.
- Live Sablier streams require wallet/signature approval, new risk rules, and tests.
- Live Safe module enablement requires owner approval and security review.
- New multichain execution requires CAW allowlist/config approval and tests.
- Additional real CAW tx hashes require explicit approval for more low-value testnet transfers.
- Persistent Render evidence storage requires approving a persistent disk path or Postgres work.
