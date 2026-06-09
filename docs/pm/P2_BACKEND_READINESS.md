# AgentCFO Backend P2 Readiness

Date: 2026-06-09

## Decision

Backend has completed a demo-safe P2 backend spike and a P2F Request Finance live-client spike. The shipped scope remains metadata, preview, reference, and read-only live validation; live Request Finance invoice creation is still not approved.

Request Network invoice records were implemented first because they are the least disruptive P2 path: they link invoice metadata to existing payment plan items, Audit Reports, and CAW request ids without changing the CAW payment execution path, deterministic risk checks, or Audit Report immutability.

Do not enable live Request Finance invoice creation, Sablier, Safe, multichain execution, or multi-agent authorization until explicitly approved.

Frontend and PM handoff for the demo-safe P2 surface is documented in [`P2_DEMO_HANDOFF.md`](P2_DEMO_HANDOFF.md), including curl examples, frontend field contracts, UI task guidance, and approved demo wording.

## Current Gates

| Gate | Status |
| --- | --- |
| P0 backend mock flow | Complete |
| P1 Render demo release | Complete |
| Render persistence | Current release is mock-demo + ephemeral SQLite, not persistent evidence storage |
| CAW evidence | Exactly 1 low-value testnet tx; not 3 tx |
| Live CAW transfers | Human approval required before any additional transfer |
| P2 demo-safe backend spike | Complete |
| P2F Request Finance live client/read-only smoke path | Complete locally; Render env must be configured before online live smoke |
| P2 live invoice creation | Not approved |

## Completed Backend Scope

| Phase | Status | What exists | Live action |
| --- | --- | --- | --- |
| P2-0 External references | Complete | `POST/GET /api/external-references` metadata foundation | None |
| P2A Request invoice records | Complete | Mock Request invoice records linked to payment/audit/CAW ids | No Request Finance API call |
| P2B Sablier preview | Complete | Preview-only stream duration/rate calculation | No stream creation |
| P2C Safe references | Complete | Reference-only Safe permission note | No module enablement/deployment |
| P2D Multi-chain readiness | Complete | Readiness matrix | No new chain execution |
| P2E Multi-agent budget partition | Complete | Mock department-agent budget view | No new authorization role |
| P2F Request Finance live spike | Complete | Env-gated config/client/status path; read-only smoke path | No invoice creation without approval |

## Implementation Notes

1. External references are metadata-only records.
2. Request invoice records store mock/demo-safe fields such as `requestFinanceInvoiceId`, `requestId`, `hostedUrl`, `status`, and optional `txHashReference`.
3. Sablier previews calculate `durationSeconds` and `ratePerSecond` from existing payment items.
4. Safe references record future permission notes but keep `moduleEnabled=false`.
5. Multi-chain readiness keeps Sepolia/SETH as the only current real execution boundary.
6. Multi-agent budget partition is advisory and keeps `authorizationChanged=false`.
7. Audit Report snapshots remain immutable; linked P2 metadata is stored separately.
8. P2F Request Finance live mode fails closed if credentials are missing and blocks invoice creation unless explicitly approval-gated.

## Why Not Other P2 Items First

| Candidate | Readiness | Reason |
| --- | --- | --- |
| Request Network invoice records | Demo-safe backend complete; live client/read-only path added | Needs Request Finance API key and approval before invoice creation |
| Sablier payroll / streams | Preview complete; live not ready | Live streams need wallet/signature approval and new risk rules |
| Safe module references | Reference metadata complete; live not ready | Safe module enablement needs owner approval/security review |
| Multichain | Readiness complete; live not ready | Real execution must stay inside current CAW allowlist until approved |
| Multi-agent treasury | Mock budget view complete; live authorization not ready | New authorization roles need architecture approval |

## Reference Docs Checked

- Request Network docs: API supports programmatic payment destinations, secure payments, payouts, and webhooks; AgentCFO currently stores mock invoice metadata and has an env-gated Request Finance client/read-only smoke path.
- Sablier docs: Sablier is a token distribution protocol; AgentCFO currently calculates preview-only stream rates and creates no stream.
- Safe Modules docs: modules can add automated/custom transaction logic and can execute transactions through Safe module paths; AgentCFO currently stores reference notes only and enables no module.

## Human-only Blockers

- Persistent Render evidence storage requires approval for either Render persistent disk plus `AGENTCFO_DB_PATH`, or Postgres schema/migration work.
- Three real CAW tx hashes require explicit approval for at least two additional low-value testnet transfers.
- Frontend display changes are required if the UI must split Audit Report snapshot from Latest CAW Status.
- PM must decide whether the final submission claims 1 tx evidence or continues pursuing the 3 tx target.
- Live Request Finance invoice creation requires a Request Finance API key, explicit approval, and enabling the invoice-create guard.
- Live Sablier streams, Safe modules, new chains, and multi-agent authorization require explicit approval and additional tests.

## Remaining Risks

- Render online evidence is mock-demo only and can reset because SQLite is ephemeral.
- Current CAW evidence proves one low-value testnet transfer only.
- P2 live implementation could accidentally expand the payment authorization surface if started from preview metadata without a separate approval/risk design.
- Render live Request Finance mode must not be presented as persistent invoice evidence unless a real approved test invoice is created and stored with verifiable evidence.
