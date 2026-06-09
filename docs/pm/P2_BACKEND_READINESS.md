# AgentCFO Backend P2 Readiness

Date: 2026-06-09

## Decision

Backend can start P2 design and an isolated spike, but P2 implementation is not approved yet.

Recommended first P2 item: Request Network invoice records. It is the least disruptive option because it can be modeled as invoice metadata linked to existing payment plan items, without changing the current CAW payment execution path, deterministic risk checks, or Audit Report immutability.

Do not implement Request Network, Sablier, Safe, multichain, or multi-agent treasury until P2 implementation is explicitly approved.

## Current Gates

| Gate | Status |
| --- | --- |
| P0 backend mock flow | Complete |
| P1 Render demo release | Complete |
| Render persistence | Current release is mock-demo + ephemeral SQLite, not persistent evidence storage |
| CAW evidence | Exactly 1 low-value testnet tx; not 3 tx |
| Live CAW transfers | Human approval required before any additional transfer |
| P2 implementation | Not approved |

## Recommendation

Start with design-level Request Network invoice records:

1. Add an invoice-record concept that references existing `paymentPlanId` and `paymentItemId`.
2. Keep invoice records read-only/demo-safe until an integration decision is approved.
3. Do not alter `POST /api/execute-payment`, CAW adapter behavior, or risk rules.
4. Keep Audit Report snapshots immutable; if invoices are shown, include them as linked evidence or metadata.
5. Add tests for invoice record creation/lookup only after implementation is approved.

## Why Not Other P2 Items First

| Candidate | Readiness | Reason |
| --- | --- | --- |
| Request Network invoice records | Design/spike ready | Minimal impact on CAW payment execution path |
| Sablier payroll / streams | Not ready | Changes payment semantics and likely requires new approval/risk rules |
| Safe module references | Not ready | Adds wallet governance complexity outside current CAW adapter boundary |
| Multichain | Not ready | Conflicts with current single testnet/token allowlist assumptions |
| Multi-agent treasury | Not ready | Requires architecture and authorization redesign |

## Human-only Blockers

- Persistent Render evidence storage requires approval for either Render persistent disk plus `AGENTCFO_DB_PATH`, or Postgres schema/migration work.
- Three real CAW tx hashes require explicit approval for at least two additional low-value testnet transfers.
- Frontend display changes are required if the UI must split Audit Report snapshot from Latest CAW Status.
- PM must decide whether the final submission claims 1 tx evidence or continues pursuing the 3 tx target.

## Remaining Risks

- Render online evidence is mock-demo only and can reset because SQLite is ephemeral.
- Current CAW evidence proves one low-value testnet transfer only.
- P2 implementation could accidentally expand the payment authorization surface if started before Request Network scope is written down and approved.
