# AgentCFO Backend P2 Readiness

Date: 2026-06-09

## Decision

Backend has completed a demo-safe P2 backend spike and a P2F Request Finance live-client spike. The shipped scope remains metadata, preview, reference, read-only live validation, and an approval-gated off-chain invoice create path. One explicitly approved Request Finance test/off-chain invoice was created for validation, then the create guard was turned back off; this did not call `POST /invoices/{id}`, convert on-chain, trigger CAW, or pay.

Request Network invoice records were implemented first because they are the least disruptive P2 path: they link invoice metadata to existing payment plan items, Audit Reports, and CAW request ids without changing the CAW payment execution path, deterministic risk checks, or Audit Report immutability.

Do not enable additional live Request Finance invoice creation, Sablier, Safe, multichain execution, or multi-agent authorization until explicitly approved.

Frontend and PM handoff for the demo-safe P2 surface is documented in [`P2_DEMO_HANDOFF.md`](P2_DEMO_HANDOFF.md). Backend-owned scope is limited to machine-readable contracts, metadata, and mock/simulation endpoints; PM/frontend own scenario prose, presenter notes, storyboard UI, and forbidden-claims copy packaging.

## Current Gates

| Gate | Status |
| --- | --- |
| P0 backend mock flow | Complete |
| P1 Render demo release | Complete |
| Render persistence | Current release is mock-demo + ephemeral SQLite, not persistent evidence storage |
| CAW evidence | Exactly 1 low-value testnet tx; not 3 tx |
| Live CAW transfers | Human approval required before any additional transfer |
| P2 demo-safe backend spike | Complete |
| P2F Request Finance live client/read-only smoke path | Complete locally and online when Render env is configured |
| P2 live off-chain invoice creation | Implemented behind `REQUEST_FINANCE_ALLOW_INVOICE_CREATE=true`; exactly one approved test/off-chain invoice was created, guard is back off |

## Completed Backend Scope

| Phase | Status | What exists | Live action |
| --- | --- | --- | --- |
| P2-0 External references | Complete | `POST/GET /api/external-references` metadata foundation | None |
| P2A Request invoice records | Complete | Mock Request invoice records linked to payment/audit/CAW ids | No Request Finance API call |
| P2B Sablier preview | Complete | Preview-only stream duration/rate calculation | No stream creation |
| P2C Safe references | Complete | Reference-only Safe permission note | No module enablement/deployment |
| P2D Multi-chain readiness | Complete | Readiness matrix | No new chain execution |
| P2E Multi-agent budget partition | Complete | Mock department-agent budget view | No new authorization role |
| P2F Request Finance live spike | Complete | Env-gated config/client/status/read-only path; disabled-by-default off-chain create mapper/client path | No additional invoice creation without approval |
| P2-G1 Evidence timeline | Complete | `GET /api/p2/evidence-timeline/{auditReportId}` aggregates audit, CAW status, and linked P2 references | None |
| P2-G2 Demo scenario pack | Complete | `GET /api/p2/demo-scenarios` returns deterministic judge/demo scenarios | None |
| P2-G3 Risk what-if | Complete | `POST /api/p2/risk-what-if` simulates deterministic guardrails without persistence | No payment plan or execution |
| P2-G4 Policy guardrails | Complete | `GET /api/p2/policy-guardrails` exposes non-secret safety flags | None |
| P2-G5 Evidence export | Complete | `GET /api/p2/evidence-export/{auditReportId}` returns PM-ready evidence packaging | None |
| P2-G6 Request Finance preflight | Complete | `POST /api/p2/request-finance/preflight` validates live-create inputs without provider calls | No Request Finance API call |
| P2-G7 Version capabilities | Complete | `/version.p2Capabilities` exposes non-secret capability flags | None |
| P2-H1 Planner explainability | Complete | `GET /api/p2/planner-explainability` exposes LLM boundaries, Structured Outputs posture, fallback demo, and reason trace | No model call |
| P2-H2 Request lifecycle mock | Complete | `POST /api/p2/request-finance/lifecycle-preview` returns mock invoice event log/status timeline | No provider call, email, on-chain conversion, or payment |
| P2-H3 Sablier payroll simulation | Complete | `POST /api/p2/sablier/payroll-simulation` simulates accrual, withdrawable amount, runway, insolvency, and guardrails | No stream or transaction |
| P2-H4 Safe guard dry-run | Complete | `POST /api/p2/safe/guard-policy-dry-run` simulates threshold/module/guard policy results | No Safe enablement/deployment/execution |
| P2-H5 Multi-agent coordination | Complete | `POST /api/p2/treasury/coordination-simulation` simulates proposals, budget caps, conflicts, approval matrix, and audit timeline | No authorization change |
| P2-H6 Demo runbook/contracts | Complete | `/api/demo/runbook`, `/api/demo/storyboard`, `/api/demo/blocked-examples`, `/api/demo/contracts` support PM/frontend storytelling | None |
| P2-I1 OpenAPI-lite contracts | Complete | `GET /api/demo/contracts/openapi-lite` exposes custom machine-readable P0/P2 endpoint contracts while FastAPI public docs stay disabled | None |
| P2-I2 Request Finance webhook replay mock v2 | Complete | `POST /api/p2/request-finance/webhook-replay` records idempotent mock invoice lifecycle events linked to payment/audit/CAW ids | No provider call, email, on-chain conversion, or payment |

