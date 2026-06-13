# P2 Demo-safe Extension APIs

> 从合并前 [`README-20260613-pre-polish.md`](../backup/README-20260613-pre-polish.md) 拆出。

These APIs are metadata, preview, or reference only. They do not change P0/P1 payment authorization, deterministic risk checks, CAW adapter behavior, or immutable Audit Report snapshots.

| API | Status | Live external action |
| --- | --- | --- |
| `POST /api/external-references` | Generic external evidence metadata | None |
| `GET /api/external-references/{externalReferenceId}` | Read external metadata | None |
| `GET /api/external-references?paymentPlanId=...` | List linked metadata | None |
| `POST /api/request-invoices` | Mock Request invoice record by default; live path is env-gated and approval-gated | No live invoice creation unless explicitly approved |
| `GET /api/request-invoices/{externalReferenceId}` | Read mock Request invoice record | None |
| `POST /api/sablier-stream-previews` | Preview duration/rate for a future stream | No Sablier stream creation |
| `POST /api/safe-permission-references` | Reference-only Safe permission note | No Safe module enablement/deployment |
| `GET /api/multichain-readiness` | Design/readiness matrix | No new chain execution |
| `GET /api/treasury-budget-partitions/{paymentPlanId}` | Mock department-agent budget view | No new authorization role |
| `GET /api/p2/evidence-timeline/{auditReportId}` | Aggregates Audit Report, CAW status, and linked P2 references for display | None |
| `GET /api/p2/readiness/{auditReportId}` | Machine-readable P2 integrity/readiness summary, linked reference counts, missing links, and safety flags | None |
| `GET /api/p2/demo-scenarios` | Deterministic judge/demo scenario pack | None |
| `POST /api/p2/risk-what-if` | Simulation-only risk guardrail preview using deterministic rules | No plan persistence or payment execution |
| `GET /api/p2/policy-guardrails` | Non-secret demo safety flags for CAW, Request Finance, Sablier, Safe, multichain, and audit immutability | None |
| `GET /api/p2/evidence-export/{auditReportId}` | Markdown-ready evidence package for PM/demo copy | None |
| `POST /api/p2/request-finance/preflight` | Validates Request Finance create-invoice payload shape without creating a provider client | No Request Finance API call |
| `GET /api/p2/planner-explainability` | LLM planner boundary, Structured Outputs posture, malformed-output fallback, and reason trace | No model call |
| `POST /api/p2/request-finance/lifecycle-preview` | Mock invoice lifecycle/event log for created/accepted/canceled/rejected/paid | No provider call, no email, no on-chain conversion |
| `POST /api/p2/request-finance/webhook-replay` | Request Finance invoice lifecycle webhook replay mock v2 with idempotent event timeline and terminal-state ignore policy | No provider call, no email, no on-chain conversion, no payment |
| `POST /api/p2/sablier/payroll-simulation` | Simulation-only payroll schedule/accrual/withdrawable/runway/insolvency guardrails | No Sablier stream or transaction |
| `POST /api/p2/safe/guard-policy-dry-run` | Safe owner threshold, module checklist, guard policy matrix, blocked operations | No Safe module/guard enablement or execution |
| `POST /api/p2/treasury/coordination-simulation` | Mock department-agent proposals, budget caps, conflicts, approval matrix, audit timeline | No new authorization role |
| `GET /api/demo/runbook` | Ordered demo steps, expected badges, forbidden claims | None |
| `GET /api/demo/storyboard` | Presentation storyboard frames | None |
| `GET /api/demo/blocked-examples` | Stable blocked examples for frontend/PM copy | None |
| `GET /api/demo/contracts` | Frontend response-contract index and global invariants | None |
| `GET /api/demo/contracts/openapi-lite` | Machine-readable P0/P2 endpoint contracts, required fields, examples, safety flags, and display hints | None |

`GET /api/demo/contracts/openapi-lite` is a custom contract endpoint. FastAPI public `/docs` and `/openapi.json` remain disabled; this endpoint does not expose secrets, environment values, raw provider payloads, private wallet details, or live-action configuration.

## P2 implementation references

- Request Network / Request Finance: live client/status path is env-gated; live read-only smoke is allowed with configured credentials, and off-chain invoice create is implemented but disabled by default after the approved single test/off-chain invoice run.
- LLM planner explainability: references OpenAI Structured Outputs concepts such as `json_schema`, strict schema adherence, and fail-closed validation, but the endpoint itself performs no model call.
- Sablier Flow: simulation uses rate-per-second, withdrawable/accrued amount, covered/uncovered debt, and lifecycle-state vocabulary for demo math only; future live payroll requires wallet/signature approval and new risk rules before stream creation.
- Safe modules/guards: dry-run uses owner threshold, module, and guard concepts for comparison only; future Safe work requires owner approval and security review before enablement or deployment.
- Multi-chain: current real execution boundary remains the existing CAW testnet/token allowlist.
- Multi-agent treasury: current mock partition view is advisory only; human approval and deterministic risk checks remain the only execution gates.

P2 live integrations are not enabled by default. Do not claim Request Finance invoice creation evidence, Sablier, Safe, multichain execution, or multi-agent authorization is live without explicit approval, credentials, and new tests.

Frontend/PM handoff for the demo-safe P2 surface is in [`docs/pm/P2_DEMO_HANDOFF.md`](../pm/P2_DEMO_HANDOFF.md). Backend owns machine-readable contracts and simulation endpoints; PM/frontend own scenario prose, presenter notes, storyboard UI, and forbidden-claims copy packaging.