## Implementation Notes

1. External references are metadata-only records.
2. Request invoice records store mock/demo-safe fields such as `requestFinanceInvoiceId`, `requestId`, `hostedUrl`, `status`, and optional `txHashReference`.
3. Sablier previews calculate `durationSeconds` and `ratePerSecond` from existing payment items.
4. Safe references record future permission notes but keep `moduleEnabled=false`.
5. Multi-chain readiness keeps Sepolia/SETH as the only current real execution boundary.
6. Multi-agent budget partition is advisory and keeps `authorizationChanged=false`.
7. Audit Report snapshots remain immutable; linked P2 metadata is stored separately.
8. P2F Request Finance live mode fails closed if credentials are missing and blocks invoice creation unless explicitly approval-gated.
9. Request Finance API-key auth uses the raw API key in the `Authorization` header; OAuth/Bearer is a future explicit auth-scheme path, not the default.
10. Request Finance off-chain create maps the minimum invoice payload fields and only targets `POST /invoices`; it must not call `POST /invoices/{id}`, convert an invoice to an on-chain request, trigger CAW, or pay.
11. P2-G1 through P2-G7 add display, simulation, preflight, and PM-export surfaces only; they do not change P0/P1 payment authorization, CAW adapter behavior, deterministic risk checks, or Audit Report snapshots.
12. P2-H1 through P2-H6 expand storytelling breadth only: planner explainability, invoice lifecycle mock, Sablier payroll math, Safe guard dry-run, multi-agent coordination, and demo contracts.
13. P2-I1 and P2-I2 are backend-owned demo utilities only: OpenAPI-lite contracts for frontend integration and Request Finance webhook replay mock v2 for lifecycle-event validation.
14. PM/frontend own scenario prose, presenter notes, storyboard UI, and forbidden-claims copy packaging; these are not backend execution features.

## Why Not Other P2 Items First

| Candidate | Readiness | Reason |
| --- | --- | --- |
| Request Network invoice records | Demo-safe backend complete; live client/read-only path and disabled-by-default off-chain create path added | Needs explicit approval and test invoice inputs before any additional invoice creation |
| Sablier payroll / streams | Preview complete; live not ready | Live streams need wallet/signature approval and new risk rules |
| Safe module references | Reference metadata complete; live not ready | Safe module enablement needs owner approval/security review |
| Multichain | Readiness complete; live not ready | Real execution must stay inside current CAW allowlist until approved |
| Multi-agent treasury | Mock budget view complete; live authorization not ready | New authorization roles need architecture approval |

## Reference Docs Checked

- Request Network docs: API supports programmatic payment destinations, secure payments, payouts, and webhooks; AgentCFO currently stores mock/live-readonly invoice metadata and has an env-gated Request Finance client/read-only smoke path. API-key auth uses `Authorization: <api-key>`, read-only smoke uses `GET /invoices?take=1&skip=0`, off-chain create uses `POST /invoices`, and on-chain conversion is a separate forbidden `POST /invoices/{id}` step.
- FastAPI docs: the public docs UI and generated OpenAPI path remain disabled in app configuration; AgentCFO uses `GET /api/demo/contracts/openapi-lite` as a custom non-secret contract endpoint instead.
- OpenAI docs: Structured Outputs are represented as strict `json_schema` posture; AgentCFO exposes this as planner explainability metadata only and still validates before risk checks.
- Sablier docs: Flow concepts such as rate per second, withdrawable/accrued amount, covered/uncovered debt, and stream lifecycle vocabulary are used for simulation only; AgentCFO creates no stream.
- Safe Modules/Guards docs: owners, threshold, modules, and guards are used for dry-run policy comparison only; AgentCFO enables no module or guard.

## Human-only Blockers

- Persistent Render evidence storage requires approval for either Render persistent disk plus `AGENTCFO_DB_PATH`, or Postgres schema/migration work.
- Three real CAW tx hashes require explicit approval for at least two additional low-value testnet transfers.
- Frontend display changes are required if the UI must split Audit Report snapshot from Latest CAW Status.
- PM must decide whether the final submission claims 1 tx evidence or continues pursuing the 3 tx target.
- Any additional live Request Finance invoice creation requires explicit approval, enabling the invoice-create guard, and human-provided test invoice inputs: buyer email, invoice number/prefix, item name, currency, payment option/network/token/address, and maximum test amount.
- Live Sablier streams, Safe modules, new chains, and multi-agent authorization require explicit approval and additional tests.

## Remaining Risks

- Render online evidence is mock-demo only and can reset because SQLite is ephemeral.
- Current CAW evidence proves one low-value testnet transfer only.
- P2 live implementation could accidentally expand the payment authorization surface if started from preview metadata without a separate approval/risk design.
- Render live Request Finance mode must not be presented as durable invoice evidence unless persistent storage is attached and the approved test invoice metadata survives redeploy/restart verification.
